



// // import pkg from 'whatsapp-web.js';
// // import apiService from "../../services/apiService.js";
// // import handlePaymentVerification from './paymentVerificationHandler.js';
// // import notificationManager from "../../services/notifications/notification-manager.js";
// // // ✅ ADDED: Import companyConfig for getting order flow mode
// // import companyConfig from '../../shared/companyConfig.js';
// // // ✅ ADDED: Import address parser utility
// // import { parseCombinedAddress, getAddressFormatInstructions } from '../../utils/addressParser.js';

// // const { MessageMedia } = pkg;

// // // Safe number utilities
// // const safeNumber = (value, defaultValue = 0) => {
// //     if (value === null || value === undefined) return defaultValue;
// //     if (typeof value === 'number') return value;
// //     const parsed = parseFloat(value);
// //     return isNaN(parsed) ? defaultValue : parsed;
// // };

// // const safeToFixed = (value, digits = 2) => {
// //     const num = safeNumber(value);
// //     return num.toFixed(digits);
// // };

// // /**
// //  * Format custom ID to 5-digit format (00123)
// //  */
// // const formatCustomId = (id) => {
// //     if (!id && id !== 0) return null;
// //     return String(id).padStart(5, '0');
// // };

// // /**
// //  * Parse custom ID from various formats
// //  * Supports: "123", "00123", 123, "PRD-00123", etc.
// //  */
// // const parseCustomId = (input) => {
// //     if (!input) return null;
    
// //     // Convert to string and clean
// //     let str = String(input).trim();
    
// //     // Remove any non-digit characters
// //     const digits = str.replace(/\D/g, '');
    
// //     // If we have digits, parse as number
// //     if (digits.length > 0) {
// //         return parseInt(digits, 10);
// //     }
    
// //     return null;
// // };

// // // Format address for display
// // const formatAddressString = (addressObj) => {
// //     if (!addressObj) return '';
// //     if (typeof addressObj === 'string') return addressObj;
    
// //     const parts = [];
// //     if (addressObj.doorNumber) parts.push(addressObj.doorNumber);
// //     if (addressObj.streetName) parts.push(addressObj.streetName);
// //     if (addressObj.areaLocality) parts.push(addressObj.areaLocality);
// //     if (addressObj.cityDistrict) parts.push(addressObj.cityDistrict);
// //     if (addressObj.state) parts.push(addressObj.state);
// //     if (addressObj.pincode) parts.push(addressObj.pincode);
    
// //     return parts.join(', ');
// // };

// // export async function handleOrderFlow(message, client, userSession, userSessions) {
// //     const userMessage = message.body.trim();
// //     const from = message.from;

// //     try {
// //         // ✅ CRITICAL FIX: Ensure orderFlowMode is ALWAYS set in session for ALL users
// //         if (!userSession.orderFlowMode) {
// //             console.log('🔍 [DEBUG] orderFlowMode missing in session, fetching fresh...');
// //             const orderFlowMode = await companyConfig.getOrderFlowMode();
// //             userSession.orderFlowMode = orderFlowMode;
// //             console.log(`📋 Set orderFlowMode in session to: ${orderFlowMode}`);
// //         }

// //         // Check if user is starting a new order
// //         if (userSession.state === 'IDLE' && userMessage.toLowerCase() === 'order') {
// //             // Get fresh flow mode from config (in case it changed)
// //             const orderFlowMode = await companyConfig.getOrderFlowMode();
// //             userSession.orderFlowMode = orderFlowMode;
// //             console.log(`📋 Order flow mode for ${from}: ${orderFlowMode}`);
// //             return await startOrderConfirmation(message, userSession);
// //         }

// //         // Check for cancellation at ANY point in the order process (except during cancellation confirmation)
// //         if (userSession.state !== 'AWAITING_CANCELLATION_CONFIRMATION' && 
// //             await handleCancellationRequest(message, userSession, userSessions)) {
// //             return; // Stop further processing if user cancelled
// //         }

// //         switch (userSession.state) {
// //             case 'START_ORDER':
// //                 return await startOrderConfirmation(message, userSession);
            
// //             case 'AWAITING_ORDER_CONFIRMATION':
// //                 return await handleOrderStartConfirmation(message, userSession);
            
// //             case 'AWAITING_PRODUCT_ID':
// //                 return await handleProductIdInput(message, userSession, client);
            
// //             case 'AWAITING_QUANTITY':
// //                 return await handleQuantityInput(message, userSession);
            
// //             case 'AWAITING_PRODUCT_CONFIRMATION':
// //                 return await handleProductConfirmation(message, userSession);
            
// //             case 'AWAITING_OPTIONS':
// //                 return await handleOptionsInput(message, userSession);
            
// //             case 'AWAITING_NAME':
// //                 return await handleCustomerName(message, userSession);
            
// //             case 'AWAITING_PRIMARY_PHONE':
// //                 return await handlePrimaryPhone(message, userSession);
            
// //             case 'AWAITING_SECONDARY_PHONE':
// //                 return await handleSecondaryPhone(message, userSession);
            
// //             case 'AWAITING_DOOR_NUMBER':
// //                 return await handleDoorNumber(message, userSession);
            
// //             case 'AWAITING_STREET_NAME':
// //                 return await handleStreetName(message, userSession);
            
// //             case 'AWAITING_AREA_LOCALITY':
// //                 return await handleAreaLocality(message, userSession);
            
// //             case 'AWAITING_CITY_DISTRICT':
// //                 return await handleCityDistrict(message, userSession);
            
// //             case 'AWAITING_STATE':
// //                 return await handleState(message, userSession);
            
// //             case 'AWAITING_PINCODE':
// //                 return await handlePincode(message, userSession);
            
// //             case 'AWAITING_FINAL_CONFIRMATION':
// //                 return await handleFinalConfirmation(message, userSession, userSessions, from, client);
            
// //             case 'AWAITING_PAYMENT_PROOF':
// //                 return await handlePaymentProof(message, userSession, userSessions, client);
            
// //             case 'AWAITING_STOCK_ADJUSTMENT':
// //                 return await handleStockAdjustment(message, userSession);
            
// //             case 'AWAITING_CANCELLATION_CONFIRMATION':
// //                 return await handleCancellationConfirmation(message, userSession, userSessions);
            
// //             // ✅ ADDED: New state for combined address in SHORT mode
// //             case 'AWAITING_COMBINED_ADDRESS':
// //                 return await handleCombinedAddress(message, userSession);
            
// //             default:
// //                 userSession.state = 'IDLE';
// //                 return await message.reply('🔄 Session reset. Type *Products* to browse or *Order* to start again.');
// //         }
// //     } catch (error) {
// //         console.error('❌ Order flow error:', error);
// //         userSession.state = 'IDLE';
// //         await message.reply('❌ Order process interrupted. Please start again with *Order*.');
// //     }
// // }

// // // Handle cancellation requests at ANY point
// // async function handleCancellationRequest(message, userSession, userSessions) {
// //     const userMessage = message.body.trim().toLowerCase();
// //     const cancellationKeywords = [
// //         'cancel', 'stop', 'quit', 'exit', 'no', 'nevermind', 
// //         'never mind', 'forget it', 'abort', 'end', 'bye'
// //     ];

// //     if (cancellationKeywords.some(keyword => userMessage.includes(keyword))) {
// //         await message.reply(
// //             `🛑 *Cancel Order Process?*\n\n` +
// //             `Are you sure you want to cancel the current order process?\n\n` +
// //             `✅ Type *YES* to confirm cancellation\n` +
// //             `❌ Type *NO* to continue ordering\n\n` +
// //             `This will clear all your current order details.`
// //         );
        
// //         userSession.previousState = userSession.state;
// //         userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
// //         return true;
// //     }

// //     return false;
// // }

// // // Handle cancellation confirmation separately
// // async function handleCancellationConfirmation(message, userSession, userSessions) {
// //     const userMessage = message.body.trim().toLowerCase();
    
// //     if (userMessage === 'yes' || userMessage === 'y') {
// //         await message.reply(
// //             `❌ *Order Process Cancelled*\n\n` +
// //             `Your order process has been cancelled successfully.\n\n` +
// //             `🛍️ You can start a new order anytime by typing *Order*\n` +
// //             `📦 Browse products by typing *Products*\n\n` +
// //             `Thank you for considering us! 🙏`
// //         );
        
// //         userSession.state = 'IDLE';
// //         if (userSession.orderData) {
// //             delete userSession.orderData;
// //         }
// //         if (userSession.previousState) {
// //             delete userSession.previousState;
// //         }
// //         return;
        
// //     } else if (userMessage === 'no' || userMessage === 'n') {
// //         const previousState = userSession.previousState;
// //         userSession.state = previousState;
// //         delete userSession.previousState;
        
// //         await message.reply(
// //             `✅ *Order Process Resumed*\n\n` +
// //             `Great! Let's continue with your order.\n\n` +
// //             `${getStateSpecificMessage(previousState)}`
// //         );
// //         return;
// //     } else {
// //         await message.reply(
// //             `❓ *Please confirm cancellation*\n\n` +
// //             `Type *YES* to cancel order process\n` +
// //             `Type *NO* to continue ordering\n\n` +
// //             `Your current progress will be saved if you continue.`
// //         );
// //         return;
// //     }
// // }

// // // Handle stock adjustment when insufficient stock
// // async function handleStockAdjustment(message, userSession) {
// //     const userMessage = message.body.trim().toLowerCase();
    
// //     if (userMessage.startsWith('adjust')) {
// //         const parts = userMessage.split(' ');
// //         const requestedQuantity = parseInt(parts[1]);
        
// //         if (isNaN(requestedQuantity) || requestedQuantity < 1) {
// //             await message.reply(
// //                 `❌ *Invalid Quantity*\n\n` +
// //                 `Please enter a valid number. Example: *ADJUST 2*\n\n` +
// //                 `📦 Available: ${safeNumber(userSession.orderData.currentProduct?.stock)} units\n\n` +
// //                 `💡 Type *ADJUST X* where X is the quantity you want`
// //             );
// //             return;
// //         }
        
// //         const availableStock = safeNumber(userSession.orderData.currentProduct?.stock);
        
// //         if (requestedQuantity > availableStock) {
// //             await message.reply(
// //                 `❌ *Cannot Adjust*\n\n` +
// //                 `You requested ${requestedQuantity} units, but only ${availableStock} are available.\n\n` +
// //                 `💡 Type *ADJUST ${availableStock}* to order all available units`
// //             );
// //             return;
// //         }
        
// //         userSession.orderData.quantity = requestedQuantity;
// //         userSession.orderData.totalPrice = safeNumber(userSession.orderData.price) * requestedQuantity;
        
// //         userSession.state = userSession.previousState;
// //         delete userSession.previousState;
// //         delete userSession.orderData.currentProduct;
        
// //         await message.reply(
// //             `✅ *Quantity Adjusted*\n\n` +
// //             `Updated to ${requestedQuantity} units of "${userSession.orderData.productName}"\n\n` +
// //             `💰 New Total: ₹${safeToFixed(userSession.orderData.totalPrice)}\n\n` +
// //             `🤔 *Confirm this adjusted order?*\n\n` +
// //             `Type *PLACE ORDER* to confirm\n` +
// //             `Type *CANCEL* to stop order process`
// //         );
        
// //     } else if (userMessage === 'new') {
// //         await message.reply(
// //             `🔄 *Choose New Product*\n\n` +
// //             `Please enter the Product ID of the new product you want:\n\n` +
// //             `💡 Type *Products* to see all available products with their IDs\n\n` +
// //             `💡 *You can use:*\n` +
// //             `• MongoDB ID: 64abc123def456789abc1234\n` +
// //             `• Custom ID: 00101\n` +
// //             `• Formatted ID: 00101\n\n` +
// //             `📝 *Enter Product ID:*`
// //         );
// //         userSession.state = 'AWAITING_PRODUCT_ID';
        
// //     } else if (userMessage === 'cancel') {
// //         await handleOrderCancellation(message, userSession);
        
// //     } else {
// //         await message.reply(
// //             `❓ *Please choose an option:*\n\n` +
// //             `1️⃣ Type *ADJUST X* (where X is quantity)\n` +
// //             `2️⃣ Type *NEW* to choose another product\n` +
// //             `3️⃣ Type *CANCEL* to stop order process\n\n` +
// //             `📦 Available: ${safeNumber(userSession.orderData.currentProduct?.stock)} units`
// //         );
// //     }
// // }

// // // Helper function to get state-specific messages
// // function getStateSpecificMessage(state) {
// //     const messages = {
// //         'AWAITING_NAME': '👤 Please enter your full name:',
// //         'AWAITING_PRIMARY_PHONE': '📱 Please enter your primary phone number:',
// //         'AWAITING_SECONDARY_PHONE': '📱 Please enter secondary phone number (or type SKIP):',
// //         'AWAITING_PRODUCT_ID': '📝 Please enter the Product ID:\n\n💡 *You can use:*\n• MongoDB ID: 64abc123def456789abc1234\n• Custom ID: 00101\n• Formatted ID: 00101',
// //         'AWAITING_QUANTITY': '📝 Please enter the quantity:',
// //         'AWAITING_PRODUCT_CONFIRMATION': '🤔 Please confirm the order details:',
// //         'AWAITING_OPTIONS': '🎨 Please enter customization options or type SKIP:',
// //         'AWAITING_DOOR_NUMBER': '🏠 Please enter your door/flat number:',
// //         'AWAITING_STREET_NAME': '🏠 Please enter your street name:',
// //         'AWAITING_AREA_LOCALITY': '🏠 Please enter your area/locality:',
// //         'AWAITING_CITY_DISTRICT': '🏠 Please enter your city/district:',
// //         'AWAITING_STATE': '🏠 Please enter your state:',
// //         'AWAITING_PINCODE': '🏠 Please enter your pincode:',
// //         'AWAITING_FINAL_CONFIRMATION': '✅ Please confirm to place order:',
// //         'AWAITING_PAYMENT_PROOF': '📸 Please send payment screenshot:',
// //         'AWAITING_STOCK_ADJUSTMENT': '📊 Please adjust quantity or choose another product:',
// //         // ✅ ADDED: Message for combined address state
// //         'AWAITING_COMBINED_ADDRESS': '🏠 Please enter your complete address in one line:'
// //     };
    
// //     return messages[state] || 'Please continue with your order.';
// // }

// // async function startOrderConfirmation(message, userSession) {
// //     await message.reply(
// //         `🛒 *Start New Order*\n\n` +
// //         `Ready to place an order? I'll guide you through the process step by step! 🎯\n\n` +
// //         `🤔 *Would you like to continue?*\n\n` +
// //         `Type *YES* to start ordering\n` +
// //         `Type *NO* to cancel\n\n` +
// //         `💡 *You can type CANCEL at any time to stop the process*`
// //     );
// //     userSession.state = 'AWAITING_ORDER_CONFIRMATION';
// // }

// // async function handleOrderStartConfirmation(message, userSession) {
// //     const response = message.body.trim().toLowerCase();
    
// //     if (response === 'yes' || response === 'y') {
// //         await message.reply(
// //             `🎯 *Let's Start Your Order!*\n\n` +
// //             `First, let's get your contact details:\n\n` +
// //             `1️⃣ *Please enter your full name:*\n\n` +
// //             `📝 *Example:* John Doe\n\n` +
// //             `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
// //         );
// //         userSession.state = 'AWAITING_NAME';
// //     } else if (response === 'no' || response === 'n') {
// //         await message.reply(
// //             `👋 No problem! Feel free to browse products anytime by typing *Products*.\n\n` +
// //             `We're here when you're ready to order! 🛍️`
// //         );
// //         userSession.state = 'IDLE';
// //     } else {
// //         await message.reply(
// //             `❓ Please type *YES* to start ordering or *NO* to cancel.\n\n` +
// //             `Would you like to place an order?`
// //         );
// //     }
// // }

// // async function handleCustomerName(message, userSession) {
// //     const customerName = message.body.trim();
    
// //     if (customerName.length < 2) {
// //         await message.reply(
// //             `❌ *Please enter a valid name*\n\n` +
// //             `Name should be at least 2 characters long.\n\n` +
// //             `📝 *Enter your full name:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData = {
// //         customerName: customerName,
// //         address: {
// //             doorNumber: '',
// //             streetName: '',
// //             areaLocality: '',
// //             cityDistrict: '',
// //             state: '',
// //             pincode: '',
// //             country: 'India'
// //         },
// //         gstType: 'intra-state',
// //         paymentMethod: 'upi'
// //     };

// //     await message.reply(
// //         `✅ *Name saved!* 👤\n\n` +
// //         `2️⃣ *Please enter your primary phone number:*\n\n` +
// //         `📱 *Format:* 10-digit mobile number\n` +
// //         `📝 *Example:* 9876543210\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_PRIMARY_PHONE';
// // }

// // async function handlePrimaryPhone(message, userSession) {
// //     const phoneNumber = message.body.trim().replace(/\D/g, '');
    
// //     if (phoneNumber.length !== 10) {
// //         await message.reply(
// //             `❌ *Invalid Phone Number*\n\n` +
// //             `Please enter a valid 10-digit mobile number.\n\n` +
// //             `📱 *Format:* 9876543210\n` +
// //             `📝 *Example:* 9876543210\n\n` +
// //             `📝 *Enter your primary phone number:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.phoneNumber = phoneNumber;

// //     await message.reply(
// //         `✅ *Primary phone saved!* 📱\n\n` +
// //         `3️⃣ *Secondary Phone (Optional):*\n\n` +
// //         `Do you have an alternate phone number?\n\n` +
// //         `📝 *Enter secondary phone number or type SKIP:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_SECONDARY_PHONE';
// // }

// // async function handleSecondaryPhone(message, userSession) {
// //     const userInput = message.body.trim();
    
// //     if (userInput.toLowerCase() === 'skip') {
// //         userSession.orderData.secondaryPhoneNumber = null;
// //     } else {
// //         const secondaryPhone = userInput.replace(/\D/g, '');
        
// //         if (secondaryPhone.length !== 10 && secondaryPhone.length > 0) {
// //             await message.reply(
// //                 `❌ *Invalid Secondary Phone*\n\n` +
// //                 `Please enter a valid 10-digit mobile number.\n\n` +
// //                 `📱 *Format:* 9876543210\n` +
// //                 `📝 *Example:* 9876543210\n\n` +
// //                 `📝 *Enter secondary phone number or type SKIP:*\n\n` +
// //                 `💡 Type *CANCEL* to stop order process`
// //             );
// //             return;
// //         }
        
// //         userSession.orderData.secondaryPhoneNumber = secondaryPhone || null;
// //     }

// //     await message.reply(
// //         `✅ *Contact details saved!* ✅\n\n` +
// //         `4️⃣ *Now let's select your product:*\n\n` +
// //         `Please enter the *Product ID* you want to order:\n\n` +
// //         `💡 *How to find Product ID:*\n` +
// //         `• Type *Products* to see all products with their IDs\n` +
// //         `• Look for the ID next to each product\n\n` +
// //         `💡 *You can use these formats:*\n` +
// //         `• MongoDB ID: 64abc123def456789abc1234\n` +
// //         `• Custom ID: 00101 (product code)\n` +
// //         `• Formatted ID: 00101 (display format)\n\n` +
// //         `📝 *Enter Product ID:*\n\n` +
// //         `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
// //     );
// //     userSession.state = 'AWAITING_PRODUCT_ID';
// // }

// // // Handle Product ID Input - Supports MongoDB ID, Custom ID, and Formatted ID
// // async function handleProductIdInput(message, userSession, client) {
// //     const productId = message.body.trim();
    
// //     console.log(`🔍 Product ID input: "${productId}"`);
    
// //     // Try to find by MongoDB ID (24-character hex)
// //     const isMongoId = /^[0-9a-fA-F]{24}$/.test(productId);
    
// //     // Try to find by Custom ID (numeric with or without leading zeros)
// //     const customIdNum = parseCustomId(productId);
// //     const isCustomId = customIdNum !== null;
    
// //     if (!isMongoId && !isCustomId) {
// //         await message.reply(
// //             `❌ *Invalid Product ID Format*\n\n` +
// //             `Please enter a valid Product ID.\n\n` +
// //             `💡 *Accepted formats:*\n` +
// //             `• MongoDB ID: 64abc123def456789abc1234\n` +
// //             `• Custom ID: 00101 or 101\n` +
// //             `• Formatted ID: 00101\n\n` +
// //             `📝 *Enter correct Product ID:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     try {
// //         console.log(`🔍 Fetching product with: ${isMongoId ? 'MongoDB ID: ' + productId : 'Custom ID: ' + customIdNum}`);
        
// //         let product = null;
        
// //         // Try to find by MongoDB ID first
// //         if (isMongoId) {
// //             product = await apiService.getProductById(productId);
// //         }
        
// //         // If not found and we have a custom ID, try to find by custom ID
// //         if (!product && isCustomId) {
// //             console.log(`🔍 Attempting to find product by custom ID: ${customIdNum}`);
            
// //             // Get all products and search by customId
// //             const allProducts = await apiService.getProducts();
// //             if (allProducts && allProducts.length > 0) {
// //                 product = allProducts.find(p => 
// //                     p.customId === customIdNum || 
// //                     (p.customId && String(p.customId) === String(customIdNum)) ||
// //                     (p.customId && formatCustomId(p.customId) === productId)
// //                 );
// //             }
// //         }
        
// //         console.log('📦 Product search result:', product ? 'Found' : 'Not found');
        
// //         if (!product) {
// //             await message.reply(
// //                 `❌ *Product Not Found*\n\n` +
// //                 `No product found with ID: ${productId}\n\n` +
// //                 `💡 *Please check:*\n` +
// //                 `• Make sure you typed the ID correctly\n` +
// //                 `• Type *Products* to see all available products\n` +
// //                 `• Try searching by product name\n\n` +
// //                 `📝 *Enter correct Product ID:*\n\n` +
// //                 `💡 Type *CANCEL* to stop order process`
// //             );
// //             return;
// //         }

// //         const isProductActive = product.isActive !== false && product.status !== 'inactive';
        
// //         if (!isProductActive) {
// //             await message.reply(
// //                 `❌ *Product Not Available*\n\n` +
// //                 `"${product.productName}" is currently not available for purchase.\n\n` +
// //                 `💡 Please choose another product by typing *Products*`
// //             );
// //             userSession.state = 'IDLE';
// //             return;
// //         }

// //         const sellingPrice = safeNumber(product.discountPrice) || safeNumber(product.price);
// //         const mrp = safeNumber(product.mrp) || sellingPrice;
// //         const discountPercentage = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

// //         const productImageUrl = product.imageUrls && product.imageUrls.length > 0 
// //             ? product.imageUrls[0] 
// //             : product.imageUrl;

// //         // Store product data in session
// //         userSession.orderData.productId = product._id || product.id;
// //         userSession.orderData.productName = product.productName;
// //         userSession.orderData.mrp = mrp;
// //         userSession.orderData.price = sellingPrice;
// //         userSession.orderData.imageUrl = productImageUrl;
// //         userSession.orderData.options = product.options;
// //         userSession.orderData.stock = safeNumber(product.stock);
// //         userSession.orderData.sku = product.sku;
// //         userSession.orderData.hsnCode = product.hsnCode;
// //         userSession.orderData.gstRate = safeNumber(product.gstRate, 18);
// //         userSession.orderData.gstIncluded = product.gstIncluded !== false;
        
// //         // Store both MongoDB ID and custom ID for reference
// //         userSession.orderData.mongoId = product._id || product.id;
// //         userSession.orderData.customId = product.customId;
// //         userSession.orderData.formattedId = product.customId ? formatCustomId(product.customId) : null;

// //         let productInfo = 
// //             `✅ *Product Found!*\n\n` +
// //             `👤 *Customer:* ${userSession.orderData.customerName}\n` +
// //             `📱 *Phone:* ${userSession.orderData.phoneNumber}\n` +
// //             `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
// //             `🛍️ *Product:* ${product.productName}\n`;

// //         // Show custom ID if available
// //         if (product.customId) {
// //             productInfo += `🔢 *Product Code:* ${formatCustomId(product.customId)}\n`;
// //         }

// //         if (mrp > sellingPrice) {
// //             productInfo += `💰 *MRP:* ~~₹${safeToFixed(mrp)}~~\n`;
// //             productInfo += `💵 *Our Price:* ₹${safeToFixed(sellingPrice)} (*${discountPercentage}% OFF*)\n`;
// //         } else {
// //             productInfo += `💰 *Price:* ₹${safeToFixed(sellingPrice)}\n`;
// //         }

// //         productInfo += 
// //             `📦 *Available:* ${safeNumber(product.stock)} units\n` +
// //             (product.sku ? `📌 *SKU:* ${product.sku}\n` : '') +
// //             (product.hsnCode ? `🔢 *HSN:* ${product.hsnCode}\n` : '') +
// //             (safeNumber(product.gstRate) > 0 ? `💵 *GST:* ${safeNumber(product.gstRate)}%\n` : '');

// //         if (product.description) {
// //             productInfo += `📝 *Description:* ${product.description}\n`;
// //         }

// //         productInfo += 
// //             `\n🎯 *Now, please enter quantity:*\n\n` +
// //             `💡 *Note:* Maximum ${safeNumber(product.stock)} units available\n` +
// //             `📝 *Enter quantity (1-${safeNumber(product.stock)}):*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`;

// //         try {
// //             if (productImageUrl && await isValidImageUrl(productImageUrl)) {
// //                 const imageUrl = apiService.getProductImageUrl(productImageUrl);
// //                 console.log(`🖼️ Loading product image from: ${imageUrl}`);
                
// //                 const media = await MessageMedia.fromUrl(imageUrl, {
// //                     unsafeMime: true,
// //                     filename: `product-${product._id}.jpg`
// //                 });
                
// //                 await message.reply(media, null, { caption: productInfo });
// //             } else {
// //                 await message.reply(productInfo);
// //             }
// //         } catch (imageError) {
// //             console.error('❌ Image load failed:', imageError);
// //             await message.reply(productInfo);
// //         }

// //         userSession.state = 'AWAITING_QUANTITY';

// //     } catch (error) {
// //         console.error('❌ API Error in product lookup:', error);
// //         await message.reply(
// //             `❌ *Service Temporarily Unavailable*\n\n` +
// //             `Failed to fetch product details. Please try again in a moment.\n\n` +
// //             `📝 *Enter Product ID again:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //     }
// // }

// // async function handleQuantityInput(message, userSession) {
// //     const quantityInput = message.body.trim();
// //     const quantity = parseInt(quantityInput);

// //     if (isNaN(quantity) || quantity < 1) {
// //         await message.reply(
// //             `❌ *Invalid Quantity*\n\n` +
// //             `Please enter a valid number (minimum 1).\n\n` +
// //             `📝 *Enter quantity for ${userSession.orderData.productName}:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     const availableStock = safeNumber(userSession.orderData.stock);
    
// //     if (quantity > availableStock) {
// //         await message.reply(
// //             `❌ *Insufficient Stock*\n\n` +
// //             `Only ${availableStock} units available for "${userSession.orderData.productName}".\n\n` +
// //             `💡 Please enter quantity between 1-${availableStock}\n\n` +
// //             `📝 *Enter quantity:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.quantity = quantity;
// //     userSession.orderData.totalPrice = safeNumber(userSession.orderData.price) * quantity;

// //     const gstRate = safeNumber(userSession.orderData.gstRate, 18);
// //     const gstAmount = (userSession.orderData.totalPrice * gstRate) / 100;
// //     userSession.orderData.gstAmount = gstAmount;
// //     userSession.orderData.subtotal = userSession.orderData.totalPrice;
// //     userSession.orderData.totalWithGst = userSession.orderData.totalPrice + gstAmount;

// //     let confirmationText = 
// //         `📋 *Order Summary*\n\n` +
// //         `👤 *Customer:* ${userSession.orderData.customerName}\n` +
// //         `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
// //         `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
// //         `🛍️ *Product:* ${userSession.orderData.productName}\n`;

// //     if (userSession.orderData.customId) {
// //         confirmationText += `🔢 *Product Code:* ${userSession.orderData.formattedId}\n`;
// //     }

// //     confirmationText += 
// //         `💰 *Unit Price:* ₹${safeToFixed(userSession.orderData.price)}\n` +
// //         `🛒 *Quantity:* ${quantity}\n` +
// //         `💵 *Subtotal:* ₹${safeToFixed(userSession.orderData.subtotal)}\n`;

// //     if (gstRate > 0) {
// //         confirmationText += `💵 *GST (${gstRate}%):* ₹${safeToFixed(gstAmount)}\n`;
// //         confirmationText += `💰 *Total with GST:* ₹${safeToFixed(userSession.orderData.totalWithGst)}\n`;
// //     } else {
// //         confirmationText += `💰 *Total Amount:* ₹${safeToFixed(userSession.orderData.totalPrice)}\n`;
// //     }

// //     if (userSession.orderData.options) {
// //         confirmationText += `\n⚙️ *Available Options:* ${userSession.orderData.options}\n\n` +
// //         `🎨 *Would you like any customization?*\n\n` +
// //         `💡 Example: "Blue, Large" or "With Frame"\n\n` +
// //         `Type your preferences or type *SKIP* to continue:\n\n` +
// //         `💡 Type *CANCEL* to stop order process`;
        
// //         userSession.state = 'AWAITING_OPTIONS';
// //     } else {
// //         confirmationText += `\n🤔 *Confirm this order?*\n\n` +
// //         `*Please give the address details correctly without error*\n\n` +
// //         `Type *CONFIRM* to continue\n` +
// //         `Type *CANCEL* to stop order process`;
        
// //         userSession.state = 'AWAITING_PRODUCT_CONFIRMATION';
// //     }

// //     await message.reply(confirmationText);
// // }

// // async function handleOptionsInput(message, userSession) {
// //     const options = message.body.trim();
    
// //     if (options.toLowerCase() === 'skip') {
// //         userSession.orderData.selectedOptions = 'No customization';
// //     } else {
// //         userSession.orderData.selectedOptions = options;
// //     }

// //     await message.reply(
// //         `✅ ${options.toLowerCase() === 'skip' ? 'Skipped customization' : 'Options saved!'}\n\n` +
// //         `🏠 *Shipping Address Details*\n\n` +
// //         `* please enter the correct details *\n\n` +
// //         `1️⃣ *Door/Flat Number:*\n\n` +
// //         `📝 *Enter your door or flat number:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_DOOR_NUMBER';
// // }

// // // ✅ MODIFIED: Handle product confirmation with flow mode branching
// // async function handleProductConfirmation(message, userSession) {
// //     // ✅ DEBUG LOGS - Check what's happening
// //     console.log('🔍 [DEBUG] ===== ENTERING handleProductConfirmation =====');
// //     console.log('🔍 [DEBUG] orderFlowMode value:', userSession.orderFlowMode);
// //     console.log('🔍 [DEBUG] orderFlowMode type:', typeof userSession.orderFlowMode);
// //     console.log('🔍 [DEBUG] Current state:', userSession.state);
// //     console.log('🔍 [DEBUG] User message:', message.body.trim());
    
// //     const response = message.body.trim().toLowerCase();
    
// //     if (response === 'confirm') {
// //         console.log('🔍 [DEBUG] User typed CONFIRM');
// //         console.log('🔍 [DEBUG] Checking if mode is short:', userSession.orderFlowMode === 'short');
        
// //         if (userSession.orderFlowMode === 'short') {
// //             console.log('🔍 [DEBUG] ✅ SHORT MODE - Going to combined address');
// //             // SHORT mode: Ask for combined address
// //             await message.reply(
// //                 `🏠 *Shipping Address*\n\n` +
// //                 `Please enter your complete address in ONE line:\n\n` +
// //                 `📝 *Format:*\n` +
// //                 `Door No, Street, Area/Locality, City, State\n\n` +
// //                 `📝 *Example:*\n` +
// //                 `12, MG Road, Indiranagar, Bangalore, Karnataka\n\n` +
// //                 `📍 *Note:* Pincode will be asked separately\n\n` +
// //                 `📝 *Enter your address:*`
// //             );
// //             userSession.state = 'AWAITING_COMBINED_ADDRESS';
// //             console.log('🔍 [DEBUG] State changed to: AWAITING_COMBINED_ADDRESS');
// //         } else {
// //             console.log('🔍 [DEBUG] ❌ LONG MODE - Going to step-by-step address');
// //             // LONG mode: Step by step address (existing code)
// //             await message.reply(
// //                 `🏠 *Shipping Address Details*\n\n` +
// //                 `Let's collect your shipping address step by step:\n\n` +
// //                 `* please enter the correct details *\n\n` +
// //                 `1️⃣ *Door/Flat Number:*\n\n` +
// //                 `📝 *Enter your door or flat number:*\n\n` +
// //                 `💡 Type *CANCEL* to stop order process`
// //             );
// //             userSession.state = 'AWAITING_DOOR_NUMBER';
// //             console.log('🔍 [DEBUG] State changed to: AWAITING_DOOR_NUMBER');
// //         }
// //     } else {
// //         console.log('🔍 [DEBUG] User did NOT type CONFIRM, they typed:', response);
// //         await message.reply(
// //             `❓ Please type *CONFIRM* to continue.\n\n` +
// //             `Customer: ${userSession.orderData.customerName}\n` +
// //             `Phone: ${userSession.orderData.phoneNumber}\n` +
// //             `Product: ${userSession.orderData.productName}\n` +
// //             `Quantity: ${userSession.orderData.quantity}\n` +
// //             `Total: ₹${safeToFixed(userSession.orderData.totalWithGst || userSession.orderData.totalPrice)}\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //     }
    
// //     console.log('🔍 [DEBUG] ===== EXITING handleProductConfirmation =====\n');
// // }

// // async function handleDoorNumber(message, userSession) {
// //     const doorNumber = message.body.trim();
    
// //     if (doorNumber.length < 1) {
// //         await message.reply(
// //             `❌ *Please enter a valid door/flat number*\n\n` +
// //             `📝 *Enter your door or flat number:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.address.doorNumber = doorNumber;

// //     await message.reply(
// //         `✅ *Door number saved!*\n\n` +
// //         `* please enter the correct details *\n\n` +
// //         `2️⃣ *Street Name:*\n\n` +
// //         `📝 *Enter your street name:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_STREET_NAME';
// // }

// // async function handleStreetName(message, userSession) {
// //     const streetName = message.body.trim();
    
// //     if (streetName.length < 2) {
// //         await message.reply(
// //             `❌ *Please enter a valid street name*\n\n` +
// //             `📝 *Enter your street name:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.address.streetName = streetName;

// //     await message.reply(
// //         `✅ *Street name saved!*\n\n` +
// //         `* please enter the correct details *\n\n` +
// //         `3️⃣ *Area/Locality:*\n\n` +
// //         `📝 *Enter your area or locality name:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_AREA_LOCALITY';
// // }

// // async function handleAreaLocality(message, userSession) {
// //     const areaLocality = message.body.trim();
    
// //     if (areaLocality.length < 2) {
// //         await message.reply(
// //             `❌ *Please enter a valid area/locality name*\n\n` +
// //             `📝 *Enter your area or locality name:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.address.areaLocality = areaLocality;

// //     await message.reply(
// //         `✅ *Area/Locality saved!*\n\n` +
// //         `* please enter the correct details *\n\n` +
// //         `4️⃣ *City/District:*\n\n` +
// //         `📝 *Enter your city or district name:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_CITY_DISTRICT';
// // }

// // async function handleCityDistrict(message, userSession) {
// //     const cityDistrict = message.body.trim();
    
// //     if (cityDistrict.length < 2) {
// //         await message.reply(
// //             `❌ *Please enter a valid city/district name*\n\n` +
// //             `📝 *Enter your city or district name:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.address.cityDistrict = cityDistrict;

// //     await message.reply(
// //         `✅ *City/District saved!*\n\n` +
// //         `* please enter the correct details *\n\n` +
// //         `5️⃣ *State:*\n\n` +
// //         `📝 *Enter your state name:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_STATE';
// // }

// // async function handleState(message, userSession) {
// //     const state = message.body.trim();
    
// //     if (state.length < 2) {
// //         await message.reply(
// //             `❌ *Please enter a valid state name*\n\n` +
// //             `📝 *Enter your state name:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.address.state = state;

// //     await message.reply(
// //         `✅ *State saved!*\n\n` +
// //         `*please enter the correct details*\n\n` +
// //         `6️⃣ *Pincode:*\n\n` +
// //         `Please enter your 6-digit pincode:\n\n` +
// //         `💡 Example: 400001, 560001, 110001\n\n` +
// //         `📝 *Enter your pincode:*\n\n` +
// //         `💡 Type *CANCEL* to stop order process`
// //     );
// //     userSession.state = 'AWAITING_PINCODE';
// // }

// // // ✅ ADDED: New handler for combined address in SHORT mode
// // async function handleCombinedAddress(message, userSession) {
// //     const addressString = message.body.trim();
    
// //     try {
// //         // Parse the combined address
// //         const parsed = parseCombinedAddress(addressString);
        
// //         // Store in session
// //         userSession.orderData.address = {
// //             doorNumber: parsed.doorNumber,
// //             streetName: parsed.streetName,
// //             areaLocality: parsed.areaLocality,
// //             cityDistrict: parsed.cityDistrict,
// //             state: parsed.state,
// //             country: 'India'
// //         };
        
// //         // Store the full address for reference
// //         userSession.orderData.completeAddress = addressString;
        
// //         console.log(`✅ Address parsed successfully:`, {
// //             door: parsed.doorNumber,
// //             street: parsed.streetName,
// //             area: parsed.areaLocality,
// //             city: parsed.cityDistrict,
// //             state: parsed.state
// //         });
        
// //         // Show summary and ask for pincode
// //         await message.reply(
// //             `✅ *Address Saved*\n\n` +
// //             `📋 *Please verify your address:*\n` +
// //             `🏠 Door: ${parsed.doorNumber}\n` +
// //             `🛣️ Street: ${parsed.streetName}\n` +
// //             `📍 Area: ${parsed.areaLocality}\n` +
// //             `🏙️ City: ${parsed.cityDistrict}\n` +
// //             `🗺️ State: ${parsed.state}\n\n` +
// //             `📍 *Now enter your 6-digit pincode:*\n\n` +
// //             `💡 Example: 560038`
// //         );
        
// //         userSession.state = 'AWAITING_PINCODE';
        
// //     } catch (error) {
// //         console.error('❌ Address parsing failed:', error.message);
        
// //         // Send formatted error message
// //         await message.reply(getAddressFormatInstructions());
        
// //         // Stay in same state to try again
// //         userSession.state = 'AWAITING_COMBINED_ADDRESS';
// //     }
// // }

// // // ✅ MODIFIED: Handle pincode with flow mode branching
// // async function handlePincode(message, userSession) {
// //     const pincode = message.body.trim();
    
// //     if (!/^\d{6}$/.test(pincode)) {
// //         await message.reply(
// //             `❌ *Invalid Pincode*\n\n` +
// //             `Please enter a valid 6-digit pincode.\n\n` +
// //             `💡 Example: 400001, 560001, 110001\n\n` +
// //             `📝 *Enter your 6-digit pincode:*\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }

// //     userSession.orderData.address.pincode = pincode;

// //     const date = new Date();
// //     const year = date.getFullYear().toString().slice(-2);
// //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
// //     const day = date.getDate().toString().padStart(2, '0');
// //     const random = Math.random().toString(36).substr(2, 5).toUpperCase();
// //     const orderNumber = `ORD-${year}${month}${day}-${random}`;
    
// //     userSession.orderData.orderNumber = orderNumber;

// //     const completeAddress = formatAddressString(userSession.orderData.address);
// //     userSession.orderData.completeAddress = completeAddress;

// //     const gstRate = safeNumber(userSession.orderData.gstRate, 18);
// //     const subtotal = safeNumber(userSession.orderData.totalPrice);
// //     const gstAmount = (subtotal * gstRate) / 100;
// //     const totalWithGst = subtotal + gstAmount;

// //     if (userSession.orderFlowMode === 'short') {
// //         // SHORT mode: Skip to final confirmation with summary
// //         const address = `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}, ${userSession.orderData.address.areaLocality}, ${userSession.orderData.address.cityDistrict}, ${userSession.orderData.address.state} - ${pincode}`;
        
// //         let summaryText = 
// //             `📋 *ORDER SUMMARY*\n\n` +
// //             `👤 Name: ${userSession.orderData.customerName}\n` +
// //             `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
// //             `${userSession.orderData.secondaryPhoneNumber ? `📱 Secondary: ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
// //             `🧾 Order: ${orderNumber}\n` +
// //             `🛍️ Product: ${userSession.orderData.productName}\n`;

// //         if (userSession.orderData.customId) {
// //             summaryText += `🔢 Product Code: ${userSession.orderData.formattedId}\n`;
// //         }

// //         summaryText += 
// //             `🛒 Quantity: ${userSession.orderData.quantity}\n` +
// //             `💰 Amount: ₹${safeToFixed(totalWithGst)}\n`;

// //         if (userSession.orderData.selectedOptions) {
// //             summaryText += `🎨 Customization: ${userSession.orderData.selectedOptions}\n`;
// //         }

// //         summaryText += 
// //             `\n📍 *Shipping Address:*\n` +
// //             `${address}\n\n` +
// //             `✅ *Type PLACE ORDER to confirm*`;

// //         await message.reply(summaryText);
// //         userSession.state = 'AWAITING_FINAL_CONFIRMATION';
        
// //     } else {
// //         // LONG mode: Show full summary with address (existing code)
// //         let finalSummary = 
// //             `📋 *FINAL ORDER SUMMARY*\n\n` +
// //             `👤 *Customer Name:* ${userSession.orderData.customerName}\n` +
// //             `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
// //             `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
// //             `🧾 *Order Number:* ${orderNumber}\n` +
// //             `🛍️ *Product:* ${userSession.orderData.productName}\n`;

// //         if (userSession.orderData.customId) {
// //             finalSummary += `🔢 *Product Code:* ${userSession.orderData.formattedId}\n`;
// //         }

// //         finalSummary += 
// //             `🛒 *Quantity:* ${userSession.orderData.quantity}\n` +
// //             `💰 *Subtotal:* ₹${safeToFixed(subtotal)}\n`;

// //         if (gstRate > 0) {
// //             finalSummary += `💵 *GST (${gstRate}%):* ₹${safeToFixed(gstAmount)}\n`;
// //             finalSummary += `💰 *Total with GST:* ₹${safeToFixed(totalWithGst)}\n`;
// //         } else {
// //             finalSummary += `💰 *Total Amount:* ₹${safeToFixed(subtotal)}\n`;
// //         }

// //         finalSummary += 
// //             `📊 *Available Stock:* ${safeNumber(userSession.orderData.stock)} units\n`;

// //         if (userSession.orderData.selectedOptions) {
// //             finalSummary += `🎨 *Customization:* ${userSession.orderData.selectedOptions}\n`;
// //         }

// //         finalSummary += 
// //             `\n🏠 *Shipping Address:*\n` +
// //             `${completeAddress}\n\n` +
// //             `🔒 *Payment Required:* ₹${safeToFixed(totalWithGst)}\n\n` +
// //             `✅ *Ready to place this order?*\n\n` +
// //             `Type *PLACE ORDER* to confirm and proceed to payment\n` +
// //             `Type *CANCEL* to abort order process`;

// //         await message.reply(finalSummary);
// //         userSession.state = 'AWAITING_FINAL_CONFIRMATION';
// //     }
// // }

// // async function handleFinalConfirmation(message, userSession, userSessions, from, client) {
// //     const response = message.body.trim().toLowerCase();
// //     const customerPhone = apiService.cleanPhoneNumber(from);
// //     const whatsappNumber = apiService.cleanPhoneNumber(from); // WhatsApp number for customer identification
    
// //     if (response === 'place order') {
// //         try {
// //             console.log(`🔍 Checking stock for order: ${userSession.orderData.productName}`);
            
// //             const product = await apiService.getProductById(userSession.orderData.productId);
            
// //             if (!product) {
// //                 await message.reply(
// //                     `❌ *Product Not Available*\n\n` +
// //                     `The product "${userSession.orderData.productName}" is no longer available.\n\n` +
// //                     `🔄 Please browse other products by typing *Products*`
// //                 );
// //                 userSession.state = 'IDLE';
// //                 delete userSession.orderData;
// //                 return;
// //             }

// //             if (product.isActive === false) {
// //                 await message.reply(
// //                     `❌ *Product Not Available*\n\n` +
// //                     `"${product.productName}" is currently unavailable for purchase.\n\n` +
// //                     `💡 Please choose another product by typing *Products*`
// //                 );
// //                 userSession.state = 'IDLE';
// //                 delete userSession.orderData;
// //                 return;
// //             }

// //             if (safeNumber(product.stock) < safeNumber(userSession.orderData.quantity)) {
// //                 const availableStock = safeNumber(product.stock);
                
// //                 await message.reply(
// //                     `❌ *Insufficient Stock*\n\n` +
// //                     `"${product.productName}" has only *${availableStock} units* available.\n\n` +
// //                     `📊 *Stock Status:*\n` +
// //                     `📦 Available: ${availableStock} units\n` +
// //                     `🛒 You requested: ${userSession.orderData.quantity} units\n` +
// //                     `📉 Short by: ${userSession.orderData.quantity - availableStock} units\n\n` +
// //                     `💡 *Please choose:*\n` +
// //                     `1️⃣ Type *ADJUST ${availableStock}* to order available quantity\n` +
// //                     `2️⃣ Type *NEW* to choose another product\n` +
// //                     `3️⃣ Type *CANCEL* to stop order process\n\n` +
// //                     `Reply with your choice.`
// //                 );
                
// //                 userSession.orderData.currentProduct = product;
// //                 userSession.previousState = userSession.state;
// //                 userSession.state = 'AWAITING_STOCK_ADJUSTMENT';
// //                 return;
// //             }

// //             if (safeNumber(product.stock) <= 5) {
// //                 console.log(`⚠️ LOW STOCK WARNING: ${product.productName} has only ${product.stock} units left`);
// //             }

// //             const gstRate = safeNumber(userSession.orderData.gstRate, 18);
// //             const subtotal = safeNumber(userSession.orderData.totalPrice);
// //             const gstAmount = (subtotal * gstRate) / 100;
// //             const totalWithGst = subtotal + gstAmount;

// //             // Prepare order data with both phone numbers
// //             const orderData = {
// //                 orderNumber: userSession.orderData.orderNumber,
// //                 customerName: userSession.orderData.customerName,
// //                 customerEmail: `${userSession.orderData.phoneNumber}@customer.whatsapp`,
// //                 // User-entered phone number (for delivery contact)
// //                 phoneNumber: userSession.orderData.phoneNumber,
// //                 secondaryPhoneNumber: userSession.orderData.secondaryPhoneNumber || null,
// //                 // WhatsApp number (for customer identification) - IMPORTANT FIELD
// //                 whatsappNumber: whatsappNumber,
// //                 shippingAddress: {
// //                     street: `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}`,
// //                     city: userSession.orderData.address.cityDistrict,
// //                     state: userSession.orderData.address.state,
// //                     pincode: userSession.orderData.address.pincode,
// //                     landmark: userSession.orderData.address.areaLocality,
// //                     country: 'India'
// //                 },
// //                 billingAddress: {
// //                     street: `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}`,
// //                     city: userSession.orderData.address.cityDistrict,
// //                     state: userSession.orderData.address.state,
// //                     pincode: userSession.orderData.address.pincode,
// //                     landmark: userSession.orderData.address.areaLocality,
// //                     country: 'India'
// //                 },
// //                 sameAsShipping: true,
// //                 paymentMethod: 'upi',
// //                 gstType: 'intra-state',
// //                 items: [{
// //                     productId: userSession.orderData.productId,
// //                     productName: userSession.orderData.productName,
// //                     quantity: safeNumber(userSession.orderData.quantity),
// //                     mrp: safeNumber(userSession.orderData.mrp) || safeNumber(userSession.orderData.price),
// //                     discountPrice: safeNumber(userSession.orderData.price),
// //                     price: safeNumber(userSession.orderData.price),
// //                     gstRate: gstRate,
// //                     gstIncluded: userSession.orderData.gstIncluded !== false,
// //                     gstAmount: gstAmount,
// //                     totalAmount: subtotal,
// //                     sku: userSession.orderData.sku || '',
// //                     hsnCode: userSession.orderData.hsnCode || ''
// //                 }],
// //                 subtotal: subtotal,
// //                 totalDiscount: safeNumber(userSession.orderData.mrp) > safeNumber(userSession.orderData.price) 
// //                     ? (safeNumber(userSession.orderData.mrp) - safeNumber(userSession.orderData.price)) * safeNumber(userSession.orderData.quantity)
// //                     : 0,
// //                 totalGst: gstAmount,
// //                 shippingCharge: 0,
// //                 totalPrice: totalWithGst,
// //                 paidAmount: 0,
// //                 balanceAmount: totalWithGst,
// //                 paymentStatus: 'pending',
// //                 orderNotes: userSession.orderData.selectedOptions || '',
// //                 status: 'pending',
// //                 createdBy: 'whatsapp_bot',
// //                 statusHistory: [{
// //                     status: 'pending',
// //                     timestamp: new Date().toISOString(),
// //                     comment: 'Order created via WhatsApp'
// //                 }]
// //             };

// //             console.log('📦 Creating order with data:', {
// //                 orderNumber: orderData.orderNumber,
// //                 customerName: orderData.customerName,
// //                 deliveryPhone: orderData.phoneNumber,
// //                 whatsappNumber: orderData.whatsappNumber,
// //                 amount: orderData.totalPrice,
// //                 product: orderData.items[0].productName,
// //                 quantity: orderData.items[0].quantity,
// //                 gstRate: orderData.items[0].gstRate,
// //                 gstAmount: orderData.items[0].gstAmount
// //             });

// //             const newOrder = await apiService.createOrder(orderData);
            
// //             if (!newOrder || !newOrder._id) {
// //                 throw new Error('Failed to create order: No order ID returned from API');
// //             }

// //             userSession.orderData.orderId = newOrder._id;
// //             userSession.orderData.apiOrder = newOrder;

// //             console.log(`✅ Order created successfully:`, {
// //                 orderId: newOrder._id,
// //                 orderNumber: newOrder.orderNumber || orderData.orderNumber,
// //                 customerName: newOrder.customerName || orderData.customerName,
// //                 deliveryPhone: newOrder.phoneNumber,
// //                 whatsappNumber: newOrder.whatsappNumber,
// //                 status: newOrder.status || 'pending',
// //                 amount: newOrder.totalPrice || orderData.totalPrice,
// //                 gstAmount: newOrder.totalGst || orderData.totalGst
// //             });

// //             try {
// //                 console.log(`🎯 Sending notifications via Notification Manager for order: ${newOrder.orderNumber}`);
                
// //                 const notificationResult = await notificationManager.sendNewOrderNotification(newOrder);
                
// //                 console.log(`🔔 Notification result:`, {
// //                     success: notificationResult.success,
// //                     firebase: notificationResult.channels?.firebase?.success,
// //                     whatsapp: notificationResult.channels?.whatsapp?.success
// //                 });
                
// //             } catch (notifyError) {
// //                 console.error(`❌ Notification error:`, notifyError.message);
// //             }

// //             await sendPaymentInstructions(message, userSession, newOrder);
// //             await sendOrderConfirmation(message, userSession, customerPhone);

// //             userSession.state = 'AWAITING_PAYMENT_PROOF';
// //             userSession.orderData.paymentRequestedAt = new Date().toISOString();

// //             schedulePaymentReminder(userSession, customerPhone, newOrder);

// //         } catch (error) {
// //             console.error('❌ API Error creating order:', {
// //                 error: error.message,
// //                 stack: error.stack,
// //                 customerName: userSession.orderData?.customerName,
// //                 customerPhone: customerPhone,
// //                 orderNumber: userSession.orderData?.orderNumber,
// //                 productId: userSession.orderData?.productId,
// //                 quantity: userSession.orderData?.quantity
// //             });
            
// //             if (error.message.includes('Insufficient stock') || 
// //                 error.message.includes('stock') || 
// //                 error.response?.data?.message?.includes('stock')) {
                
// //                 await message.reply(
// //                     `❌ *Stock Unavailable*\n\n` +
// //                     `"${userSession.orderData.productName}" is no longer available in the requested quantity.\n\n` +
// //                     `💡 *Please try:*\n` +
// //                     `• Check current stock by typing *Products*\n` +
// //                     `• Choose another product\n` +
// //                     `• Contact support for availability\n\n` +
// //                     `🔄 Type *Products* to browse available items.`
// //                 );
                
// //             } else {
// //                 await message.reply(
// //                     `❌ *Order Failed*\n\n` +
// //                     `We encountered an error while creating your order.\n\n` +
// //                     `*Please try again or contact support:*\n` +
// //                     `📞 Support: +91 XXXXX XXXXX\n` +
// //                     `📧 Email: support@posterpro.store\n\n` +
// //                     `*Error Details:*\n` +
// //                     `\`${error.message.substring(0, 100)}\`\n\n` +
// //                     `🔄 *Please start over by typing:* Order`
// //                 );
// //             }
            
// //             userSession.state = 'IDLE';
// //             delete userSession.orderData;
// //         }

// //     } else if (response === 'cancel' || response.includes('cancel')) {
// //         await handleOrderCancellation(message, userSession);
        
// //     } else {
// //         const totalWithGst = safeNumber(userSession.orderData.totalWithGst) || safeNumber(userSession.orderData.totalPrice);
        
// //         await message.reply(
// //             `❓ *Please confirm your order*\n\n` +
// //             `To place your order, type: *PLACE ORDER*\n\n` +
// //             `*Order Summary:*\n` +
// //             `👤 Customer: ${userSession.orderData.customerName}\n` +
// //             `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
// //             `🛍️ Product: ${userSession.orderData.productName}\n` +
// //             `📦 Quantity: ${userSession.orderData.quantity}\n` +
// //             `💰 Total: ₹${safeToFixed(totalWithGst)}\n` +
// //             `📊 Available Stock: ${safeNumber(userSession.orderData.stock)} units\n\n` +
// //             `📍 Shipping to:\n${userSession.orderData.completeAddress}\n\n` +
// //             `💡 *Type CANCEL to stop order process*`
// //         );
// //     }
// // }

// // /**
// //  * Send payment instructions to customer
// //  */
// // async function sendPaymentInstructions(message, userSession, order) {
// //     const orderNumber = order.orderNumber || userSession.orderData.orderNumber;
// //     const amount = order.totalPrice || userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
// //     const gstAmount = order.totalGst || userSession.orderData.gstAmount || 0;
    
// //     try {
// //         await message.reply(
// //             `🎉 *YOUR ORDER IS CONFIRMED!*\n\n` +
// //             `👤 *Customer:* ${userSession.orderData.customerName}\n` +
// //             `🧾 *Order Number:* ${orderNumber}\n` +
// //             `💵 *Amount to Pay:* ₹${safeToFixed(amount)}\n` +
// //             `📦 *Item:* ${userSession.orderData.productName} x${userSession.orderData.quantity}\n` +
// //             (gstAmount > 0 ? `💵 *GST Included:* ₹${safeToFixed(gstAmount)}\n` : '') +
// //             `⏰ *Payment Deadline:* 24 hours\n\n` +
// //             `💳 *PAYMENT INSTRUCTIONS*\n\n` +
// //             `1️⃣ *UPI Payment (Recommended):*\n` +
// //             `📱 UPI ID: posterpro.store@upi\n\n` +
// //             `2️⃣ *QR Code:* Available on request\n\n` +
// //             `🔢 *MANDATORY PAYMENT NOTES:*\n` +
// //             `• Amount must be exact: ₹${safeToFixed(amount)}\n` +
// //             `• Add note: Order ${orderNumber} - ${userSession.orderData.customerName}\n` +
// //             `• Keep screenshot of successful payment\n\n` +
// //             `📸 *After payment:*\n` +
// //             `Send screenshot here within 24 hours`
// //         );

// //         await new Promise(resolve => setTimeout(resolve, 1000));
        
// //         await message.reply(
// //             `📋 *PAYMENT VERIFICATION PROCESS*\n\n` +
// //             `1. Make payment to subaask21@oksbi\n` +
// //             `2. Take clear screenshot of:\n` +
// //             `   ✅ "Payment Successful" message\n` +
// //             `   ✅ Amount: ₹${safeToFixed(amount)}\n` +
// //             `   ✅ UPI ID: subaask21@oksbi\n` +
// //             `   ✅ Transaction ID\n` +
// //             `   ✅ Date & Time\n\n` +
// //             `3. Send screenshot here\n\n` +
// //             `⏱️ *Verification Time:* 5-15 minutes\n` +
// //             `✅ *Order Process:* Immediate after verification\n\n` +
// //             `🔄 *Payment failed?* Try again and send new screenshot\n` +
// //             `❓ *Need help?* Reply with your question`
// //         );

// //     } catch (error) {
// //         console.error('❌ Error sending payment instructions:', error);
// //         await message.reply(
// //             `🎉 Order confirmed for ${userSession.orderData.customerName}!\n` +
// //             `Pay ₹${safeToFixed(amount)} to subaask21@oksbi\n\n` +
// //             `Order: ${orderNumber}\n` +
// //             `Send payment screenshot here.`
// //         );
// //     }
// // }

// // /**
// //  * Send order confirmation to customer
// //  */
// // async function sendOrderConfirmation(message, userSession, customerPhone) {
// //     const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    
// //     try {
// //         await message.reply(
// //             `✅ *Order Confirmed Successfully!*\n\n` +
// //             `Dear ${userSession.orderData.customerName},\n\n` +
// //             `Your order #${userSession.orderData.orderNumber} has been confirmed!\n\n` +
// //             `📊 *Order Details:*\n` +
// //             `• Order #: ${userSession.orderData.orderNumber}\n` +
// //             `• Amount: ₹${safeToFixed(amount)}\n` +
// //             `• Product: ${userSession.orderData.productName} x${userSession.orderData.quantity}\n\n` +
// //             `⏰ *Next Steps:*\n` +
// //             `1. Make payment to UPI ID: posterpro.store@upi\n` +
// //             `2. Send payment screenshot here\n` +
// //             `3. Order will be processed after payment verification\n\n` +
// //             `🕒 *Processing Time:* 24-48 hours after payment\n\n` +
// //             `📞 *Need Help?* Contact: +91 XXXXX XXXXX`
// //         );
        
// //         console.log(`📱 Order confirmation sent via WhatsApp to: ${userSession.orderData.customerName} (${customerPhone})`);
        
// //     } catch (error) {
// //         console.error('❌ Error sending order confirmation:', error);
// //         await message.reply(
// //             `✅ Order #${userSession.orderData.orderNumber} confirmed!\n` +
// //             `Amount: ₹${safeToFixed(amount)}\n` +
// //             `Please make payment and send screenshot.`
// //         );
// //     }
// // }

// // /**
// //  * Schedule payment reminder
// //  */
// // function schedulePaymentReminder(userSession, customerPhone, order) {
// //     const reminderTime = 60 * 60 * 1000; // 1 hour
    
// //     setTimeout(async () => {
// //         try {
// //             const currentOrder = await apiService.getOrderById(order._id);
            
// //             if (currentOrder && currentOrder.paymentStatus === 'pending') {
// //                 console.log(`⏰ Sending payment reminder for order: ${order.orderNumber}`);
                
// //                 try {
// //                     await notificationManager.sendNotification('PAYMENT_REMINDER', {
// //                         orderNumber: order.orderNumber,
// //                         customerName: order.customerName,
// //                         customerPhone: order.customerPhone,
// //                         totalAmount: order.totalPrice,
// //                         reminderType: '24_hour'
// //                     });
// //                 } catch (reminderError) {
// //                     console.error('Payment reminder notification failed:', reminderError.message);
// //                 }
// //             }
// //         } catch (error) {
// //             console.error('❌ Error in payment reminder:', error);
// //         }
// //     }, reminderTime);
// // }

// // /**
// //  * Handle order cancellation
// //  */
// // async function handleOrderCancellation(message, userSession) {
// //     const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    
// //     await message.reply(
// //         `🛑 *Cancel Order Process?*\n\n` +
// //         `Are you sure you want to cancel this order?\n\n` +
// //         `*Order Details:*\n` +
// //         `👤 Customer: ${userSession.orderData.customerName}\n` +
// //         `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
// //         `🛍️ Product: ${userSession.orderData.productName}\n` +
// //         `💰 Amount: ₹${safeToFixed(amount)}\n\n` +
// //         `✅ Type *YES* to cancel and clear all details\n` +
// //         `❌ Type *NO* to continue with your order\n\n` +
// //         `*Note:* This action cannot be undone.`
// //     );
    
// //     userSession.previousState = userSession.state;
// //     userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
// // }

// // async function handlePaymentProof(message, userSession, userSessions, client) {
// //     const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
// //     const whatsappNumber = apiService.cleanPhoneNumber(message.from); // Get WhatsApp number for identification
    
// //     if (message.hasMedia) {
// //         try {
// //             // Store payment proof data with WhatsApp number for verification
// //             userSession.orderData.lastPaymentMessage = {
// //                 from: message.from,
// //                 whatsappNumber: whatsappNumber,
// //                 timestamp: new Date().toISOString(),
// //                 customerName: userSession.orderData.customerName,
// //                 orderNumber: userSession.orderData.orderNumber,
// //                 amount: amount,
// //                 deliveryPhone: userSession.orderData.phoneNumber
// //             };
            
// //             // Log for debugging
// //             console.log('📸 Payment proof received:', {
// //                 orderNumber: userSession.orderData.orderNumber,
// //                 whatsappNumber: whatsappNumber,
// //                 customerName: userSession.orderData.customerName,
// //                 amount: amount
// //             });
            
// //             await handlePaymentVerification(message, client);
            
// //         } catch (error) {
// //             console.error('❌ Error in payment proof handling:', error);
// //             await message.reply(
// //                 `❌ *Error Processing Payment*\n\n` +
// //                 `Failed to process your payment screenshot. Please try again.\n\n` +
// //                 `*Please ensure:*\n` +
// //                 `✅ Clear screenshot of payment success\n` +
// //                 `✅ Amount ₹${safeToFixed(amount)} visible\n` +
// //                 `✅ UPI ID: subaask21@oksbi visible\n\n` +
// //                 `Send the screenshot again.`
// //             );
// //         }
        
// //     } else {
// //         const userMessage = message.body.trim().toLowerCase();
// //         if (userMessage.includes('cancel')) {
// //             await handleOrderCancellation(message, userSession);
// //             return;
// //         }
        
// //         await message.reply(
// //             `📸 *Payment Proof Required*\n\n` +
// //             `Dear ${userSession.orderData.customerName}, please send the screenshot of your payment confirmation.\n\n` +
// //             `💡 *How to take screenshot:*\n` +
// //             `1. Complete payment to subaask21@oksbi\n` +
// //             `2. Take screenshot of payment success screen\n` +
// //             `3. Make sure amount ₹${safeToFixed(amount)} is visible\n` +
// //             `4. Send the screenshot here\n\n` +
// //             `If you haven't paid yet, please complete the payment first.\n\n` +
// //             `💡 Type *CANCEL* to stop order process`
// //         );
// //         return;
// //     }
// // }

// // // Helper function to validate image URLs
// // async function isValidImageUrl(url) {
// //     if (!url || typeof url !== 'string') return false;
// //     try {
// //         new URL(url);
// //         const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
// //         return imageExtensions.some(ext => url.toLowerCase().includes(ext));
// //     } catch {
// //         return false;
// //     }
// // }





























// // handlers/orderHandler.js - PROFESSIONAL MULTI-TENANT VERSION
// // Handles order flow with company isolation and proper customer identification

// import pkg from 'whatsapp-web.js';
// import apiService from "../../services/apiService.js";
// import handlePaymentVerification from './paymentVerificationHandler.js';
// import notificationManager from "../../services/notifications/notification-manager.js";
// import companyConfig from '../../shared/companyConfig.js';
// import { parseCombinedAddress, getAddressFormatInstructions } from '../../utils/addressParser.js';
// import getSessionManager from '../sessionManager.js';

// const { MessageMedia } = pkg;

// // Safe number utilities
// const safeNumber = (value, defaultValue = 0) => {
//     if (value === null || value === undefined) return defaultValue;
//     if (typeof value === 'number') return value;
//     const parsed = parseFloat(value);
//     return isNaN(parsed) ? defaultValue : parsed;
// };

// const safeToFixed = (value, digits = 2) => {
//     const num = safeNumber(value);
//     return num.toFixed(digits);
// };

// /**
//  * Format custom ID to 5-digit format (00123)
//  */
// const formatCustomId = (id) => {
//     if (!id && id !== 0) return null;
//     return String(id).padStart(5, '0');
// };

// /**
//  * Parse custom ID from various formats
//  */
// const parseCustomId = (input) => {
//     if (!input) return null;
//     let str = String(input).trim();
//     const digits = str.replace(/\D/g, '');
//     if (digits.length > 0) {
//         return parseInt(digits, 10);
//     }
//     return null;
// };

// /**
//  * Format address for display
//  */
// const formatAddressString = (addressObj) => {
//     if (!addressObj) return '';
//     if (typeof addressObj === 'string') return addressObj;
    
//     const parts = [];
//     if (addressObj.doorNumber) parts.push(addressObj.doorNumber);
//     if (addressObj.streetName) parts.push(addressObj.streetName);
//     if (addressObj.areaLocality) parts.push(addressObj.areaLocality);
//     if (addressObj.cityDistrict) parts.push(addressObj.cityDistrict);
//     if (addressObj.state) parts.push(addressObj.state);
//     if (addressObj.pincode) parts.push(addressObj.pincode);
    
//     return parts.join(', ');
// };

// /**
//  * Extract clean phone number from WhatsApp message
//  */
// const extractCustomerPhone = (message) => {
//     if (!message || !message.from) return 'Unknown';
    
//     try {
//         const fullId = message.from;
//         const numberPart = fullId.split('@')[0];
//         const digitsOnly = numberPart.replace(/\D/g, '');
        
//         console.log(`📞 [Phone Extraction] Original: ${fullId}, Digits: ${digitsOnly}`);
        
//         // Malawi country code (265) followed by Indian number
//         if (digitsOnly.length === 13 && digitsOnly.startsWith('265')) {
//             const indianNumber = digitsOnly.substring(3);
//             console.log(`📱 Malawi format → Indian: ${indianNumber}`);
//             return indianNumber;
//         }
        
//         // Indian format with country code
//         if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
//             const customerPhone = digitsOnly.substring(2);
//             console.log(`📱 Indian format → Customer: ${customerPhone}`);
//             return customerPhone;
//         }
        
//         // Direct 10-digit number
//         if (digitsOnly.length === 10) {
//             console.log(`📱 Direct 10-digit → Customer: ${digitsOnly}`);
//             return digitsOnly;
//         }
        
//         // Other country codes - take last 10 digits
//         if (digitsOnly.length > 10) {
//             const last10 = digitsOnly.slice(-10);
//             console.log(`📱 Foreign format → Last 10 digits: ${last10}`);
//             return last10;
//         }
        
//         return digitsOnly || 'Unknown';
        
//     } catch (error) {
//         console.error('❌ [Phone Extraction] Error:', error);
//         return 'Unknown';
//     }
// };

// export async function handleOrderFlow(message, client, userSession, userSessions, companyId = null) {
//     const userMessage = message.body.trim();
//     const from = message.from;
//     const customerPhone = extractCustomerPhone(message);

//     try {
//         // Ensure orderFlowMode is ALWAYS set in session
//         if (!userSession.orderFlowMode) {
//             console.log(`🔍 [Company:${companyId}] orderFlowMode missing, fetching...`);
//             const orderFlowMode = await companyConfig.getOrderFlowMode(companyId);
//             userSession.orderFlowMode = orderFlowMode;
//             userSession.companyId = companyId;
//             console.log(`📋 Set orderFlowMode: ${orderFlowMode} for company ${companyId}`);
//         }

//         // Check if user is starting a new order
//         if (userSession.state === 'IDLE' && userMessage.toLowerCase() === 'order') {
//             const orderFlowMode = await companyConfig.getOrderFlowMode(companyId);
//             userSession.orderFlowMode = orderFlowMode;
//             userSession.companyId = companyId;
//             console.log(`📋 Order flow mode for ${customerPhone} (company ${companyId}): ${orderFlowMode}`);
//             return await startOrderConfirmation(message, userSession);
//         }

//         // Check for cancellation at ANY point
//         if (userSession.state !== 'AWAITING_CANCELLATION_CONFIRMATION' && 
//             await handleCancellationRequest(message, userSession, userSessions)) {
//             return;
//         }

//         switch (userSession.state) {
//             case 'START_ORDER':
//                 return await startOrderConfirmation(message, userSession);
            
//             case 'AWAITING_ORDER_CONFIRMATION':
//                 return await handleOrderStartConfirmation(message, userSession);
            
//             case 'AWAITING_PRODUCT_ID':
//                 return await handleProductIdInput(message, userSession, client, companyId);
            
//             case 'AWAITING_QUANTITY':
//                 return await handleQuantityInput(message, userSession);
            
//             case 'AWAITING_PRODUCT_CONFIRMATION':
//                 return await handleProductConfirmation(message, userSession);
            
//             case 'AWAITING_OPTIONS':
//                 return await handleOptionsInput(message, userSession);
            
//             case 'AWAITING_NAME':
//                 return await handleCustomerName(message, userSession);
            
//             case 'AWAITING_PRIMARY_PHONE':
//                 return await handlePrimaryPhone(message, userSession);
            
//             case 'AWAITING_SECONDARY_PHONE':
//                 return await handleSecondaryPhone(message, userSession);
            
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
//                 return await handleFinalConfirmation(message, userSession, userSessions, from, client, companyId);
            
//             case 'AWAITING_PAYMENT_PROOF':
//                 return await handlePaymentProof(message, userSession, userSessions, client, companyId);
            
//             case 'AWAITING_STOCK_ADJUSTMENT':
//                 return await handleStockAdjustment(message, userSession);
            
//             case 'AWAITING_CANCELLATION_CONFIRMATION':
//                 return await handleCancellationConfirmation(message, userSession, userSessions);
            
//             case 'AWAITING_COMBINED_ADDRESS':
//                 return await handleCombinedAddress(message, userSession);
            
//             default:
//                 userSession.state = 'IDLE';
//                 return await message.reply('🔄 Session reset. Type *Products* to browse or *Order* to start again.');
//         }
//     } catch (error) {
//         console.error('❌ Order flow error:', error);
//         userSession.state = 'IDLE';
//         await message.reply('❌ Order process interrupted. Please start again with *Order*.');
//     }
// }

// /**
//  * Handle cancellation requests at ANY point
//  */
// async function handleCancellationRequest(message, userSession, userSessions) {
//     const userMessage = message.body.trim().toLowerCase();
//     const cancellationKeywords = [
//         'cancel', 'stop', 'quit', 'exit', 'no', 'nevermind', 
//         'never mind', 'forget it', 'abort', 'end', 'bye'
//     ];

//     if (cancellationKeywords.some(keyword => userMessage.includes(keyword))) {
//         await message.reply(
//             `🛑 *Cancel Order Process?*\n\n` +
//             `Are you sure you want to cancel the current order process?\n\n` +
//             `✅ Type *YES* to confirm cancellation\n` +
//             `❌ Type *NO* to continue ordering\n\n` +
//             `This will clear all your current order details.`
//         );
        
//         userSession.previousState = userSession.state;
//         userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
//         return true;
//     }

//     return false;
// }

// /**
//  * Handle cancellation confirmation
//  */
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
        
//         userSession.state = 'IDLE';
//         if (userSession.orderData) {
//             delete userSession.orderData;
//         }
//         if (userSession.previousState) {
//             delete userSession.previousState;
//         }
//         return;
        
//     } else if (userMessage === 'no' || userMessage === 'n') {
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

// /**
//  * Handle stock adjustment when insufficient stock
//  */
// async function handleStockAdjustment(message, userSession) {
//     const userMessage = message.body.trim().toLowerCase();
    
//     if (userMessage.startsWith('adjust')) {
//         const parts = userMessage.split(' ');
//         const requestedQuantity = parseInt(parts[1]);
        
//         if (isNaN(requestedQuantity) || requestedQuantity < 1) {
//             await message.reply(
//                 `❌ *Invalid Quantity*\n\n` +
//                 `Please enter a valid number. Example: *ADJUST 2*\n\n` +
//                 `📦 Available: ${safeNumber(userSession.orderData.currentProduct?.stock)} units\n\n` +
//                 `💡 Type *ADJUST X* where X is the quantity you want`
//             );
//             return;
//         }
        
//         const availableStock = safeNumber(userSession.orderData.currentProduct?.stock);
        
//         if (requestedQuantity > availableStock) {
//             await message.reply(
//                 `❌ *Cannot Adjust*\n\n` +
//                 `You requested ${requestedQuantity} units, but only ${availableStock} are available.\n\n` +
//                 `💡 Type *ADJUST ${availableStock}* to order all available units`
//             );
//             return;
//         }
        
//         userSession.orderData.quantity = requestedQuantity;
//         userSession.orderData.totalPrice = safeNumber(userSession.orderData.price) * requestedQuantity;
        
//         userSession.state = userSession.previousState;
//         delete userSession.previousState;
//         delete userSession.orderData.currentProduct;
        
//         await message.reply(
//             `✅ *Quantity Adjusted*\n\n` +
//             `Updated to ${requestedQuantity} units of "${userSession.orderData.productName}"\n\n` +
//             `💰 New Total: ₹${safeToFixed(userSession.orderData.totalPrice)}\n\n` +
//             `🤔 *Confirm this adjusted order?*\n\n` +
//             `Type *PLACE ORDER* to confirm\n` +
//             `Type *CANCEL* to stop order process`
//         );
        
//     } else if (userMessage === 'new') {
//         await message.reply(
//             `🔄 *Choose New Product*\n\n` +
//             `Please enter the Product ID of the new product you want:\n\n` +
//             `💡 Type *Products* to see all available products with their IDs\n\n` +
//             `💡 *You can use:*\n` +
//             `• MongoDB ID: 64abc123def456789abc1234\n` +
//             `• Custom ID: 00101\n` +
//             `• Formatted ID: 00101\n\n` +
//             `📝 *Enter Product ID:*`
//         );
//         userSession.state = 'AWAITING_PRODUCT_ID';
        
//     } else if (userMessage === 'cancel') {
//         await handleOrderCancellation(message, userSession);
        
//     } else {
//         await message.reply(
//             `❓ *Please choose an option:*\n\n` +
//             `1️⃣ Type *ADJUST X* (where X is quantity)\n` +
//             `2️⃣ Type *NEW* to choose another product\n` +
//             `3️⃣ Type *CANCEL* to stop order process\n\n` +
//             `📦 Available: ${safeNumber(userSession.orderData.currentProduct?.stock)} units`
//         );
//     }
// }

// /**
//  * Get state-specific messages
//  */
// function getStateSpecificMessage(state) {
//     const messages = {
//         'AWAITING_NAME': '👤 Please enter your full name:',
//         'AWAITING_PRIMARY_PHONE': '📱 Please enter your primary phone number:',
//         'AWAITING_SECONDARY_PHONE': '📱 Please enter secondary phone number (or type SKIP):',
//         'AWAITING_PRODUCT_ID': '📝 Please enter the Product ID:\n\n💡 *You can use:*\n• MongoDB ID: 64abc123def456789abc1234\n• Custom ID: 00101\n• Formatted ID: 00101',
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
//         'AWAITING_PAYMENT_PROOF': '📸 Please send payment screenshot:',
//         'AWAITING_STOCK_ADJUSTMENT': '📊 Please adjust quantity or choose another product:',
//         'AWAITING_COMBINED_ADDRESS': '🏠 Please enter your complete address in one line:'
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
//             `First, let's get your contact details:\n\n` +
//             `1️⃣ *Please enter your full name:*\n\n` +
//             `📝 *Example:* John Doe\n\n` +
//             `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
//         );
//         userSession.state = 'AWAITING_NAME';
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

// async function handleCustomerName(message, userSession) {
//     const customerName = message.body.trim();
    
//     if (customerName.length < 2) {
//         await message.reply(
//             `❌ *Please enter a valid name*\n\n` +
//             `Name should be at least 2 characters long.\n\n` +
//             `📝 *Enter your full name:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData = {
//         customerName: customerName,
//         address: {
//             doorNumber: '',
//             streetName: '',
//             areaLocality: '',
//             cityDistrict: '',
//             state: '',
//             pincode: '',
//             country: 'India'
//         },
//         gstType: 'intra-state',
//         paymentMethod: 'upi'
//     };

//     await message.reply(
//         `✅ *Name saved!* 👤\n\n` +
//         `2️⃣ *Please enter your primary phone number:*\n\n` +
//         `📱 *Format:* 10-digit mobile number\n` +
//         `📝 *Example:* 9876543210\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_PRIMARY_PHONE';
// }

// async function handlePrimaryPhone(message, userSession) {
//     const phoneNumber = message.body.trim().replace(/\D/g, '');
    
//     if (phoneNumber.length !== 10) {
//         await message.reply(
//             `❌ *Invalid Phone Number*\n\n` +
//             `Please enter a valid 10-digit mobile number.\n\n` +
//             `📱 *Format:* 9876543210\n` +
//             `📝 *Example:* 9876543210\n\n` +
//             `📝 *Enter your primary phone number:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.phoneNumber = phoneNumber;

//     await message.reply(
//         `✅ *Primary phone saved!* 📱\n\n` +
//         `3️⃣ *Secondary Phone (Optional):*\n\n` +
//         `Do you have an alternate phone number?\n\n` +
//         `📝 *Enter secondary phone number or type SKIP:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_SECONDARY_PHONE';
// }

// async function handleSecondaryPhone(message, userSession) {
//     const userInput = message.body.trim();
    
//     if (userInput.toLowerCase() === 'skip') {
//         userSession.orderData.secondaryPhoneNumber = null;
//     } else {
//         const secondaryPhone = userInput.replace(/\D/g, '');
        
//         if (secondaryPhone.length !== 10 && secondaryPhone.length > 0) {
//             await message.reply(
//                 `❌ *Invalid Secondary Phone*\n\n` +
//                 `Please enter a valid 10-digit mobile number.\n\n` +
//                 `📱 *Format:* 9876543210\n` +
//                 `📝 *Example:* 9876543210\n\n` +
//                 `📝 *Enter secondary phone number or type SKIP:*\n\n` +
//                 `💡 Type *CANCEL* to stop order process`
//             );
//             return;
//         }
        
//         userSession.orderData.secondaryPhoneNumber = secondaryPhone || null;
//     }

//     await message.reply(
//         `✅ *Contact details saved!* ✅\n\n` +
//         `4️⃣ *Now let's select your product:*\n\n` +
//         `Please enter the *Product ID* you want to order:\n\n` +
//         `💡 *How to find Product ID:*\n` +
//         `• Type *Products* to see all products with their IDs\n` +
//         `• Look for the ID next to each product\n\n` +
//         `💡 *You can use these formats:*\n` +
//         `• MongoDB ID: 64abc123def456789abc1234\n` +
//         `• Custom ID: 00101 (product code)\n` +
//         `• Formatted ID: 00101 (display format)\n\n` +
//         `📝 *Enter Product ID:*\n\n` +
//         `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
//     );
//     userSession.state = 'AWAITING_PRODUCT_ID';
// }

// /**
//  * Handle Product ID Input with company validation
//  */
// async function handleProductIdInput(message, userSession, client, companyId) {
//     const productId = message.body.trim();
    
//     console.log(`🔍 Product ID input: "${productId}" for company ${companyId}`);
    
//     const isMongoId = /^[0-9a-fA-F]{24}$/.test(productId);
//     const customIdNum = parseCustomId(productId);
//     const isCustomId = customIdNum !== null;
    
//     if (!isMongoId && !isCustomId) {
//         await message.reply(
//             `❌ *Invalid Product ID Format*\n\n` +
//             `Please enter a valid Product ID.\n\n` +
//             `💡 *Accepted formats:*\n` +
//             `• MongoDB ID: 64abc123def456789abc1234\n` +
//             `• Custom ID: 00101 or 101\n` +
//             `• Formatted ID: 00101\n\n` +
//             `📝 *Enter correct Product ID:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     try {
//         console.log(`🔍 Fetching product with: ${isMongoId ? 'MongoDB ID: ' + productId : 'Custom ID: ' + customIdNum}`);
        
//         let product = null;
        
//         if (isMongoId) {
//             product = await apiService.getProductById(productId, companyId);
//         }
        
//         if (!product && isCustomId) {
//             console.log(`🔍 Attempting to find product by custom ID: ${customIdNum}`);
//             const allProducts = await apiService.getProducts(companyId);
//             if (allProducts && allProducts.length > 0) {
//                 product = allProducts.find(p => 
//                     p.customId === customIdNum || 
//                     (p.customId && String(p.customId) === String(customIdNum)) ||
//                     (p.customId && formatCustomId(p.customId) === productId)
//                 );
//             }
//         }
        
//         console.log('📦 Product search result:', product ? 'Found' : 'Not found');
        
//         if (!product) {
//             await message.reply(
//                 `❌ *Product Not Found*\n\n` +
//                 `No product found with ID: ${productId}\n\n` +
//                 `💡 *Please check:*\n` +
//                 `• Make sure you typed the ID correctly\n` +
//                 `• Type *Products* to see all available products\n` +
//                 `• Try searching by product name\n\n` +
//                 `📝 *Enter correct Product ID:*\n\n` +
//                 `💡 Type *CANCEL* to stop order process`
//             );
//             return;
//         }

//         // Verify product belongs to this company
//         if (product.companyId && companyId && product.companyId.toString() !== companyId.toString()) {
//             await message.reply(
//                 `❌ *Product Not Available*\n\n` +
//                 `This product does not belong to your current company.\n\n` +
//                 `💡 Please choose another product by typing *Products*`
//             );
//             userSession.state = 'IDLE';
//             return;
//         }

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

//         const sellingPrice = safeNumber(product.discountPrice) || safeNumber(product.price);
//         const mrp = safeNumber(product.mrp) || sellingPrice;
//         const discountPercentage = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

//         const productImageUrl = product.imageUrls && product.imageUrls.length > 0 
//             ? product.imageUrls[0] 
//             : product.imageUrl;

//         // Store product data in session
//         userSession.orderData.productId = product._id || product.id;
//         userSession.orderData.productName = product.productName;
//         userSession.orderData.mrp = mrp;
//         userSession.orderData.price = sellingPrice;
//         userSession.orderData.imageUrl = productImageUrl;
//         userSession.orderData.options = product.options;
//         userSession.orderData.stock = safeNumber(product.stock);
//         userSession.orderData.sku = product.sku;
//         userSession.orderData.hsnCode = product.hsnCode;
//         userSession.orderData.gstRate = safeNumber(product.gstRate, 18);
//         userSession.orderData.gstIncluded = product.gstIncluded !== false;
        
//         userSession.orderData.mongoId = product._id || product.id;
//         userSession.orderData.customId = product.customId;
//         userSession.orderData.formattedId = product.customId ? formatCustomId(product.customId) : null;

//         let productInfo = 
//             `✅ *Product Found!*\n\n` +
//             `👤 *Customer:* ${userSession.orderData.customerName}\n` +
//             `📱 *Phone:* ${userSession.orderData.phoneNumber}\n` +
//             `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
//             `🛍️ *Product:* ${product.productName}\n`;

//         if (product.customId) {
//             productInfo += `🔢 *Product Code:* ${formatCustomId(product.customId)}\n`;
//         }

//         if (mrp > sellingPrice) {
//             productInfo += `💰 *MRP:* ~~₹${safeToFixed(mrp)}~~\n`;
//             productInfo += `💵 *Our Price:* ₹${safeToFixed(sellingPrice)} (*${discountPercentage}% OFF*)\n`;
//         } else {
//             productInfo += `💰 *Price:* ₹${safeToFixed(sellingPrice)}\n`;
//         }

//         productInfo += 
//             `📦 *Available:* ${safeNumber(product.stock)} units\n` +
//             (product.sku ? `📌 *SKU:* ${product.sku}\n` : '') +
//             (product.hsnCode ? `🔢 *HSN:* ${product.hsnCode}\n` : '') +
//             (safeNumber(product.gstRate) > 0 ? `💵 *GST:* ${safeNumber(product.gstRate)}%\n` : '');

//         if (product.description) {
//             productInfo += `📝 *Description:* ${product.description}\n`;
//         }

//         productInfo += 
//             `\n🎯 *Now, please enter quantity:*\n\n` +
//             `💡 *Note:* Maximum ${safeNumber(product.stock)} units available\n` +
//             `📝 *Enter quantity (1-${safeNumber(product.stock)}):*\n\n` +
//             `💡 Type *CANCEL* to stop order process`;

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

//     if (isNaN(quantity) || quantity < 1) {
//         await message.reply(
//             `❌ *Invalid Quantity*\n\n` +
//             `Please enter a valid number (minimum 1).\n\n` +
//             `📝 *Enter quantity for ${userSession.orderData.productName}:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     const availableStock = safeNumber(userSession.orderData.stock);
    
//     if (quantity > availableStock) {
//         await message.reply(
//             `❌ *Insufficient Stock*\n\n` +
//             `Only ${availableStock} units available for "${userSession.orderData.productName}".\n\n` +
//             `💡 Please enter quantity between 1-${availableStock}\n\n` +
//             `📝 *Enter quantity:*\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }

//     userSession.orderData.quantity = quantity;
//     userSession.orderData.totalPrice = safeNumber(userSession.orderData.price) * quantity;

//     const gstRate = safeNumber(userSession.orderData.gstRate, 18);
//     const gstAmount = (userSession.orderData.totalPrice * gstRate) / 100;
//     userSession.orderData.gstAmount = gstAmount;
//     userSession.orderData.subtotal = userSession.orderData.totalPrice;
//     userSession.orderData.totalWithGst = userSession.orderData.totalPrice + gstAmount;

//     let confirmationText = 
//         `📋 *Order Summary*\n\n` +
//         `👤 *Customer:* ${userSession.orderData.customerName}\n` +
//         `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
//         `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
//         `🛍️ *Product:* ${userSession.orderData.productName}\n`;

//     if (userSession.orderData.customId) {
//         confirmationText += `🔢 *Product Code:* ${userSession.orderData.formattedId}\n`;
//     }

//     confirmationText += 
//         `💰 *Unit Price:* ₹${safeToFixed(userSession.orderData.price)}\n` +
//         `🛒 *Quantity:* ${quantity}\n` +
//         `💵 *Subtotal:* ₹${safeToFixed(userSession.orderData.subtotal)}\n`;

//     if (gstRate > 0) {
//         confirmationText += `💵 *GST (${gstRate}%):* ₹${safeToFixed(gstAmount)}\n`;
//         confirmationText += `💰 *Total with GST:* ₹${safeToFixed(userSession.orderData.totalWithGst)}\n`;
//     } else {
//         confirmationText += `💰 *Total Amount:* ₹${safeToFixed(userSession.orderData.totalPrice)}\n`;
//     }

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
//         `* please enter the correct details *\n\n` +
//         `1️⃣ *Door/Flat Number:*\n\n` +
//         `📝 *Enter your door or flat number:*\n\n` +
//         `💡 Type *CANCEL* to stop order process`
//     );
//     userSession.state = 'AWAITING_DOOR_NUMBER';
// }

// /**
//  * Handle product confirmation with flow mode branching
//  */
// async function handleProductConfirmation(message, userSession) {
//     console.log('🔍 [DEBUG] ===== ENTERING handleProductConfirmation =====');
//     console.log('🔍 [DEBUG] orderFlowMode value:', userSession.orderFlowMode);
//     console.log('🔍 [DEBUG] orderFlowMode type:', typeof userSession.orderFlowMode);
    
//     const response = message.body.trim().toLowerCase();
    
//     if (response === 'confirm') {
//         console.log('🔍 [DEBUG] User typed CONFIRM');
//         console.log('🔍 [DEBUG] Checking if mode is short:', userSession.orderFlowMode === 'short');
        
//         if (userSession.orderFlowMode === 'short') {
//             console.log('🔍 [DEBUG] ✅ SHORT MODE - Going to combined address');
//             await message.reply(
//                 `🏠 *Shipping Address*\n\n` +
//                 `Please enter your complete address in ONE line:\n\n` +
//                 `📝 *Format:*\n` +
//                 `Door No, Street, Area/Locality, City, State\n\n` +
//                 `📝 *Example:*\n` +
//                 `12, MG Road, Indiranagar, Bangalore, Karnataka\n\n` +
//                 `📍 *Note:* Pincode will be asked separately\n\n` +
//                 `📝 *Enter your address:*`
//             );
//             userSession.state = 'AWAITING_COMBINED_ADDRESS';
//             console.log('🔍 [DEBUG] State changed to: AWAITING_COMBINED_ADDRESS');
//         } else {
//             console.log('🔍 [DEBUG] ❌ LONG MODE - Going to step-by-step address');
//             await message.reply(
//                 `🏠 *Shipping Address Details*\n\n` +
//                 `Let's collect your shipping address step by step:\n\n` +
//                 `* please enter the correct details *\n\n` +
//                 `1️⃣ *Door/Flat Number:*\n\n` +
//                 `📝 *Enter your door or flat number:*\n\n` +
//                 `💡 Type *CANCEL* to stop order process`
//             );
//             userSession.state = 'AWAITING_DOOR_NUMBER';
//             console.log('🔍 [DEBUG] State changed to: AWAITING_DOOR_NUMBER');
//         }
//     } else {
//         console.log('🔍 [DEBUG] User did NOT type CONFIRM, they typed:', response);
//         await message.reply(
//             `❓ Please type *CONFIRM* to continue.\n\n` +
//             `Customer: ${userSession.orderData.customerName}\n` +
//             `Phone: ${userSession.orderData.phoneNumber}\n` +
//             `Product: ${userSession.orderData.productName}\n` +
//             `Quantity: ${userSession.orderData.quantity}\n` +
//             `Total: ₹${safeToFixed(userSession.orderData.totalWithGst || userSession.orderData.totalPrice)}\n\n` +
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

// /**
//  * Handle combined address in SHORT mode
//  */
// async function handleCombinedAddress(message, userSession) {
//     const addressString = message.body.trim();
    
//     try {
//         const parsed = parseCombinedAddress(addressString);
        
//         userSession.orderData.address = {
//             doorNumber: parsed.doorNumber,
//             streetName: parsed.streetName,
//             areaLocality: parsed.areaLocality,
//             cityDistrict: parsed.cityDistrict,
//             state: parsed.state,
//             country: 'India'
//         };
        
//         userSession.orderData.completeAddress = addressString;
        
//         console.log(`✅ Address parsed successfully:`, {
//             door: parsed.doorNumber,
//             street: parsed.streetName,
//             area: parsed.areaLocality,
//             city: parsed.cityDistrict,
//             state: parsed.state
//         });
        
//         await message.reply(
//             `✅ *Address Saved*\n\n` +
//             `📋 *Please verify your address:*\n` +
//             `🏠 Door: ${parsed.doorNumber}\n` +
//             `🛣️ Street: ${parsed.streetName}\n` +
//             `📍 Area: ${parsed.areaLocality}\n` +
//             `🏙️ City: ${parsed.cityDistrict}\n` +
//             `🗺️ State: ${parsed.state}\n\n` +
//             `📍 *Now enter your 6-digit pincode:*\n\n` +
//             `💡 Example: 560038`
//         );
        
//         userSession.state = 'AWAITING_PINCODE';
        
//     } catch (error) {
//         console.error('❌ Address parsing failed:', error.message);
//         await message.reply(getAddressFormatInstructions());
//         userSession.state = 'AWAITING_COMBINED_ADDRESS';
//     }
// }

// /**
//  * Handle pincode with flow mode branching
//  */
// async function handlePincode(message, userSession) {
//     const pincode = message.body.trim();
    
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

//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     const random = Math.random().toString(36).substr(2, 5).toUpperCase();
//     const orderNumber = `ORD-${year}${month}${day}-${random}`;
    
//     userSession.orderData.orderNumber = orderNumber;

//     const completeAddress = formatAddressString(userSession.orderData.address);
//     userSession.orderData.completeAddress = completeAddress;

//     const gstRate = safeNumber(userSession.orderData.gstRate, 18);
//     const subtotal = safeNumber(userSession.orderData.totalPrice);
//     const gstAmount = (subtotal * gstRate) / 100;
//     const totalWithGst = subtotal + gstAmount;

//     if (userSession.orderFlowMode === 'short') {
//         const address = `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}, ${userSession.orderData.address.areaLocality}, ${userSession.orderData.address.cityDistrict}, ${userSession.orderData.address.state} - ${pincode}`;
        
//         let summaryText = 
//             `📋 *ORDER SUMMARY*\n\n` +
//             `👤 Name: ${userSession.orderData.customerName}\n` +
//             `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
//             `${userSession.orderData.secondaryPhoneNumber ? `📱 Secondary: ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
//             `🧾 Order: ${orderNumber}\n` +
//             `🛍️ Product: ${userSession.orderData.productName}\n`;

//         if (userSession.orderData.customId) {
//             summaryText += `🔢 Product Code: ${userSession.orderData.formattedId}\n`;
//         }

//         summaryText += 
//             `🛒 Quantity: ${userSession.orderData.quantity}\n` +
//             `💰 Amount: ₹${safeToFixed(totalWithGst)}\n`;

//         if (userSession.orderData.selectedOptions) {
//             summaryText += `🎨 Customization: ${userSession.orderData.selectedOptions}\n`;
//         }

//         summaryText += 
//             `\n📍 *Shipping Address:*\n` +
//             `${address}\n\n` +
//             `✅ *Type PLACE ORDER to confirm*`;

//         await message.reply(summaryText);
//         userSession.state = 'AWAITING_FINAL_CONFIRMATION';
        
//     } else {
//         let finalSummary = 
//             `📋 *FINAL ORDER SUMMARY*\n\n` +
//             `👤 *Customer Name:* ${userSession.orderData.customerName}\n` +
//             `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
//             `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
//             `🧾 *Order Number:* ${orderNumber}\n` +
//             `🛍️ *Product:* ${userSession.orderData.productName}\n`;

//         if (userSession.orderData.customId) {
//             finalSummary += `🔢 *Product Code:* ${userSession.orderData.formattedId}\n`;
//         }

//         finalSummary += 
//             `🛒 *Quantity:* ${userSession.orderData.quantity}\n` +
//             `💰 *Subtotal:* ₹${safeToFixed(subtotal)}\n`;

//         if (gstRate > 0) {
//             finalSummary += `💵 *GST (${gstRate}%):* ₹${safeToFixed(gstAmount)}\n`;
//             finalSummary += `💰 *Total with GST:* ₹${safeToFixed(totalWithGst)}\n`;
//         } else {
//             finalSummary += `💰 *Total Amount:* ₹${safeToFixed(subtotal)}\n`;
//         }

//         finalSummary += 
//             `📊 *Available Stock:* ${safeNumber(userSession.orderData.stock)} units\n`;

//         if (userSession.orderData.selectedOptions) {
//             finalSummary += `🎨 *Customization:* ${userSession.orderData.selectedOptions}\n`;
//         }

//         finalSummary += 
//             `\n🏠 *Shipping Address:*\n` +
//             `${completeAddress}\n\n` +
//             `🔒 *Payment Required:* ₹${safeToFixed(totalWithGst)}\n\n` +
//             `✅ *Ready to place this order?*\n\n` +
//             `Type *PLACE ORDER* to confirm and proceed to payment\n` +
//             `Type *CANCEL* to abort order process`;

//         await message.reply(finalSummary);
//         userSession.state = 'AWAITING_FINAL_CONFIRMATION';
//     }
// }

// /**
//  * Handle final order confirmation and creation
//  * PROFESSIONAL FIXED VERSION - With proper companyId and createdBy handling
//  */
// async function handleFinalConfirmation(message, userSession, userSessions, from, client, companyId) {
//     const response = message.body.trim().toLowerCase();
//     const customerPhone = extractCustomerPhone(message);
//     const whatsappNumber = extractCustomerPhone(message);
    
//     if (response === 'place order') {
//         try {
//             console.log(`🔍 Checking stock for order: ${userSession.orderData.productName}`);
            
//             const product = await apiService.getProductById(userSession.orderData.productId, companyId);
            
//             if (!product) {
//                 await message.reply(
//                     `❌ *Product Not Available*\n\n` +
//                     `The product "${userSession.orderData.productName}" is no longer available.\n\n` +
//                     `🔄 Please browse other products by typing *Products*`
//                 );
//                 userSession.state = 'IDLE';
//                 delete userSession.orderData;
//                 return;
//             }

//             // Verify product belongs to this company
//             if (product.companyId && companyId && product.companyId.toString() !== companyId.toString()) {
//                 await message.reply(
//                     `❌ *Product Not Available*\n\n` +
//                     `This product does not belong to your current company.\n\n` +
//                     `💡 Please choose another product by typing *Products*`
//                 );
//                 userSession.state = 'IDLE';
//                 delete userSession.orderData;
//                 return;
//             }

//             if (product.isActive === false) {
//                 await message.reply(
//                     `❌ *Product Not Available*\n\n` +
//                     `"${product.productName}" is currently unavailable for purchase.\n\n` +
//                     `💡 Please choose another product by typing *Products*`
//                 );
//                 userSession.state = 'IDLE';
//                 delete userSession.orderData;
//                 return;
//             }

//             if (safeNumber(product.stock) < safeNumber(userSession.orderData.quantity)) {
//                 const availableStock = safeNumber(product.stock);
                
//                 await message.reply(
//                     `❌ *Insufficient Stock*\n\n` +
//                     `"${product.productName}" has only *${availableStock} units* available.\n\n` +
//                     `📊 *Stock Status:*\n` +
//                     `📦 Available: ${availableStock} units\n` +
//                     `🛒 You requested: ${userSession.orderData.quantity} units\n` +
//                     `📉 Short by: ${userSession.orderData.quantity - availableStock} units\n\n` +
//                     `💡 *Please choose:*\n` +
//                     `1️⃣ Type *ADJUST ${availableStock}* to order available quantity\n` +
//                     `2️⃣ Type *NEW* to choose another product\n` +
//                     `3️⃣ Type *CANCEL* to stop order process\n\n` +
//                     `Reply with your choice.`
//                 );
                
//                 userSession.orderData.currentProduct = product;
//                 userSession.previousState = userSession.state;
//                 userSession.state = 'AWAITING_STOCK_ADJUSTMENT';
//                 return;
//             }

//             if (safeNumber(product.stock) <= 5) {
//                 console.log(`⚠️ LOW STOCK WARNING: ${product.productName} has only ${product.stock} units left`);
//             }

//             const gstRate = safeNumber(userSession.orderData.gstRate, 18);
//             const subtotal = safeNumber(userSession.orderData.totalPrice);
//             const gstAmount = (subtotal * gstRate) / 100;
//             const totalWithGst = subtotal + gstAmount;

//             // ✅ FIXED: Prepare order data with proper companyId and createdBy
//       const orderData = {
//     // CRITICAL: Company context for multi-tenancy
//     companyId: companyId,
    
//     // Order identifiers
//     orderNumber: userSession.orderData.orderNumber,
    
//     // Customer details
//     customerName: userSession.orderData.customerName,
//     customerEmail: `${userSession.orderData.phoneNumber}@customer.whatsapp`,
//     phoneNumber: userSession.orderData.phoneNumber,
//     secondaryPhoneNumber: userSession.orderData.secondaryPhoneNumber || null,
//     whatsappNumber: whatsappNumber,
    
//     // Shipping address
//     shippingAddress: {
//         street: `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}`,
//         city: userSession.orderData.address.cityDistrict,
//         state: userSession.orderData.address.state,
//         pincode: userSession.orderData.address.pincode,
//         landmark: userSession.orderData.address.areaLocality,
//         country: 'India'
//     },
    
//     // Billing address (same as shipping)
//     billingAddress: {
//         street: `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}`,
//         city: userSession.orderData.address.cityDistrict,
//         state: userSession.orderData.address.state,
//         pincode: userSession.orderData.address.pincode,
//         landmark: userSession.orderData.address.areaLocality,
//         country: 'India'
//     },
//     sameAsShipping: true,
    
//     // Payment and tax
//     paymentMethod: 'upi',
//     gstType: 'intra-state',
    
//     // Order items
//     items: [{
//         productId: userSession.orderData.productId,
//         productName: userSession.orderData.productName,
//         quantity: safeNumber(userSession.orderData.quantity),
//         mrp: safeNumber(userSession.orderData.mrp) || safeNumber(userSession.orderData.price),
//         discountPrice: safeNumber(userSession.orderData.price),
//         price: safeNumber(userSession.orderData.price),
//         gstRate: gstRate,
//         gstIncluded: userSession.orderData.gstIncluded !== false,
//         gstAmount: gstAmount,
//         totalAmount: subtotal,
//         sku: userSession.orderData.sku || '',
//         hsnCode: userSession.orderData.hsnCode || ''
//     }],
    
//     // Order totals
//     subtotal: subtotal,
//     totalDiscount: safeNumber(userSession.orderData.mrp) > safeNumber(userSession.orderData.price) 
//         ? (safeNumber(userSession.orderData.mrp) - safeNumber(userSession.orderData.price)) * safeNumber(userSession.orderData.quantity)
//         : 0,
//     totalGst: gstAmount,
//     shippingCharge: 0,
//     totalPrice: totalWithGst,
    
//     // Payment status
//     paidAmount: 0,
//     balanceAmount: totalWithGst,
//     paymentStatus: 'pending',
    
//     // Order metadata
//     orderNotes: userSession.orderData.selectedOptions || '',
//     status: 'pending',
    
//     // ✅ FIXED: createdBy as string with companyId
//     createdBy: `whatsapp_${companyId || 'system'}`,
    
//     // ✅ FIXED: Order history WITH updatedBy field
//     statusHistory: [{
//         status: 'pending',
//         timestamp: new Date().toISOString(),
//         comment: 'Order created via WhatsApp',
//         updatedBy: `whatsapp_${companyId || 'system'}`  // ← ADD THIS LINE!
//     }]
// };

//             console.log('📦 Creating order with data:', {
//                 companyId: companyId,
//                 orderNumber: orderData.orderNumber,
//                 customerName: orderData.customerName,
//                 deliveryPhone: orderData.phoneNumber,
//                 whatsappNumber: orderData.whatsappNumber,
//                 amount: orderData.totalPrice,
//                 product: orderData.items[0].productName
//             });

//             // Create the order
//             const newOrder = await apiService.createOrder(orderData);
            
//             if (!newOrder || !newOrder._id) {
//                 throw new Error('Failed to create order: No order ID returned from API');
//             }

//             // Store order info in session
//             userSession.orderData.orderId = newOrder._id;
//             userSession.orderData.apiOrder = newOrder;

//             console.log(`✅ Order created successfully:`, {
//                 orderId: newOrder._id,
//                 orderNumber: newOrder.orderNumber || orderData.orderNumber,
//                 companyId: companyId,
//                 customerName: newOrder.customerName || orderData.customerName,
//                 status: newOrder.status || 'pending',
//                 amount: newOrder.totalPrice || orderData.totalPrice
//             });

//             // ✅ Send notifications (this already works!)
//             try {
//                 console.log(`🎯 Sending notifications via Notification Manager for order: ${newOrder.orderNumber}`);
                
//                 const notificationResult = await notificationManager.sendNewOrderNotification(newOrder);
                
//                 console.log(`🔔 Notification result:`, {
//                     success: notificationResult.success,
//                     firebase: notificationResult.channels?.firebase?.success,
//                     whatsapp: notificationResult.channels?.whatsapp?.success
//                 });
                
//             } catch (notifyError) {
//                 console.error(`❌ Notification error:`, notifyError.message);
//                 // Don't throw - order is already created
//             }

//             // Send payment instructions
//             await sendPaymentInstructions(message, userSession, newOrder, companyId);
            
//             // Send order confirmation
//             await sendOrderConfirmation(message, userSession, customerPhone);

//             // Update session state
//             userSession.state = 'AWAITING_PAYMENT_PROOF';
//             userSession.orderData.paymentRequestedAt = new Date().toISOString();

//             // Schedule payment reminder
//             schedulePaymentReminder(userSession, customerPhone, newOrder);

//         } catch (error) {
//             console.error('❌ API Error creating order:', {
//                 error: error.message,
//                 stack: error.stack,
//                 customerName: userSession.orderData?.customerName,
//                 customerPhone: customerPhone,
//                 orderNumber: userSession.orderData?.orderNumber,
//                 companyId: companyId
//             });
            
//             // Handle specific error types
//             if (error.message.includes('Insufficient stock') || 
//                 error.message.includes('stock') || 
//                 error.response?.data?.message?.includes('stock')) {
                
//                 await message.reply(
//                     `❌ *Stock Unavailable*\n\n` +
//                     `"${userSession.orderData.productName}" is no longer available in the requested quantity.\n\n` +
//                     `💡 *Please try:*\n` +
//                     `• Check current stock by typing *Products*\n` +
//                     `• Choose another product\n` +
//                     `• Contact support for availability\n\n` +
//                     `🔄 Type *Products* to browse available items.`
//                 );
                
//             } else if (error.message.includes('Cast to ObjectId') || error.message.includes('createdBy')) {
//                 // Handle the specific ObjectId error we were seeing
//                 await message.reply(
//                     `❌ *Order Creation Error*\n\n` +
//                     `We encountered a technical issue with order creation.\n\n` +
//                     `Our team has been notified. Please try again in a few minutes.\n\n` +
//                     `🔄 Type *Order* to start again.`
//                 );
                
//             } else {
//                 await message.reply(
//                     `❌ *Order Failed*\n\n` +
//                     `We encountered an error while creating your order.\n\n` +
//                     `*Please try again or contact support:*\n` +
//                     `📞 Support: +91 XXXXX XXXXX\n` +
//                     `📧 Email: support@posterpro.store\n\n` +
//                     `🔄 *Please start over by typing:* Order`
//                 );
//             }
            
//             // Reset session
//             userSession.state = 'IDLE';
//             delete userSession.orderData;
//         }

//     } else if (response === 'cancel' || response.includes('cancel')) {
//         await handleOrderCancellation(message, userSession);
        
//     } else {
//         const totalWithGst = safeNumber(userSession.orderData.totalWithGst) || safeNumber(userSession.orderData.totalPrice);
        
//         await message.reply(
//             `❓ *Please confirm your order*\n\n` +
//             `To place your order, type: *PLACE ORDER*\n\n` +
//             `*Order Summary:*\n` +
//             `👤 Customer: ${userSession.orderData.customerName}\n` +
//             `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
//             `🛍️ Product: ${userSession.orderData.productName}\n` +
//             `📦 Quantity: ${userSession.orderData.quantity}\n` +
//             `💰 Total: ₹${safeToFixed(totalWithGst)}\n` +
//             `📊 Available Stock: ${safeNumber(userSession.orderData.stock)} units\n\n` +
//             `📍 Shipping to:\n${userSession.orderData.completeAddress}\n\n` +
//             `💡 *Type CANCEL to stop order process*`
//         );
//     }
// }

// /**
//  * Send payment instructions to customer
//  */
// async function sendPaymentInstructions(message, userSession, order, companyId) {
//     const orderNumber = order.orderNumber || userSession.orderData.orderNumber;
//     const amount = order.totalPrice || userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
//     const gstAmount = order.totalGst || userSession.orderData.gstAmount || 0;
    
//     try {
//         // Get company UPI ID from config
//         const upiIds = await companyConfig.getActiveUpiIds(companyId);
//         const upiId = upiIds.length > 0 ? upiIds[0] : 'posterpro.store@upi';
        
//         await message.reply(
//             `🎉 *YOUR ORDER IS CONFIRMED!*\n\n` +
//             `👤 *Customer:* ${userSession.orderData.customerName}\n` +
//             `🧾 *Order Number:* ${orderNumber}\n` +
//             `💵 *Amount to Pay:* ₹${safeToFixed(amount)}\n` +
//             `📦 *Item:* ${userSession.orderData.productName} x${userSession.orderData.quantity}\n` +
//             (gstAmount > 0 ? `💵 *GST Included:* ₹${safeToFixed(gstAmount)}\n` : '') +
//             `⏰ *Payment Deadline:* 24 hours\n\n` +
//             `💳 *PAYMENT INSTRUCTIONS*\n\n` +
//             `1️⃣ *UPI Payment (Recommended):*\n` +
//             `📱 UPI ID: ${upiId}\n\n` +
//             `2️⃣ *QR Code:* Available on request\n\n` +
//             `🔢 *MANDATORY PAYMENT NOTES:*\n` +
//             `• Amount must be exact: ₹${safeToFixed(amount)}\n` +
//             `• Add note: Order ${orderNumber} - ${userSession.orderData.customerName}\n` +
//             `• Keep screenshot of successful payment\n\n` +
//             `📸 *After payment:*\n` +
//             `Send screenshot here within 24 hours`
//         );

//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         await message.reply(
//             `📋 *PAYMENT VERIFICATION PROCESS*\n\n` +
//             `1. Make payment to ${upiId}\n` +
//             `2. Take clear screenshot of:\n` +
//             `   ✅ "Payment Successful" message\n` +
//             `   ✅ Amount: ₹${safeToFixed(amount)}\n` +
//             `   ✅ UPI ID: ${upiId}\n` +
//             `   ✅ Transaction ID\n` +
//             `   ✅ Date & Time\n\n` +
//             `3. Send screenshot here\n\n` +
//             `⏱️ *Verification Time:* 5-15 minutes\n` +
//             `✅ *Order Process:* Immediate after verification\n\n` +
//             `🔄 *Payment failed?* Try again and send new screenshot\n` +
//             `❓ *Need help?* Reply with your question`
//         );

//     } catch (error) {
//         console.error('❌ Error sending payment instructions:', error);
//         await message.reply(
//             `🎉 Order confirmed for ${userSession.orderData.customerName}!\n` +
//             `Pay ₹${safeToFixed(amount)} to complete.\n\n` +
//             `Order: ${orderNumber}\n` +
//             `Send payment screenshot here.`
//         );
//     }
// }

// /**
//  * Send order confirmation to customer
//  */
// async function sendOrderConfirmation(message, userSession, customerPhone) {
//     const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    
//     try {
//         await message.reply(
//             `✅ *Order Confirmed Successfully!*\n\n` +
//             `Dear ${userSession.orderData.customerName},\n\n` +
//             `Your order #${userSession.orderData.orderNumber} has been confirmed!\n\n` +
//             `📊 *Order Details:*\n` +
//             `• Order #: ${userSession.orderData.orderNumber}\n` +
//             `• Amount: ₹${safeToFixed(amount)}\n` +
//             `• Product: ${userSession.orderData.productName} x${userSession.orderData.quantity}\n\n` +
//             `⏰ *Next Steps:*\n` +
//             `1. Make payment\n` +
//             `2. Send payment screenshot here\n` +
//             `3. Order will be processed after payment verification\n\n` +
//             `🕒 *Processing Time:* 24-48 hours after payment\n\n` +
//             `📞 *Need Help?* Reply to this message`
//         );
        
//         console.log(`📱 Order confirmation sent via WhatsApp to: ${userSession.orderData.customerName} (${customerPhone})`);
        
//     } catch (error) {
//         console.error('❌ Error sending order confirmation:', error);
//         await message.reply(
//             `✅ Order #${userSession.orderData.orderNumber} confirmed!\n` +
//             `Amount: ₹${safeToFixed(amount)}\n` +
//             `Please make payment and send screenshot.`
//         );
//     }
// }

// /**
//  * Schedule payment reminder
//  */
// function schedulePaymentReminder(userSession, customerPhone, order) {
//     const reminderTime = 60 * 60 * 1000;
    
//     setTimeout(async () => {
//         try {
//             const currentOrder = await apiService.getOrderById(order._id);
            
//             if (currentOrder && currentOrder.paymentStatus === 'pending') {
//                 console.log(`⏰ Sending payment reminder for order: ${order.orderNumber}`);
                
//                 try {
//                     await notificationManager.sendNotification('PAYMENT_REMINDER', {
//                         orderNumber: order.orderNumber,
//                         customerName: order.customerName,
//                         customerPhone: order.customerPhone,
//                         totalAmount: order.totalPrice,
//                         reminderType: '24_hour'
//                     });
//                 } catch (reminderError) {
//                     console.error('Payment reminder notification failed:', reminderError.message);
//                 }
//             }
//         } catch (error) {
//             console.error('❌ Error in payment reminder:', error);
//         }
//     }, reminderTime);
// }

// /**
//  * Handle order cancellation
//  */
// async function handleOrderCancellation(message, userSession) {
//     const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    
//     await message.reply(
//         `🛑 *Cancel Order Process?*\n\n` +
//         `Are you sure you want to cancel this order?\n\n` +
//         `*Order Details:*\n` +
//         `👤 Customer: ${userSession.orderData.customerName}\n` +
//         `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
//         `🛍️ Product: ${userSession.orderData.productName}\n` +
//         `💰 Amount: ₹${safeToFixed(amount)}\n\n` +
//         `✅ Type *YES* to cancel and clear all details\n` +
//         `❌ Type *NO* to continue with your order\n\n` +
//         `*Note:* This action cannot be undone.`
//     );
    
//     userSession.previousState = userSession.state;
//     userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
// }

// async function handlePaymentProof(message, userSession, userSessions, client, companyId) {
//     const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
//     const whatsappNumber = extractCustomerPhone(message);
    
//     if (message.hasMedia) {
//         try {
//             userSession.orderData.lastPaymentMessage = {
//                 from: message.from,
//                 whatsappNumber: whatsappNumber,
//                 timestamp: new Date().toISOString(),
//                 customerName: userSession.orderData.customerName,
//                 orderNumber: userSession.orderData.orderNumber,
//                 amount: amount,
//                 deliveryPhone: userSession.orderData.phoneNumber,
//                 companyId: companyId
//             };
            
//             console.log('📸 Payment proof received:', {
//                 orderNumber: userSession.orderData.orderNumber,
//                 whatsappNumber: whatsappNumber,
//                 customerName: userSession.orderData.customerName,
//                 amount: amount,
//                 companyId: companyId
//             });
            
//             await handlePaymentVerification(message, client);
            
//         } catch (error) {
//             console.error('❌ Error in payment proof handling:', error);
//             await message.reply(
//                 `❌ *Error Processing Payment*\n\n` +
//                 `Failed to process your payment screenshot. Please try again.\n\n` +
//                 `*Please ensure:*\n` +
//                 `✅ Clear screenshot of payment success\n` +
//                 `✅ Amount ₹${safeToFixed(amount)} visible\n` +
//                 `✅ UPI ID visible\n\n` +
//                 `Send the screenshot again.`
//             );
//         }
        
//     } else {
//         const userMessage = message.body.trim().toLowerCase();
//         if (userMessage.includes('cancel')) {
//             await handleOrderCancellation(message, userSession);
//             return;
//         }
        
//         await message.reply(
//             `📸 *Payment Proof Required*\n\n` +
//             `Dear ${userSession.orderData.customerName}, please send the screenshot of your payment confirmation.\n\n` +
//             `💡 *How to take screenshot:*\n` +
//             `1. Complete payment\n` +
//             `2. Take screenshot of payment success screen\n` +
//             `3. Make sure amount ₹${safeToFixed(amount)} is visible\n` +
//             `4. Send the screenshot here\n\n` +
//             `If you haven't paid yet, please complete the payment first.\n\n` +
//             `💡 Type *CANCEL* to stop order process`
//         );
//         return;
//     }
// }

// /**
//  * Helper function to validate image URLs
//  */
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









// handlers/orderHandler.js - PROFESSIONAL MULTI-TENANT VERSION
// Handles order flow with company isolation and proper customer identification

import pkg from 'whatsapp-web.js';
import apiService from "../../services/apiService.js";
import handlePaymentVerification from './paymentVerificationHandler.js';
import notificationManager from "../../services/notifications/notification-manager.js";
import companyConfig from '../../shared/companyConfig.js';
import { parseCombinedAddress, getAddressFormatInstructions } from '../../utils/addressParser.js';

const { MessageMedia } = pkg;

// Safe number utilities
const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
};

const safeToFixed = (value, digits = 2) => {
    const num = safeNumber(value);
    return num.toFixed(digits);
};

/**
 * Format custom ID to 5-digit format (00123)
 */
const formatCustomId = (id) => {
    if (!id && id !== 0) return null;
    return String(id).padStart(5, '0');
};

/**
 * Parse custom ID from various formats
 */
const parseCustomId = (input) => {
    if (!input) return null;
    let str = String(input).trim();
    const digits = str.replace(/\D/g, '');
    if (digits.length > 0) {
        return parseInt(digits, 10);
    }
    return null;
};

/**
 * Format address for display
 */
const formatAddressString = (addressObj) => {
    if (!addressObj) return '';
    if (typeof addressObj === 'string') return addressObj;
    
    const parts = [];
    if (addressObj.doorNumber) parts.push(addressObj.doorNumber);
    if (addressObj.streetName) parts.push(addressObj.streetName);
    if (addressObj.areaLocality) parts.push(addressObj.areaLocality);
    if (addressObj.cityDistrict) parts.push(addressObj.cityDistrict);
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.pincode) parts.push(addressObj.pincode);
    
    return parts.join(', ');
};

/**
 * Extract clean phone number from WhatsApp message
 */
const extractCustomerPhone = (message) => {
    if (!message || !message.from) return 'Unknown';
    
    try {
        const fullId = message.from;
        const numberPart = fullId.split('@')[0];
        const digitsOnly = numberPart.replace(/\D/g, '');
        
        console.log(`📞 [Phone Extraction] Original: ${fullId}, Digits: ${digitsOnly}`);
        
        // Malawi country code (265) followed by Indian number
        if (digitsOnly.length === 13 && digitsOnly.startsWith('265')) {
            const indianNumber = digitsOnly.substring(3);
            console.log(`📱 Malawi format → Indian: ${indianNumber}`);
            return indianNumber;
        }
        
        // Indian format with country code
        if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
            const customerPhone = digitsOnly.substring(2);
            console.log(`📱 Indian format → Customer: ${customerPhone}`);
            return customerPhone;
        }
        
        // Direct 10-digit number
        if (digitsOnly.length === 10) {
            console.log(`📱 Direct 10-digit → Customer: ${digitsOnly}`);
            return digitsOnly;
        }
        
        // Other country codes - take last 10 digits
        if (digitsOnly.length > 10) {
            const last10 = digitsOnly.slice(-10);
            console.log(`📱 Foreign format → Last 10 digits: ${last10}`);
            return last10;
        }
        
        return digitsOnly || 'Unknown';
        
    } catch (error) {
        console.error('❌ [Phone Extraction] Error:', error);
        return 'Unknown';
    }
};

export async function handleOrderFlow(message, client, userSession, userSessions, companyId = null) {
    const userMessage = message.body.trim();
    const from = message.from;
    const customerPhone = extractCustomerPhone(message);

    try {
        // Ensure orderFlowMode is ALWAYS set in session
        if (!userSession.orderFlowMode) {
            console.log(`🔍 [Company:${companyId}] orderFlowMode missing, fetching...`);
            const orderFlowMode = await companyConfig.getOrderFlowMode(companyId);
            userSession.orderFlowMode = orderFlowMode;
            userSession.companyId = companyId;
            console.log(`📋 Set orderFlowMode: ${orderFlowMode} for company ${companyId}`);
        }

        // Check if user is starting a new order
        if (userSession.state === 'IDLE' && userMessage.toLowerCase() === 'order') {
            const orderFlowMode = await companyConfig.getOrderFlowMode(companyId);
            userSession.orderFlowMode = orderFlowMode;
            userSession.companyId = companyId;
            console.log(`📋 Order flow mode for ${customerPhone} (company ${companyId}): ${orderFlowMode}`);
            return await startOrderConfirmation(message, userSession);
        }

        // Check for cancellation at ANY point
        if (userSession.state !== 'AWAITING_CANCELLATION_CONFIRMATION' && 
            await handleCancellationRequest(message, userSession, userSessions)) {
            return;
        }

        switch (userSession.state) {
            case 'START_ORDER':
                return await startOrderConfirmation(message, userSession);
            
            case 'AWAITING_ORDER_CONFIRMATION':
                return await handleOrderStartConfirmation(message, userSession);
            
            case 'AWAITING_PRODUCT_ID':
                return await handleProductIdInput(message, userSession, client, companyId);
            
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
                return await handleFinalConfirmation(message, userSession, userSessions, from, client, companyId);
            
            case 'AWAITING_PAYMENT_PROOF':
                return await handlePaymentProof(message, userSession, userSessions, client, companyId);
            
            case 'AWAITING_STOCK_ADJUSTMENT':
                return await handleStockAdjustment(message, userSession);
            
            case 'AWAITING_CANCELLATION_CONFIRMATION':
                return await handleCancellationConfirmation(message, userSession, userSessions);
            
            case 'AWAITING_COMBINED_ADDRESS':
                return await handleCombinedAddress(message, userSession);
            
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

/**
 * Handle cancellation requests at ANY point
 */
async function handleCancellationRequest(message, userSession, userSessions) {
    const userMessage = message.body.trim().toLowerCase();
    const cancellationKeywords = [
        'cancel', 'stop', 'quit', 'exit', 'no', 'nevermind', 
        'never mind', 'forget it', 'abort', 'end', 'bye'
    ];

    if (cancellationKeywords.some(keyword => userMessage.includes(keyword))) {
        await message.reply(
            `🛑 *Cancel Order Process?*\n\n` +
            `Are you sure you want to cancel the current order process?\n\n` +
            `✅ Type *YES* to confirm cancellation\n` +
            `❌ Type *NO* to continue ordering\n\n` +
            `This will clear all your current order details.`
        );
        
        userSession.previousState = userSession.state;
        userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
        return true;
    }

    return false;
}

/**
 * Handle cancellation confirmation
 */
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
        
        userSession.state = 'IDLE';
        if (userSession.orderData) {
            delete userSession.orderData;
        }
        if (userSession.previousState) {
            delete userSession.previousState;
        }
        return;
        
    } else if (userMessage === 'no' || userMessage === 'n') {
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

/**
 * Handle stock adjustment when insufficient stock
 */
async function handleStockAdjustment(message, userSession) {
    const userMessage = message.body.trim().toLowerCase();
    
    if (userMessage.startsWith('adjust')) {
        const parts = userMessage.split(' ');
        const requestedQuantity = parseInt(parts[1]);
        
        if (isNaN(requestedQuantity) || requestedQuantity < 1) {
            await message.reply(
                `❌ *Invalid Quantity*\n\n` +
                `Please enter a valid number. Example: *ADJUST 2*\n\n` +
                `📦 Available: ${safeNumber(userSession.orderData.currentProduct?.stock)} units\n\n` +
                `💡 Type *ADJUST X* where X is the quantity you want`
            );
            return;
        }
        
        const availableStock = safeNumber(userSession.orderData.currentProduct?.stock);
        
        if (requestedQuantity > availableStock) {
            await message.reply(
                `❌ *Cannot Adjust*\n\n` +
                `You requested ${requestedQuantity} units, but only ${availableStock} are available.\n\n` +
                `💡 Type *ADJUST ${availableStock}* to order all available units`
            );
            return;
        }
        
        userSession.orderData.quantity = requestedQuantity;
        userSession.orderData.totalPrice = safeNumber(userSession.orderData.price) * requestedQuantity;
        
        userSession.state = userSession.previousState;
        delete userSession.previousState;
        delete userSession.orderData.currentProduct;
        
        await message.reply(
            `✅ *Quantity Adjusted*\n\n` +
            `Updated to ${requestedQuantity} units of "${userSession.orderData.productName}"\n\n` +
            `💰 New Total: ₹${safeToFixed(userSession.orderData.totalPrice)}\n\n` +
            `🤔 *Confirm this adjusted order?*\n\n` +
            `Type *PLACE ORDER* to confirm\n` +
            `Type *CANCEL* to stop order process`
        );
        
    } else if (userMessage === 'new') {
        await message.reply(
            `🔄 *Choose New Product*\n\n` +
            `Please enter the Product ID of the new product you want:\n\n` +
            `💡 Type *Products* to see all available products with their IDs\n\n` +
            `💡 *You can use:*\n` +
            `• MongoDB ID: 64abc123def456789abc1234\n` +
            `• Custom ID: 00101\n` +
            `• Formatted ID: 00101\n\n` +
            `📝 *Enter Product ID:*`
        );
        userSession.state = 'AWAITING_PRODUCT_ID';
        
    } else if (userMessage === 'cancel') {
        await handleOrderCancellation(message, userSession);
        
    } else {
        await message.reply(
            `❓ *Please choose an option:*\n\n` +
            `1️⃣ Type *ADJUST X* (where X is quantity)\n` +
            `2️⃣ Type *NEW* to choose another product\n` +
            `3️⃣ Type *CANCEL* to stop order process\n\n` +
            `📦 Available: ${safeNumber(userSession.orderData.currentProduct?.stock)} units`
        );
    }
}

/**
 * Get state-specific messages
 */
function getStateSpecificMessage(state) {
    const messages = {
        'AWAITING_NAME': '👤 Please enter your full name:',
        'AWAITING_PRIMARY_PHONE': '📱 Please enter your primary phone number:',
        'AWAITING_SECONDARY_PHONE': '📱 Please enter secondary phone number (or type SKIP):',
        'AWAITING_PRODUCT_ID': '📝 Please enter the Product ID:\n\n💡 *You can use:*\n• MongoDB ID: 64abc123def456789abc1234\n• Custom ID: 00101\n• Formatted ID: 00101',
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
        'AWAITING_PAYMENT_PROOF': '📸 Please send payment screenshot:',
        'AWAITING_STOCK_ADJUSTMENT': '📊 Please adjust quantity or choose another product:',
        'AWAITING_COMBINED_ADDRESS': '🏠 Please enter your complete address in one line:'
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
        address: {
            doorNumber: '',
            streetName: '',
            areaLocality: '',
            cityDistrict: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        gstType: 'intra-state',
        paymentMethod: 'upi'
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
        `• Look for the ID next to each product\n\n` +
        `💡 *You can use these formats:*\n` +
        `• MongoDB ID: 64abc123def456789abc1234\n` +
        `• Custom ID: 00101 (product code)\n` +
        `• Formatted ID: 00101 (display format)\n\n` +
        `📝 *Enter Product ID:*\n\n` +
        `💡 *Tip:* Type *CANCEL* anytime to stop the order process`
    );
    userSession.state = 'AWAITING_PRODUCT_ID';
}

/**
 * Handle Product ID Input with company validation
 */
async function handleProductIdInput(message, userSession, client, companyId) {
    const productId = message.body.trim();
    
    console.log(`🔍 Product ID input: "${productId}" for company ${companyId}`);
    
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(productId);
    const customIdNum = parseCustomId(productId);
    const isCustomId = customIdNum !== null;
    
    if (!isMongoId && !isCustomId) {
        await message.reply(
            `❌ *Invalid Product ID Format*\n\n` +
            `Please enter a valid Product ID.\n\n` +
            `💡 *Accepted formats:*\n` +
            `• MongoDB ID: 64abc123def456789abc1234\n` +
            `• Custom ID: 00101 or 101\n` +
            `• Formatted ID: 00101\n\n` +
            `📝 *Enter correct Product ID:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    try {
        console.log(`🔍 Fetching product with: ${isMongoId ? 'MongoDB ID: ' + productId : 'Custom ID: ' + customIdNum}`);
        
        let product = null;
        
        if (isMongoId) {
            product = await apiService.getProductById(productId, companyId);
        }
        
        if (!product && isCustomId) {
            console.log(`🔍 Attempting to find product by custom ID: ${customIdNum}`);
            const allProducts = await apiService.getProducts(companyId);
            if (allProducts && allProducts.length > 0) {
                product = allProducts.find(p => 
                    p.customId === customIdNum || 
                    (p.customId && String(p.customId) === String(customIdNum)) ||
                    (p.customId && formatCustomId(p.customId) === productId)
                );
            }
        }
        
        console.log('📦 Product search result:', product ? 'Found' : 'Not found');
        
        if (!product) {
            await message.reply(
                `❌ *Product Not Found*\n\n` +
                `No product found with ID: ${productId}\n\n` +
                `💡 *Please check:*\n` +
                `• Make sure you typed the ID correctly\n` +
                `• Type *Products* to see all available products\n` +
                `• Try searching by product name\n\n` +
                `📝 *Enter correct Product ID:*\n\n` +
                `💡 Type *CANCEL* to stop order process`
            );
            return;
        }

        // Verify product belongs to this company
        if (product.companyId && companyId && product.companyId.toString() !== companyId.toString()) {
            await message.reply(
                `❌ *Product Not Available*\n\n` +
                `This product does not belong to your current company.\n\n` +
                `💡 Please choose another product by typing *Products*`
            );
            userSession.state = 'IDLE';
            return;
        }

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

        const sellingPrice = safeNumber(product.discountPrice) || safeNumber(product.price);
        const mrp = safeNumber(product.mrp) || sellingPrice;
        const discountPercentage = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

        const productImageUrl = product.imageUrls && product.imageUrls.length > 0 
            ? product.imageUrls[0] 
            : product.imageUrl;

        // Store product data in session
        userSession.orderData.productId = product._id || product.id;
        userSession.orderData.productName = product.productName;
        userSession.orderData.mrp = mrp;
        userSession.orderData.price = sellingPrice;
        userSession.orderData.imageUrl = productImageUrl;
        userSession.orderData.options = product.options;
        userSession.orderData.stock = safeNumber(product.stock);
        userSession.orderData.sku = product.sku;
        userSession.orderData.hsnCode = product.hsnCode;
        userSession.orderData.gstRate = safeNumber(product.gstRate, 18);
        userSession.orderData.gstIncluded = product.gstIncluded !== false;
        
        userSession.orderData.mongoId = product._id || product.id;
        userSession.orderData.customId = product.customId;
        userSession.orderData.formattedId = product.customId ? formatCustomId(product.customId) : null;

        let productInfo = 
            `✅ *Product Found!*\n\n` +
            `👤 *Customer:* ${userSession.orderData.customerName}\n` +
            `📱 *Phone:* ${userSession.orderData.phoneNumber}\n` +
            `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
            `🛍️ *Product:* ${product.productName}\n`;

        if (product.customId) {
            productInfo += `🔢 *Product Code:* ${formatCustomId(product.customId)}\n`;
        }

        if (mrp > sellingPrice) {
            productInfo += `💰 *MRP:* ~~₹${safeToFixed(mrp)}~~\n`;
            productInfo += `💵 *Our Price:* ₹${safeToFixed(sellingPrice)} (*${discountPercentage}% OFF*)\n`;
        } else {
            productInfo += `💰 *Price:* ₹${safeToFixed(sellingPrice)}\n`;
        }

        productInfo += 
            `📦 *Available:* ${safeNumber(product.stock)} units\n` +
            (product.sku ? `📌 *SKU:* ${product.sku}\n` : '') +
            (product.hsnCode ? `🔢 *HSN:* ${product.hsnCode}\n` : '') +
            (safeNumber(product.gstRate) > 0 ? `💵 *GST:* ${safeNumber(product.gstRate)}%\n` : '');

        if (product.description) {
            productInfo += `📝 *Description:* ${product.description}\n`;
        }

        productInfo += 
            `\n🎯 *Now, please enter quantity:*\n\n` +
            `💡 *Note:* Maximum ${safeNumber(product.stock)} units available\n` +
            `📝 *Enter quantity (1-${safeNumber(product.stock)}):*\n\n` +
            `💡 Type *CANCEL* to stop order process`;

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

    if (isNaN(quantity) || quantity < 1) {
        await message.reply(
            `❌ *Invalid Quantity*\n\n` +
            `Please enter a valid number (minimum 1).\n\n` +
            `📝 *Enter quantity for ${userSession.orderData.productName}:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    const availableStock = safeNumber(userSession.orderData.stock);
    
    if (quantity > availableStock) {
        await message.reply(
            `❌ *Insufficient Stock*\n\n` +
            `Only ${availableStock} units available for "${userSession.orderData.productName}".\n\n` +
            `💡 Please enter quantity between 1-${availableStock}\n\n` +
            `📝 *Enter quantity:*\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }

    userSession.orderData.quantity = quantity;
    userSession.orderData.totalPrice = safeNumber(userSession.orderData.price) * quantity;

    const gstRate = safeNumber(userSession.orderData.gstRate, 18);
    const gstAmount = (userSession.orderData.totalPrice * gstRate) / 100;
    userSession.orderData.gstAmount = gstAmount;
    userSession.orderData.subtotal = userSession.orderData.totalPrice;
    userSession.orderData.totalWithGst = userSession.orderData.totalPrice + gstAmount;

    let confirmationText = 
        `📋 *Order Summary*\n\n` +
        `👤 *Customer:* ${userSession.orderData.customerName}\n` +
        `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
        `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
        `🛍️ *Product:* ${userSession.orderData.productName}\n`;

    if (userSession.orderData.customId) {
        confirmationText += `🔢 *Product Code:* ${userSession.orderData.formattedId}\n`;
    }

    confirmationText += 
        `💰 *Unit Price:* ₹${safeToFixed(userSession.orderData.price)}\n` +
        `🛒 *Quantity:* ${quantity}\n` +
        `💵 *Subtotal:* ₹${safeToFixed(userSession.orderData.subtotal)}\n`;

    if (gstRate > 0) {
        confirmationText += `💵 *GST (${gstRate}%):* ₹${safeToFixed(gstAmount)}\n`;
        confirmationText += `💰 *Total with GST:* ₹${safeToFixed(userSession.orderData.totalWithGst)}\n`;
    } else {
        confirmationText += `💰 *Total Amount:* ₹${safeToFixed(userSession.orderData.totalPrice)}\n`;
    }

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
        `* please enter the correct details *\n\n` +
        `1️⃣ *Door/Flat Number:*\n\n` +
        `📝 *Enter your door or flat number:*\n\n` +
        `💡 Type *CANCEL* to stop order process`
    );
    userSession.state = 'AWAITING_DOOR_NUMBER';
}

/**
 * Handle product confirmation with flow mode branching
 */
async function handleProductConfirmation(message, userSession) {
    console.log('🔍 [DEBUG] ===== ENTERING handleProductConfirmation =====');
    console.log('🔍 [DEBUG] orderFlowMode value:', userSession.orderFlowMode);
    console.log('🔍 [DEBUG] orderFlowMode type:', typeof userSession.orderFlowMode);
    
    const response = message.body.trim().toLowerCase();
    
    if (response === 'confirm') {
        console.log('🔍 [DEBUG] User typed CONFIRM');
        console.log('🔍 [DEBUG] Checking if mode is short:', userSession.orderFlowMode === 'short');
        
        if (userSession.orderFlowMode === 'short') {
            console.log('🔍 [DEBUG] ✅ SHORT MODE - Going to combined address');
            await message.reply(
                `🏠 *Shipping Address*\n\n` +
                `Please enter your complete address in ONE line:\n\n` +
                `📝 *Format:*\n` +
                `Door No, Street, Area/Locality, City, State\n\n` +
                `📝 *Example:*\n` +
                `12, MG Road, Indiranagar, Bangalore, Karnataka\n\n` +
                `📍 *Note:* Pincode will be asked separately\n\n` +
                `📝 *Enter your address:*`
            );
            userSession.state = 'AWAITING_COMBINED_ADDRESS';
            console.log('🔍 [DEBUG] State changed to: AWAITING_COMBINED_ADDRESS');
        } else {
            console.log('🔍 [DEBUG] ❌ LONG MODE - Going to step-by-step address');
            await message.reply(
                `🏠 *Shipping Address Details*\n\n` +
                `Let's collect your shipping address step by step:\n\n` +
                `* please enter the correct details *\n\n` +
                `1️⃣ *Door/Flat Number:*\n\n` +
                `📝 *Enter your door or flat number:*\n\n` +
                `💡 Type *CANCEL* to stop order process`
            );
            userSession.state = 'AWAITING_DOOR_NUMBER';
            console.log('🔍 [DEBUG] State changed to: AWAITING_DOOR_NUMBER');
        }
    } else {
        console.log('🔍 [DEBUG] User did NOT type CONFIRM, they typed:', response);
        await message.reply(
            `❓ Please type *CONFIRM* to continue.\n\n` +
            `Customer: ${userSession.orderData.customerName}\n` +
            `Phone: ${userSession.orderData.phoneNumber}\n` +
            `Product: ${userSession.orderData.productName}\n` +
            `Quantity: ${userSession.orderData.quantity}\n` +
            `Total: ₹${safeToFixed(userSession.orderData.totalWithGst || userSession.orderData.totalPrice)}\n\n` +
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

/**
 * Handle combined address in SHORT mode
 */
async function handleCombinedAddress(message, userSession) {
    const addressString = message.body.trim();
    
    try {
        const parsed = parseCombinedAddress(addressString);
        
        userSession.orderData.address = {
            doorNumber: parsed.doorNumber,
            streetName: parsed.streetName,
            areaLocality: parsed.areaLocality,
            cityDistrict: parsed.cityDistrict,
            state: parsed.state,
            country: 'India'
        };
        
        userSession.orderData.completeAddress = addressString;
        
        console.log(`✅ Address parsed successfully:`, {
            door: parsed.doorNumber,
            street: parsed.streetName,
            area: parsed.areaLocality,
            city: parsed.cityDistrict,
            state: parsed.state
        });
        
        await message.reply(
            `✅ *Address Saved*\n\n` +
            `📋 *Please verify your address:*\n` +
            `🏠 Door: ${parsed.doorNumber}\n` +
            `🛣️ Street: ${parsed.streetName}\n` +
            `📍 Area: ${parsed.areaLocality}\n` +
            `🏙️ City: ${parsed.cityDistrict}\n` +
            `🗺️ State: ${parsed.state}\n\n` +
            `📍 *Now enter your 6-digit pincode:*\n\n` +
            `💡 Example: 560038`
        );
        
        userSession.state = 'AWAITING_PINCODE';
        
    } catch (error) {
        console.error('❌ Address parsing failed:', error.message);
        await message.reply(getAddressFormatInstructions());
        userSession.state = 'AWAITING_COMBINED_ADDRESS';
    }
}

/**
 * Handle pincode with flow mode branching
 */
async function handlePincode(message, userSession) {
    const pincode = message.body.trim();
    
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

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    const orderNumber = `ORD-${year}${month}${day}-${random}`;
    
    userSession.orderData.orderNumber = orderNumber;

    const completeAddress = formatAddressString(userSession.orderData.address);
    userSession.orderData.completeAddress = completeAddress;

    const gstRate = safeNumber(userSession.orderData.gstRate, 18);
    const subtotal = safeNumber(userSession.orderData.totalPrice);
    const gstAmount = (subtotal * gstRate) / 100;
    const totalWithGst = subtotal + gstAmount;

    if (userSession.orderFlowMode === 'short') {
        const address = `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}, ${userSession.orderData.address.areaLocality}, ${userSession.orderData.address.cityDistrict}, ${userSession.orderData.address.state} - ${pincode}`;
        
        let summaryText = 
            `📋 *ORDER SUMMARY*\n\n` +
            `👤 Name: ${userSession.orderData.customerName}\n` +
            `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
            `${userSession.orderData.secondaryPhoneNumber ? `📱 Secondary: ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
            `🧾 Order: ${orderNumber}\n` +
            `🛍️ Product: ${userSession.orderData.productName}\n`;

        if (userSession.orderData.customId) {
            summaryText += `🔢 Product Code: ${userSession.orderData.formattedId}\n`;
        }

        summaryText += 
            `🛒 Quantity: ${userSession.orderData.quantity}\n` +
            `💰 Amount: ₹${safeToFixed(totalWithGst)}\n`;

        if (userSession.orderData.selectedOptions) {
            summaryText += `🎨 Customization: ${userSession.orderData.selectedOptions}\n`;
        }

        summaryText += 
            `\n📍 *Shipping Address:*\n` +
            `${address}\n\n` +
            `✅ *Type PLACE ORDER to confirm*`;

        await message.reply(summaryText);
        userSession.state = 'AWAITING_FINAL_CONFIRMATION';
        
    } else {
        let finalSummary = 
            `📋 *FINAL ORDER SUMMARY*\n\n` +
            `👤 *Customer Name:* ${userSession.orderData.customerName}\n` +
            `📱 *Primary Phone:* ${userSession.orderData.phoneNumber}\n` +
            `${userSession.orderData.secondaryPhoneNumber ? `📱 *Secondary Phone:* ${userSession.orderData.secondaryPhoneNumber}\n` : ''}` +
            `🧾 *Order Number:* ${orderNumber}\n` +
            `🛍️ *Product:* ${userSession.orderData.productName}\n`;

        if (userSession.orderData.customId) {
            finalSummary += `🔢 *Product Code:* ${userSession.orderData.formattedId}\n`;
        }

        finalSummary += 
            `🛒 *Quantity:* ${userSession.orderData.quantity}\n` +
            `💰 *Subtotal:* ₹${safeToFixed(subtotal)}\n`;

        if (gstRate > 0) {
            finalSummary += `💵 *GST (${gstRate}%):* ₹${safeToFixed(gstAmount)}\n`;
            finalSummary += `💰 *Total with GST:* ₹${safeToFixed(totalWithGst)}\n`;
        } else {
            finalSummary += `💰 *Total Amount:* ₹${safeToFixed(subtotal)}\n`;
        }

        finalSummary += 
            `📊 *Available Stock:* ${safeNumber(userSession.orderData.stock)} units\n`;

        if (userSession.orderData.selectedOptions) {
            finalSummary += `🎨 *Customization:* ${userSession.orderData.selectedOptions}\n`;
        }

        finalSummary += 
            `\n🏠 *Shipping Address:*\n` +
            `${completeAddress}\n\n` +
            `🔒 *Payment Required:* ₹${safeToFixed(totalWithGst)}\n\n` +
            `✅ *Ready to place this order?*\n\n` +
            `Type *PLACE ORDER* to confirm and proceed to payment\n` +
            `Type *CANCEL* to abort order process`;

        await message.reply(finalSummary);
        userSession.state = 'AWAITING_FINAL_CONFIRMATION';
    }
}

/**
 * Handle final order confirmation and creation
 * FIXED VERSION - Uses WhatsApp ID for createdBy/updatedBy
 */
async function handleFinalConfirmation(message, userSession, userSessions, from, client, companyId) {
    const response = message.body.trim().toLowerCase();
    const customerPhone = extractCustomerPhone(message);
    const whatsappNumber = extractCustomerPhone(message);
    
    if (response === 'place order') {
        try {
            console.log(`🔍 Checking stock for order: ${userSession.orderData.productName}`);
            
            const product = await apiService.getProductById(userSession.orderData.productId, companyId);
            
            if (!product) {
                await message.reply(
                    `❌ *Product Not Available*\n\n` +
                    `The product "${userSession.orderData.productName}" is no longer available.\n\n` +
                    `🔄 Please browse other products by typing *Products*`
                );
                userSession.state = 'IDLE';
                delete userSession.orderData;
                return;
            }

            // Verify product belongs to this company
            if (product.companyId && companyId && product.companyId.toString() !== companyId.toString()) {
                await message.reply(
                    `❌ *Product Not Available*\n\n` +
                    `This product does not belong to your current company.\n\n` +
                    `💡 Please choose another product by typing *Products*`
                );
                userSession.state = 'IDLE';
                delete userSession.orderData;
                return;
            }

            if (product.isActive === false) {
                await message.reply(
                    `❌ *Product Not Available*\n\n` +
                    `"${product.productName}" is currently unavailable for purchase.\n\n` +
                    `💡 Please choose another product by typing *Products*`
                );
                userSession.state = 'IDLE';
                delete userSession.orderData;
                return;
            }

            if (safeNumber(product.stock) < safeNumber(userSession.orderData.quantity)) {
                const availableStock = safeNumber(product.stock);
                
                await message.reply(
                    `❌ *Insufficient Stock*\n\n` +
                    `"${product.productName}" has only *${availableStock} units* available.\n\n` +
                    `📊 *Stock Status:*\n` +
                    `📦 Available: ${availableStock} units\n` +
                    `🛒 You requested: ${userSession.orderData.quantity} units\n` +
                    `📉 Short by: ${userSession.orderData.quantity - availableStock} units\n\n` +
                    `💡 *Please choose:*\n` +
                    `1️⃣ Type *ADJUST ${availableStock}* to order available quantity\n` +
                    `2️⃣ Type *NEW* to choose another product\n` +
                    `3️⃣ Type *CANCEL* to stop order process\n\n` +
                    `Reply with your choice.`
                );
                
                userSession.orderData.currentProduct = product;
                userSession.previousState = userSession.state;
                userSession.state = 'AWAITING_STOCK_ADJUSTMENT';
                return;
            }

            if (safeNumber(product.stock) <= 5) {
                console.log(`⚠️ LOW STOCK WARNING: ${product.productName} has only ${product.stock} units left`);
            }

            const gstRate = safeNumber(userSession.orderData.gstRate, 18);
            const subtotal = safeNumber(userSession.orderData.totalPrice);
            const gstAmount = (subtotal * gstRate) / 100;
            const totalWithGst = subtotal + gstAmount;

            // ✅ FIXED: Use WhatsApp ID from 'from' parameter for createdBy/updatedBy
            const orderData = {
                // CRITICAL: Company context for multi-tenancy
                companyId: companyId,
                
                // Order identifiers
                orderNumber: userSession.orderData.orderNumber,
                
                // Customer details
                customerName: userSession.orderData.customerName,
                customerEmail: `${userSession.orderData.phoneNumber}@customer.whatsapp`,
                phoneNumber: userSession.orderData.phoneNumber,
                secondaryPhoneNumber: userSession.orderData.secondaryPhoneNumber || null,
                whatsappNumber: whatsappNumber,
                
                // Shipping address
                shippingAddress: {
                    street: `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}`,
                    city: userSession.orderData.address.cityDistrict,
                    state: userSession.orderData.address.state,
                    pincode: userSession.orderData.address.pincode,
                    landmark: userSession.orderData.address.areaLocality,
                    country: 'India'
                },
                
                // Billing address (same as shipping)
                billingAddress: {
                    street: `${userSession.orderData.address.doorNumber}, ${userSession.orderData.address.streetName}`,
                    city: userSession.orderData.address.cityDistrict,
                    state: userSession.orderData.address.state,
                    pincode: userSession.orderData.address.pincode,
                    landmark: userSession.orderData.address.areaLocality,
                    country: 'India'
                },
                sameAsShipping: true,
                
                // Payment and tax
                paymentMethod: 'upi',
                gstType: 'intra-state',
                
                // Order items
                items: [{
                    productId: userSession.orderData.productId,
                    productName: userSession.orderData.productName,
                    quantity: safeNumber(userSession.orderData.quantity),
                    mrp: safeNumber(userSession.orderData.mrp) || safeNumber(userSession.orderData.price),
                    discountPrice: safeNumber(userSession.orderData.price),
                    price: safeNumber(userSession.orderData.price),
                    gstRate: gstRate,
                    gstIncluded: userSession.orderData.gstIncluded !== false,
                    gstAmount: gstAmount,
                    totalAmount: subtotal,
                    sku: userSession.orderData.sku || '',
                    hsnCode: userSession.orderData.hsnCode || ''
                }],
                
                // Order totals
                subtotal: subtotal,
                totalDiscount: safeNumber(userSession.orderData.mrp) > safeNumber(userSession.orderData.price) 
                    ? (safeNumber(userSession.orderData.mrp) - safeNumber(userSession.orderData.price)) * safeNumber(userSession.orderData.quantity)
                    : 0,
                totalGst: gstAmount,
                shippingCharge: 0,
                totalPrice: totalWithGst,
                
                // Payment status
                paidAmount: 0,
                balanceAmount: totalWithGst,
                paymentStatus: 'pending',
                
                // Order metadata
                orderNotes: userSession.orderData.selectedOptions || '',
                status: 'pending',
                
                // ✅ FIXED: Use WhatsApp ID as string (Order model now accepts string)
                createdBy: from,  // WhatsApp ID like "265347508764757@lid"
                
                // ✅ FIXED: Order history with WhatsApp ID
                statusHistory: [{
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    comment: 'Order created via WhatsApp',
                    updatedBy: from  // Same WhatsApp ID
                }]
            };

            console.log('📦 Creating order with data:', {
                companyId: companyId,
                orderNumber: orderData.orderNumber,
                customerName: orderData.customerName,
                deliveryPhone: orderData.phoneNumber,
                whatsappNumber: orderData.whatsappNumber,
                createdBy: orderData.createdBy,  // Will show WhatsApp ID
                amount: orderData.totalPrice,
                product: orderData.items[0].productName
            });

            // Create the order
            const newOrder = await apiService.createOrder(orderData);
            
            if (!newOrder || !newOrder._id) {
                throw new Error('Failed to create order: No order ID returned from API');
            }

            // Store order info in session
            userSession.orderData.orderId = newOrder._id;
            userSession.orderData.apiOrder = newOrder;

            console.log(`✅ Order created successfully:`, {
                orderId: newOrder._id,
                orderNumber: newOrder.orderNumber || orderData.orderNumber,
                companyId: companyId,
                customerName: newOrder.customerName || orderData.customerName,
                createdBy: newOrder.createdBy,
                status: newOrder.status || 'pending',
                amount: newOrder.totalPrice || orderData.totalPrice
            });

            // ✅ Send notifications
            try {
                console.log(`🎯 Sending notifications via Notification Manager for order: ${newOrder.orderNumber}`);
                
                const notificationResult = await notificationManager.sendNewOrderNotification(newOrder);
                
                console.log(`🔔 Notification result:`, {
                    success: notificationResult.success,
                    firebase: notificationResult.channels?.firebase?.success,
                    whatsapp: notificationResult.channels?.whatsapp?.success
                });
                
            } catch (notifyError) {
                console.error(`❌ Notification error:`, notifyError.message);
                // Don't throw - order is already created
            }

            // Send payment instructions
            await sendPaymentInstructions(message, userSession, newOrder, companyId);
            
            // Send order confirmation
            await sendOrderConfirmation(message, userSession, customerPhone);

            // Update session state
            userSession.state = 'AWAITING_PAYMENT_PROOF';
            userSession.orderData.paymentRequestedAt = new Date().toISOString();

            // Schedule payment reminder
            schedulePaymentReminder(userSession, customerPhone, newOrder);

        } catch (error) {
            console.error('❌ API Error creating order:', {
                error: error.message,
                stack: error.stack,
                customerName: userSession.orderData?.customerName,
                customerPhone: customerPhone,
                orderNumber: userSession.orderData?.orderNumber,
                companyId: companyId
            });
            
            // Handle specific error types
            if (error.message.includes('Insufficient stock') || 
                error.message.includes('stock') || 
                error.response?.data?.message?.includes('stock')) {
                
                await message.reply(
                    `❌ *Stock Unavailable*\n\n` +
                    `"${userSession.orderData.productName}" is no longer available in the requested quantity.\n\n` +
                    `💡 *Please try:*\n` +
                    `• Check current stock by typing *Products*\n` +
                    `• Choose another product\n` +
                    `• Contact support for availability\n\n` +
                    `🔄 Type *Products* to browse available items.`
                );
                
            } else {
                await message.reply(
                    `❌ *Order Failed*\n\n` +
                    `We encountered an error while creating your order.\n\n` +
                    `*Please try again or contact support:*\n` +
                    `📞 Support: +91 XXXXX XXXXX\n` +
                    `📧 Email: support@posterpro.store\n\n` +
                    `🔄 *Please start over by typing:* Order`
                );
            }
            
            // Reset session
            userSession.state = 'IDLE';
            delete userSession.orderData;
        }

    } else if (response === 'cancel' || response.includes('cancel')) {
        await handleOrderCancellation(message, userSession);
        
    } else {
        const totalWithGst = safeNumber(userSession.orderData.totalWithGst) || safeNumber(userSession.orderData.totalPrice);
        
        await message.reply(
            `❓ *Please confirm your order*\n\n` +
            `To place your order, type: *PLACE ORDER*\n\n` +
            `*Order Summary:*\n` +
            `👤 Customer: ${userSession.orderData.customerName}\n` +
            `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
            `🛍️ Product: ${userSession.orderData.productName}\n` +
            `📦 Quantity: ${userSession.orderData.quantity}\n` +
            `💰 Total: ₹${safeToFixed(totalWithGst)}\n` +
            `📊 Available Stock: ${safeNumber(userSession.orderData.stock)} units\n\n` +
            `📍 Shipping to:\n${userSession.orderData.completeAddress}\n\n` +
            `💡 *Type CANCEL to stop order process*`
        );
    }
}

/**
 * Send payment instructions to customer
 */
async function sendPaymentInstructions(message, userSession, order, companyId) {
    const orderNumber = order.orderNumber || userSession.orderData.orderNumber;
    const amount = order.totalPrice || userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    const gstAmount = order.totalGst || userSession.orderData.gstAmount || 0;
    
    try {
        // Get company UPI ID from config
        const upiIds = await companyConfig.getActiveUpiIds(companyId);
        const upiId = upiIds.length > 0 ? upiIds[0] : 'posterpro.store@upi';
        
        await message.reply(
            `🎉 *YOUR ORDER IS CONFIRMED!*\n\n` +
            `👤 *Customer:* ${userSession.orderData.customerName}\n` +
            `🧾 *Order Number:* ${orderNumber}\n` +
            `💵 *Amount to Pay:* ₹${safeToFixed(amount)}\n` +
            `📦 *Item:* ${userSession.orderData.productName} x${userSession.orderData.quantity}\n` +
            (gstAmount > 0 ? `💵 *GST Included:* ₹${safeToFixed(gstAmount)}\n` : '') +
            `⏰ *Payment Deadline:* 24 hours\n\n` +
            `💳 *PAYMENT INSTRUCTIONS*\n\n` +
            `1️⃣ *UPI Payment (Recommended):*\n` +
            `📱 UPI ID: ${upiId}\n\n` +
            `2️⃣ *QR Code:* Available on request\n\n` +
            `🔢 *MANDATORY PAYMENT NOTES:*\n` +
            `• Amount must be exact: ₹${safeToFixed(amount)}\n` +
            `• Add note: Order ${orderNumber} - ${userSession.orderData.customerName}\n` +
            `• Keep screenshot of successful payment\n\n` +
            `📸 *After payment:*\n` +
            `Send screenshot here within 24 hours`
        );

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await message.reply(
            `📋 *PAYMENT VERIFICATION PROCESS*\n\n` +
            `1. Make payment to ${upiId}\n` +
            `2. Take clear screenshot of:\n` +
            `   ✅ "Payment Successful" message\n` +
            `   ✅ Amount: ₹${safeToFixed(amount)}\n` +
            `   ✅ UPI ID: ${upiId}\n` +
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
        await message.reply(
            `🎉 Order confirmed for ${userSession.orderData.customerName}!\n` +
            `Pay ₹${safeToFixed(amount)} to complete.\n\n` +
            `Order: ${orderNumber}\n` +
            `Send payment screenshot here.`
        );
    }
}

/**
 * Send order confirmation to customer
 */
async function sendOrderConfirmation(message, userSession, customerPhone) {
    const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    
    try {
        await message.reply(
            `✅ *Order Confirmed Successfully!*\n\n` +
            `Dear ${userSession.orderData.customerName},\n\n` +
            `Your order #${userSession.orderData.orderNumber} has been confirmed!\n\n` +
            `📊 *Order Details:*\n` +
            `• Order #: ${userSession.orderData.orderNumber}\n` +
            `• Amount: ₹${safeToFixed(amount)}\n` +
            `• Product: ${userSession.orderData.productName} x${userSession.orderData.quantity}\n\n` +
            `⏰ *Next Steps:*\n` +
            `1. Make payment\n` +
            `2. Send payment screenshot here\n` +
            `3. Order will be processed after payment verification\n\n` +
            `🕒 *Processing Time:* 24-48 hours after payment\n\n` +
            `📞 *Need Help?* Reply to this message`
        );
        
        console.log(`📱 Order confirmation sent via WhatsApp to: ${userSession.orderData.customerName} (${customerPhone})`);
        
    } catch (error) {
        console.error('❌ Error sending order confirmation:', error);
        await message.reply(
            `✅ Order #${userSession.orderData.orderNumber} confirmed!\n` +
            `Amount: ₹${safeToFixed(amount)}\n` +
            `Please make payment and send screenshot.`
        );
    }
}

/**
 * Schedule payment reminder
 */
function schedulePaymentReminder(userSession, customerPhone, order) {
    const reminderTime = 60 * 60 * 1000;
    
    setTimeout(async () => {
        try {
            const currentOrder = await apiService.getOrderById(order._id);
            
            if (currentOrder && currentOrder.paymentStatus === 'pending') {
                console.log(`⏰ Sending payment reminder for order: ${order.orderNumber}`);
                
                try {
                    await notificationManager.sendNotification('PAYMENT_REMINDER', {
                        orderNumber: order.orderNumber,
                        customerName: order.customerName,
                        customerPhone: order.customerPhone,
                        totalAmount: order.totalPrice,
                        reminderType: '24_hour'
                    });
                } catch (reminderError) {
                    console.error('Payment reminder notification failed:', reminderError.message);
                }
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
    const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    
    await message.reply(
        `🛑 *Cancel Order Process?*\n\n` +
        `Are you sure you want to cancel this order?\n\n` +
        `*Order Details:*\n` +
        `👤 Customer: ${userSession.orderData.customerName}\n` +
        `📱 Phone: ${userSession.orderData.phoneNumber}\n` +
        `🛍️ Product: ${userSession.orderData.productName}\n` +
        `💰 Amount: ₹${safeToFixed(amount)}\n\n` +
        `✅ Type *YES* to cancel and clear all details\n` +
        `❌ Type *NO* to continue with your order\n\n` +
        `*Note:* This action cannot be undone.`
    );
    
    userSession.previousState = userSession.state;
    userSession.state = 'AWAITING_CANCELLATION_CONFIRMATION';
}

async function handlePaymentProof(message, userSession, userSessions, client, companyId) {
    const amount = userSession.orderData.totalWithGst || userSession.orderData.totalPrice;
    const whatsappNumber = extractCustomerPhone(message);
    
    if (message.hasMedia) {
        try {
            userSession.orderData.lastPaymentMessage = {
                from: message.from,
                whatsappNumber: whatsappNumber,
                timestamp: new Date().toISOString(),
                customerName: userSession.orderData.customerName,
                orderNumber: userSession.orderData.orderNumber,
                amount: amount,
                deliveryPhone: userSession.orderData.phoneNumber,
                companyId: companyId
            };
            
            console.log('📸 Payment proof received:', {
                orderNumber: userSession.orderData.orderNumber,
                whatsappNumber: whatsappNumber,
                customerName: userSession.orderData.customerName,
                amount: amount,
                companyId: companyId
            });
            
            await handlePaymentVerification(message, client);
            
        } catch (error) {
            console.error('❌ Error in payment proof handling:', error);
            await message.reply(
                `❌ *Error Processing Payment*\n\n` +
                `Failed to process your payment screenshot. Please try again.\n\n` +
                `*Please ensure:*\n` +
                `✅ Clear screenshot of payment success\n` +
                `✅ Amount ₹${safeToFixed(amount)} visible\n` +
                `✅ UPI ID visible\n\n` +
                `Send the screenshot again.`
            );
        }
        
    } else {
        const userMessage = message.body.trim().toLowerCase();
        if (userMessage.includes('cancel')) {
            await handleOrderCancellation(message, userSession);
            return;
        }
        
        await message.reply(
            `📸 *Payment Proof Required*\n\n` +
            `Dear ${userSession.orderData.customerName}, please send the screenshot of your payment confirmation.\n\n` +
            `💡 *How to take screenshot:*\n` +
            `1. Complete payment\n` +
            `2. Take screenshot of payment success screen\n` +
            `3. Make sure amount ₹${safeToFixed(amount)} is visible\n` +
            `4. Send the screenshot here\n\n` +
            `If you haven't paid yet, please complete the payment first.\n\n` +
            `💡 Type *CANCEL* to stop order process`
        );
        return;
    }
}

/**
 * Helper function to validate image URLs
 */
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