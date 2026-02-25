


// // handlers/paymentVerificationHandler.js - ENHANCED PROFESSIONAL VERSION
// import apiService from "../../services/apiService.js";
// import notificationManager from "../../services/notifications/notification-manager.js";
// import pkg from 'whatsapp-web.js';
// import Tesseract from 'tesseract.js';
// import crypto from 'crypto';
// import companyConfig from '../../shared/companyConfig.js';

// const { MessageMedia } = pkg;

// // ==================== REPLACE THIS SECTION ====================
// // Remove this hardcoded array:
// // const VALID_UPI_IDS = [
// //     'subaask21@oksbi',
// //     'posterpro.store@okaxis', 
// //     'posterpro.store@paytm',
// //     'posterpro.store@axl',
// //     'posterpro.store@ybl'
// // ];

// // ==================== ADD THIS NEW SECTION ====================

// // Dynamic UPI IDs from database
// let VALID_UPI_IDS = [];

// // Default fallback UPI IDs (used only if API fails)
// const DEFAULT_UPI_IDS = [
//     'subaask21@oksbi',
//     'posterpro.store@okaxis',
//     'posterpro.store@paytm',
//     'posterpro.store@axl',
//     'posterpro.store@ybl'
// ];

// /**
//  * Initialize UPI IDs from database via API
//  */
// async function initializeUpiIds() {
//     try {
//         console.log('🔄 [PaymentVerification] Loading UPI IDs from database...');
//         const activeUpiIds = await companyConfig.getActiveUpiIds();
        
//         if (activeUpiIds && activeUpiIds.length > 0) {
//             VALID_UPI_IDS = activeUpiIds;
//             console.log('✅ [PaymentVerification] Loaded UPI IDs:', VALID_UPI_IDS.join(', '));
//         } else {
//             console.warn('⚠️ [PaymentVerification] No active UPI IDs found, using defaults');
//             VALID_UPI_IDS = [...DEFAULT_UPI_IDS];
//         }
//     } catch (error) {
//         console.error('❌ [PaymentVerification] Failed to load UPI IDs:', error.message);
//         VALID_UPI_IDS = [...DEFAULT_UPI_IDS];
//     }
// }

// // Initialize immediately
// initializeUpiIds();

// // Auto-refresh every 5 minutes
// setInterval(async () => {
//     console.log('⏰ [PaymentVerification] Auto-refreshing UPI IDs...');
//     await initializeUpiIds();
// }, 5 * 60 * 1000);

// // ==================== REST OF YOUR CODE CONTINUES ====================
// // Your existing code continues below...
// // (VALIDATION_CONFIG, PAYMENT_INDICATORS, etc.)
// const VALIDATION_CONFIG = {
//     amountTolerance: 2, // ₹2 tolerance for exact matching
//     minConfidenceScore: 85, // Minimum confidence for auto-verification
//     minTextLength: 20,
//     requiredPaymentIndicators: 4,
//     maxImageSize: 5 * 1024 * 1024,
//     recentPaymentThreshold: 15, // 15 minutes window
//     duplicateWindow: 5 * 60 * 1000, // 5 minutes
//     ocrEngine: {
//         language: 'eng',
//         oem: 3,
//         psm: 6,
//         tessedit_char_whitelist: '0123456789₹Rs.INRabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@-: /,()',
//         preserve_interword_spaces: '1'
//     }
// };

// const PAYMENT_INDICATORS = {
//     success: [
//         'successful', 'completed', 'paid', 'sent', 'transferred', 'payment done', 
//         'success', 'approved', 'payment successful', 'money sent', 'transaction successful',
//         'paid successfully', 'payment completed', 'successfully paid', 'done'
//     ],
//     failure: [
//         'failed', 'rejected', 'cancelled', 'declined', 'error', 'unsuccessful', 
//         'payment failed', 'transaction failed', 'insufficient', 'declined'
//     ],
//     amount: [
//         'amount', 'rs', '₹', 'inr', 'rupees', 'total', 'money', 'sent', 'paid', 'pay',
//         'payment of', 'of ₹', 'amount paid', 'total amount', 'paid amount'
//     ],
//     transaction: [
//         'transaction', 'payment', 'upi', 'reference', 'id', 'utr', 'ref', 'txn', 
//         'transaction id', 'reference no', 'utr no', 'transaction ref'
//     ],
//     apps: [
//         'gpay', 'phonepe', 'paytm', 'bhim', 'bank', 'upi', 'google pay',
//         'googlepay', 'phone pe', 'paytm payment bank', 'upi payment'
//     ]
// };

// // Track verification state
// const verificationState = new Map();
// const userOrderState = new Map();

// // Processed images cache
// const processedImages = new Map();

// // OCR cache for performance
// const ocrCache = new Map();
// const OCR_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// // Image hash cache for duplicate detection
// const imageHashCache = new Map();

// /**
//  * Generate hash from image data for duplicate detection
//  */
// function generateImageHash(imageData) {
//     return crypto.createHash('md5').update(imageData.substring(0, 1000)).digest('hex');
// }

// /**
//  * Main payment verification handler
//  */
// export async function handlePaymentVerification(message, client) {
//     try {
//         const from = message.from;
//         const userPhone = apiService.cleanPhoneNumber(from);
//         const userMessage = message.body.trim().toLowerCase();
        
//         console.log(`🔍 Payment verification request from: ${userPhone}, Message: "${userMessage.substring(0, 50)}"`);

//         // Check for admin commands first
//         if (await handleAdminCommands(message, client, userMessage)) {
//             return;
//         }

//         // Check if user has already completed verification
//         const existingState = verificationState.get(userPhone);
//         if (existingState?.verified) {
//             await sendAlreadyVerifiedMessage(message, existingState);
//             return;
//         }

//         // Handle media (screenshot)
//         if (message.hasMedia) {
//             return await handlePaymentScreenshot(message, client);
//         }

//         // Handle help requests
//         if (userMessage === '!paymenthelp' || userMessage === 'payment help') {
//             return await showPaymentInstructions(message, client);
//         }

//         // Handle menu or clear commands
//         if (userMessage === '!menu' || userMessage === 'menu') {
//             verificationState.delete(userPhone);
//             userOrderState.delete(userPhone);
//             await message.reply('🔄 *Starting fresh order process...*\n\nPlease wait for the menu...');
//             return;
//         }

//         if (userMessage === '!clear') {
//             verificationState.delete(userPhone);
//             userOrderState.delete(userPhone);
//             await message.reply('✅ Verification state cleared. You can now send payment screenshot.');
//             return;
//         }

//         // Default: Show verification help
//         await showVerificationHelp(message, client);

//     } catch (error) {
//         console.error('❌ Payment verification error:', error);
//         await sendErrorMessage(message, '❌ Verification failed. Please try again or contact support.');
//     }
// }

// /**
//  * Handle payment screenshot from customer
//  */
// async function handlePaymentScreenshot(message, client) {
//     try {
//         const from = message.from;
//         const customerPhone = apiService.cleanPhoneNumber(from);
        
//         console.log(`📸 Processing payment screenshot from: ${customerPhone}`);

//         // Check if already verified
//         const existingState = verificationState.get(customerPhone);
//         if (existingState?.verified) {
//             await sendAlreadyVerifiedMessage(message, existingState);
//             return;
//         }

//         // Check for duplicate processing
//         const processingKey = `${customerPhone}_${Date.now()}`;
//         if (processedImages.has(processingKey)) {
//             await message.reply('⏳ Please wait, your previous screenshot is still being processed.');
//             return;
//         }
//         processedImages.set(processingKey, true);
//         setTimeout(() => processedImages.delete(processingKey), VALIDATION_CONFIG.duplicateWindow);

//         const media = await message.downloadMedia();
        
//         if (!media) {
//             return await sendErrorMessage(message, '❌ Failed to download image. Please try again.');
//         }

//         // Generate image hash for duplicate detection
//         const imageHash = generateImageHash(media.data);
//         if (imageHashCache.has(imageHash)) {
//             const lastUpload = imageHashCache.get(imageHash);
//             if (Date.now() - lastUpload < VALIDATION_CONFIG.duplicateWindow) {
//                 return await message.reply('⏳ This screenshot was already uploaded recently. Please wait for processing.');
//             }
//         }
//         imageHashCache.set(imageHash, Date.now());

//         // Validate image
//         const imageValidation = validateImage(media);
//         if (!imageValidation.isValid) {
//             return await sendInvalidImageMessage(message, imageValidation.reason);
//         }

//         // Get orders that need payment verification (pending payment)
//         const pendingOrders = await getCustomerPendingOrders(customerPhone);
        
//         console.log(`📦 Found ${pendingOrders.length} orders needing payment verification for ${customerPhone}`);

//         if (!pendingOrders || pendingOrders.length === 0) {
//             return await sendNoPendingOrdersMessage(message, customerPhone);
//         }

//         // Quick validation
//         await message.reply('🔍 *Analyzing payment screenshot...*');
//         const quickValidation = await quickImageValidation(media.data);
        
//         if (!quickValidation.isValid) {
//             return await sendInvalidPaymentScreenshotMessage(message, quickValidation);
//         }

//         // Process payment with enhanced validation
//         await processPaymentScreenshot(media.data, customerPhone, client, message, pendingOrders, imageHash);

//     } catch (error) {
//         console.error('Payment screenshot handling error:', error);
//         await sendErrorMessage(message, '❌ Failed to process payment screenshot. Please try again.');
//     }
// }

// /**
//  * Enhanced function to get customer pending orders - FIXED VERSION
//  * Now correctly identifies orders that need payment verification
//  */
// async function getCustomerPendingOrders(customerIdentifier) {
//     try {
//         // Clean the identifier to get 10-digit format
//         const cleanIdentifier = apiService.cleanPhoneNumber(customerIdentifier);
//         console.log(`📞 Fetching orders for customer: ${cleanIdentifier} (original: ${customerIdentifier})`);
        
//         // Get all orders for this customer using the identifier
//         // This will search by BOTH phoneNumber and whatsappNumber
//         const allOrders = await apiService.getCustomerOrders(cleanIdentifier);
        
//         console.log(`📊 Total orders found: ${allOrders?.length || 0}`);
        
//         if (!allOrders || allOrders.length === 0) {
//             console.log(`❌ No orders found for identifier: ${cleanIdentifier}`);
//             return [];
//         }

//         // Log all orders for debugging
//         console.log('📋 All customer orders:');
//         allOrders.forEach((order, idx) => {
//             console.log(`  ${idx + 1}. Order: ${order.orderNumber}, Status: ${order.status}, Payment: ${order.paymentStatus}, Amount: ₹${order.totalPrice}, WhatsApp: ${order.whatsappNumber || 'N/A'}`);
//         });

//         // Filter for orders that need payment verification
//         // An order needs payment verification if:
//         // 1. Payment status is NOT 'paid', 'completed', or 'verified'
//         // 2. Order is NOT cancelled, returned, or refunded
//         // 3. The order belongs to this customer (matched by phone OR whatsapp)
        
//         const pendingOrders = allOrders.filter(order => {
//             const status = (order.status || '').toLowerCase();
//             const paymentStatus = (order.paymentStatus || '').toLowerCase();
            
//             // Check if payment is NOT completed
//             const isPaymentNotPaid = !['paid', 'completed', 'verified'].includes(paymentStatus);
            
//             // Check if order is NOT cancelled/returned/refunded
//             const isOrderActive = !['cancelled', 'returned', 'refunded'].includes(status);
            
//             // Check if this order belongs to the customer (by matching either phone or whatsapp)
//             const orderPhone = apiService.cleanPhoneNumber(order.phoneNumber || '');
//             const orderWhatsapp = apiService.cleanPhoneNumber(order.whatsappNumber || '');
//             const searchIdentifier = cleanIdentifier;
            
//             const belongsToCustomer = 
//                 orderPhone === searchIdentifier || 
//                 orderWhatsapp === searchIdentifier ||
//                 (order.secondaryPhoneNumber && apiService.cleanPhoneNumber(order.secondaryPhoneNumber) === searchIdentifier);
            
//             // Log each order's eligibility
//             const isEligible = isPaymentNotPaid && isOrderActive && belongsToCustomer;
            
//             if (isEligible) {
//                 console.log(`  ✅ Order ${order.orderNumber} needs verification (Payment: ${paymentStatus}, Status: ${status})`);
//             } else if (!belongsToCustomer) {
//                 console.log(`  ❌ Order ${order.orderNumber} belongs to different customer`);
//             }
            
//             return isEligible;
//         });

//         console.log(`✅ Filtered to ${pendingOrders.length} orders needing payment verification:`);
//         pendingOrders.forEach((order, idx) => {
//             const productNames = order.items?.map(item => item.productName).join(', ') || 'Unknown';
//             console.log(`  ${idx + 1}. ${order.orderNumber}: ₹${order.totalPrice} - ${productNames} (Status: ${order.status}, Payment: ${order.paymentStatus})`);
//         });

//         return pendingOrders;

//     } catch (error) {
//         console.error('❌ Error fetching customer orders:', error);
//         return [];
//     }
// }

// /**
//  * Enhanced quick image validation
//  */
// async function quickImageValidation(imageData) {
//     try {
//         // Check cache first
//         const cacheKey = imageData.substring(0, 100);
//         if (ocrCache.has(cacheKey)) {
//             const cached = ocrCache.get(cacheKey);
//             if (Date.now() - cached.timestamp < OCR_CACHE_TTL) {
//                 console.log('📦 Using cached OCR result');
//                 return cached.result;
//             }
//             ocrCache.delete(cacheKey);
//         }

//         const result = await Tesseract.recognize(
//             Buffer.from(imageData, 'base64'),
//             'eng',
//             { 
//                 logger: m => {
//                     if (m.status === 'recognizing text') {
//                         const progress = Math.round(m.progress * 100);
//                         if (progress % 25 === 0) console.log(`📊 OCR Progress: ${progress}%`);
//                     }
//                 },
//                 tessedit_pageseg_mode: VALIDATION_CONFIG.ocrEngine.psm,
//                 tessedit_ocr_engine_mode: VALIDATION_CONFIG.ocrEngine.oem
//             }
//         );

//         const text = result.data.text.toLowerCase();
//         console.log('📝 OCR Text Sample:', text.substring(0, 300) + '...');
        
//         const analysis = analyzeTextForPaymentIndicators(text);
        
//         const validationResult = {
//             isValid: analysis.isPaymentScreenshot,
//             confidence: analysis.confidence,
//             foundIndicators: analysis.foundIndicators,
//             missingIndicators: analysis.missingIndicators,
//             reason: analysis.reason,
//             textLength: text.length,
//             rawText: text
//         };

//         // Cache the result
//         ocrCache.set(cacheKey, {
//             timestamp: Date.now(),
//             result: validationResult
//         });

//         return validationResult;

//     } catch (error) {
//         console.error('Quick validation error:', error);
//         return {
//             isValid: false,
//             reason: 'Cannot process image for validation',
//             confidence: 0,
//             rawText: ''
//         };
//     }
// }

// /**
//  * Enhanced text analysis for payment indicators
//  */
// function analyzeTextForPaymentIndicators(text) {
//     const foundIndicators = [];
//     let score = 0;

//     // Check for payment app indicators
//     PAYMENT_INDICATORS.apps.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 10;
//         }
//     });

//     // Check for transaction indicators
//     PAYMENT_INDICATORS.transaction.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 8;
//         }
//     });

//     // Check for amount indicators
//     PAYMENT_INDICATORS.amount.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 8;
//         }
//     });

//     // Check for success indicators
//     const hasSuccess = PAYMENT_INDICATORS.success.some(indicator => text.includes(indicator));
//     const hasFailure = PAYMENT_INDICATORS.failure.some(indicator => text.includes(indicator));

//     if (hasSuccess) {
//         foundIndicators.push('success');
//         score += 30;
//     }

//     if (hasFailure) {
//         foundIndicators.push('failure');
//         score -= 50;
//     }

//     // Check for UPI ID patterns
//     const upiPattern = /@(?:oksbi|okaxis|paytm|axl|ybl|sbi|hdfc|icici)/i;
//     if (upiPattern.test(text)) {
//         foundIndicators.push('upi_detected');
//         score += 20;
//     }

//     // Check for amount patterns with currency
//     const amountPattern = /(?:rs\.?|₹|inr)\s*(\d+)/i;
//     if (amountPattern.test(text)) {
//         foundIndicators.push('amount_with_currency');
//         score += 15;
//     }

//     // Check for transaction ID patterns
//     const txnPattern = /(?:txn|trn|ref|utr|id)[:\s]*([a-z0-9]{8,})/i;
//     if (txnPattern.test(text)) {
//         foundIndicators.push('transaction_id');
//         score += 15;
//     }

//     // Check for date/time patterns
//     const dateTimePattern = /\d{1,2}[\/\-:]\d{1,2}(?:[\/\-:]\d{2,4})?|\d{1,2}:\d{2}/;
//     if (dateTimePattern.test(text)) {
//         foundIndicators.push('datetime');
//         score += 5;
//     }

//     // Determine if it's a payment screenshot
//     const isPaymentScreenshot = score >= 50 && foundIndicators.length >= VALIDATION_CONFIG.requiredPaymentIndicators;

//     return {
//         isPaymentScreenshot,
//         confidence: Math.min(100, Math.max(0, score)),
//         foundIndicators: [...new Set(foundIndicators)],
//         missingIndicators: [],
//         reason: isPaymentScreenshot ? 
//             `Valid payment screenshot detected (${foundIndicators.length} indicators, score: ${score})` :
//             `Not a payment screenshot (only ${foundIndicators.length} indicators found, score: ${score})`
//     };
// }

// /**
//  * Process payment screenshot with full analysis
//  */
// async function processPaymentScreenshot(imageData, customerPhone, client, originalMessage, pendingOrders, imageHash) {
//     try {
//         await originalMessage.reply('🔍 *Analyzing Payment Screenshot...*\n\nPlease wait while we verify your payment details.');

//         // Perform detailed OCR analysis
//         const ocrResult = await performDetailedOCRAnalysis(imageData);
        
//         if (!ocrResult.isReadable) {
//             return await sendUnreadableScreenshotMessage(originalMessage, ocrResult);
//         }

//         // Enhanced validation: Check if it's a recent payment
//         const timeValidation = validatePaymentTime(ocrResult.analysis);
//         if (!timeValidation.isRecent) {
//             return await sendOldPaymentMessage(originalMessage, timeValidation);
//         }

//         // Find matching order and validate payment
//         const verificationResult = await findAndValidatePayment(ocrResult, pendingOrders);
        
//         console.log('📊 Verification Result:', {
//             isValid: verificationResult.isValid,
//             confidence: verificationResult.confidence,
//             matchedOrder: verificationResult.matchedOrder?.orderNumber,
//             errors: verificationResult.errors,
//             warnings: verificationResult.warnings
//         });

//         if (verificationResult.isValid) {
//             await processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone, imageHash);
//         } else {
//             await handleFailedVerification(verificationResult, client, originalMessage);
//         }

//     } catch (error) {
//         console.error('Payment processing error:', error);
//         await sendErrorMessage(originalMessage, '❌ Error processing payment. Please try again or contact support.');
//     }
// }

// /**
//  * Validate payment time - Check if payment is recent
//  */
// function validatePaymentTime(analysis) {
//     try {
//         const now = new Date();
//         const detectedTime = extractExactTime(analysis.timestamp || analysis.rawText);
        
//         if (!detectedTime) {
//             console.log('⏰ No timestamp detected in OCR');
//             return { isRecent: true, reason: 'No timestamp found, proceeding with validation' };
//         }

//         const timeDiff = Math.abs(now - detectedTime) / (1000 * 60); // Difference in minutes
        
//         console.log('⏰ Time Validation:', {
//             detectedTime: detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//             currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//             difference: Math.round(timeDiff) + ' minutes'
//         });
        
//         if (timeDiff > VALIDATION_CONFIG.recentPaymentThreshold) {
//             return {
//                 isRecent: false,
//                 reason: `Payment is too old (${Math.round(timeDiff)} minutes ago). Please send screenshot within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes of payment.`,
//                 detectedTime: detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
//                 currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//             };
//         }

//         return { 
//             isRecent: true, 
//             reason: `Payment is recent (${Math.round(timeDiff)} minutes ago)`,
//             detectedTime: detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//         };

//     } catch (error) {
//         console.error('Time validation error:', error);
//         return { isRecent: true, reason: 'Time validation skipped' };
//     }
// }

// /**
//  * Extract exact time from text - ENHANCED VERSION
//  */
// function extractExactTime(text) {
//     try {
//         console.log('⏰ Extracting time from text...');
        
//         const now = new Date();
        
//         // Enhanced patterns for Indian formats
//         const patterns = [
//             // DD/MM/YYYY HH:MM AM/PM
//             /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[,\s]*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)/i,
            
//             // DD/MM/YYYY HH:MM (24hr)
//             /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[,\s]*(\d{1,2}):(\d{2})(?::(\d{2}))?/i,
            
//             // Today at HH:MM AM/PM
//             /today\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i,
            
//             // HH:MM AM/PM DD/MM/YYYY
//             /(\d{1,2}):(\d{2})\s*(am|pm)?[,\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
            
//             // HH:MM AM/PM (assume today)
//             /(\d{1,2}):(\d{2})\s*(am|pm)/i,
            
//             // HH:MM (24hr format)
//             /(\d{1,2}):(\d{2})(?![0-9])/,
            
//             // Just now / few seconds ago
//             /(just\s+now|few\s+seconds\s+ago|a\s+moment\s+ago|now)/i
//         ];

//         for (const pattern of patterns) {
//             const match = text.match(pattern);
//             if (match) {
//                 console.log('⏰ Pattern matched:', pattern.source.substring(0, 50) + '...');
                
//                 let hours = 0, minutes = 0, seconds = 0;
//                 let day = now.getDate(), month = now.getMonth(), year = now.getFullYear();
//                 let period = '';

//                 if (pattern.source.includes('just now')) {
//                     return new Date(now.getTime() - 60000); // 1 minute ago
//                 }

//                 if (pattern.source.includes('today at')) {
//                     hours = parseInt(match[1]);
//                     minutes = parseInt(match[2]);
//                     period = (match[3] || '').toLowerCase();
//                 }
//                 else if (match[6] && match[7]) { // Full date with AM/PM
//                     day = parseInt(match[1]);
//                     month = parseInt(match[2]) - 1;
//                     year = parseInt(match[3]);
//                     if (year < 100) year += 2000;
//                     hours = parseInt(match[4]);
//                     minutes = parseInt(match[5]);
//                     if (match[6]) seconds = parseInt(match[6]) || 0;
//                     period = (match[7] || '').toLowerCase();
//                 }
//                 else if (match[3] && match[4] && match[5]) { // Time with AM/PM and date
//                     hours = parseInt(match[1]);
//                     minutes = parseInt(match[2]);
//                     period = (match[3] || '').toLowerCase();
//                     day = parseInt(match[4]);
//                     month = parseInt(match[5]) - 1;
//                     year = parseInt(match[6]);
//                     if (year < 100) year += 2000;
//                 }
//                 else if (match[3]) { // Just time with AM/PM
//                     hours = parseInt(match[1]);
//                     minutes = parseInt(match[2]);
//                     period = match[3].toLowerCase();
//                 }
//                 else { // Just time without AM/PM
//                     hours = parseInt(match[1]);
//                     minutes = parseInt(match[2]);
//                     if (match[3]) seconds = parseInt(match[3]) || 0;
                    
//                     // Try to infer AM/PM from context
//                     if (hours > 12) {
//                         period = 'pm';
//                     } else {
//                         const context = text.toLowerCase();
//                         if (context.includes('pm') && hours < 12) period = 'pm';
//                         else if (context.includes('am')) period = 'am';
//                         else period = now.getHours() >= 12 ? 'pm' : 'am';
//                     }
//                 }

//                 // Convert to 24-hour format
//                 if (period === 'pm' && hours < 12) hours += 12;
//                 if (period === 'am' && hours === 12) hours = 0;

//                 // Validate
//                 if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
//                     const date = new Date(year, month, day, hours, minutes, seconds);
                    
//                     // Check if date is in the future (timezone issue)
//                     if (date > now) {
//                         const timeDiff = date - now;
//                         if (timeDiff > 12 * 60 * 60 * 1000) { // More than 12 hours
//                             date.setDate(date.getDate() - 1);
//                         }
//                     }
                    
//                     console.log('⏰ Parsed date:', date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
//                     return date;
//                 }
//             }
//         }

//         console.log('⏰ No valid time pattern found');
//         return null;
//     } catch (error) {
//         console.error('⏰ Time extraction error:', error);
//         return null;
//     }
// }

// /**
//  * Perform detailed OCR analysis with enhancements
//  */
// async function performDetailedOCRAnalysis(imageData) {
//     try {
//         console.log('🔍 Starting detailed OCR analysis...');
//         const startTime = Date.now();

//         const result = await Tesseract.recognize(
//             Buffer.from(imageData, 'base64'),
//             'eng',
//             {
//                 logger: m => {
//                     if (m.status === 'recognizing text') {
//                         const progress = Math.round(m.progress * 100);
//                         console.log(`📊 OCR Progress: ${progress}%`);
//                     }
//                 },
//                 tessedit_pageseg_mode: VALIDATION_CONFIG.ocrEngine.psm,
//                 tessedit_ocr_engine_mode: VALIDATION_CONFIG.ocrEngine.oem
//             }
//         );

//         const processingTime = Date.now() - startTime;
//         const text = result.data.text;
//         const words = result.data.words || [];
        
//         console.log(`✅ OCR completed in ${processingTime}ms`);
//         console.log(`📝 Text length: ${text.length} chars, Words: ${words.length}`);
        
//         // Enhanced analysis
//         const analysis = analyzePaymentText(text);

//         return {
//             text: text,
//             confidence: result.data.confidence,
//             words: words,
//             isReadable: text.length >= VALIDATION_CONFIG.minTextLength && result.data.confidence > 30,
//             wordCount: words.length,
//             processingTime: processingTime,
//             analysis: analysis
//         };

//     } catch (error) {
//         console.error('OCR Analysis Error:', error);
//         return {
//             text: '',
//             confidence: 0,
//             words: [],
//             isReadable: false,
//             wordCount: 0,
//             processingTime: 0,
//             analysis: {},
//             error: error.message
//         };
//     }
// }

// /**
//  * Enhanced payment text analysis
//  */
// function analyzePaymentText(text) {
//     console.log('🔍 Starting payment text analysis...');
    
//     const lowerText = text.toLowerCase();
    
//     const analysis = {
//         amount: extractAmount(text, lowerText),
//         upiId: extractUPIId(lowerText),
//         transactionId: extractTransactionId(lowerText),
//         timestamp: extractTimestamp(lowerText),
//         status: extractPaymentStatus(lowerText),
//         bankName: extractBankName(lowerText),
//         appName: extractAppName(lowerText),
//         rawText: text
//     };

//     console.log('🔍 Analysis Result:', {
//         amount: analysis.amount,
//         upiId: analysis.upiId,
//         status: analysis.status,
//         timestamp: analysis.timestamp,
//         appName: analysis.appName,
//         hasTransactionId: !!analysis.transactionId
//     });

//     return analysis;
// }

// /**
//  * SMART AMOUNT EXTRACTION - ENHANCED VERSION
//  */
// function extractAmount(originalText, lowerText) {
//     console.log('💰 Starting amount extraction...');
    
//     // Remove phone numbers and dates first
//     let cleanText = originalText
//         .replace(/\+\d{10,}/g, ' ')
//         .replace(/\b\d{10}\b/g, ' ')
//         .replace(/\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi, ' ')
//         .replace(/\d{1,2}:\d{2}\s*(?:am|pm)?/gi, ' ');
    
//     console.log('🧹 Cleaned text sample:', cleanText.substring(0, 200));

//     // Strategy 1: Look for amount with currency symbol
//     const currencyPatterns = [
//         /₹\s*(\d+(?:[.,]\d+)?)/gi,
//         /rs\.?\s*(\d+(?:[.,]\d+)?)/gi,
//         /inr\s*(\d+(?:[.,]\d+)?)/gi,
//         /rupees?\s*(\d+(?:[.,]\d+)?)/gi
//     ];

//     for (const pattern of currencyPatterns) {
//         const matches = [...cleanText.matchAll(pattern)];
//         for (const match of matches) {
//             if (match[1]) {
//                 const amount = parseFloat(match[1].replace(/[.,]/g, ''));
//                 if (!isNaN(amount) && amount >= 1 && amount <= 50000) {
//                     console.log(`🎯 Found amount via currency pattern: ₹${amount}`);
//                     return Math.round(amount);
//                 }
//             }
//         }
//     }

//     // Strategy 2: Look for amount near payment keywords
//     const paymentKeywords = ['pay', 'sent', 'paid', 'amount', 'total', 'money', 'transfer'];
//     const numberPattern = /\b(\d{1,5})\b/g;
//     const numberMatches = [...cleanText.matchAll(numberPattern)];
    
//     const candidateAmounts = [];

//     for (const match of numberMatches) {
//         const amount = parseInt(match[1]);
//         if (!isNaN(amount) && amount >= 10 && amount <= 50000) {
//             // Check context around the number
//             const startIdx = Math.max(0, match.index - 40);
//             const endIdx = Math.min(cleanText.length, match.index + 40);
//             const context = cleanText.substring(startIdx, endIdx).toLowerCase();
            
//             // Score the amount
//             let score = 0;
            
//             // Check if near payment keywords
//             if (paymentKeywords.some(keyword => context.includes(keyword))) {
//                 score += 20;
//             }
            
//             // Check if amount is likely (ends with 0, 5, 9)
//             if (amount % 5 === 0 || amount % 10 === 0 || amount % 9 === 0) {
//                 score += 10;
//             }
            
//             // Check if near currency symbol
//             if (context.includes('₹') || context.includes('rs')) {
//                 score += 15;
//             }
            
//             candidateAmounts.push({ amount, score, context, index: match.index });
//         }
//     }

//     if (candidateAmounts.length > 0) {
//         // Sort by score and position
//         candidateAmounts.sort((a, b) => {
//             if (b.score !== a.score) return b.score - a.score;
//             return a.index - b.index;
//         });
        
//         const bestMatch = candidateAmounts[0];
//         console.log(`🎯 Selected amount from ${candidateAmounts.length} candidates: ₹${bestMatch.amount} (score: ${bestMatch.score})`);
//         return bestMatch.amount;
//     }

//     console.log('⚠️ No reasonable amount found');
//     return null;
// }

// /**
//  * Extract UPI ID from text - ENHANCED
//  */
// function extractUPIId(text) {
//     const upiPatterns = [
//         /([a-zA-Z0-9._-]+@(?:oksbi|okaxis|okhdfc|okicici|paytm|axl|ybl|sbi|hdfc|icici))/gi,
//         /to:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
//         /receiver:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
//         /pay to\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
//         /upi id:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
//         /vpa:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
//         /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/g
//     ];

//     for (const pattern of upiPatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             for (const match of matches) {
//                 let upi = match.trim()
//                     .replace(/^(?:to|receiver|pay to|upi id|vpa)[:\s]*/gi, '')
//                     .trim();
                
//                 if (upi.includes('@') && upi.split('@')[0].length > 2) {
//                     console.log(`✅ Found UPI ID: ${upi}`);
//                     return upi;
//                 }
//             }
//         }
//     }
    
//     return null;
// }

// /**
//  * Extract transaction ID from text - ENHANCED
//  */
// function extractTransactionId(text) {
//     const patterns = [
//         /(?:transaction|txn|trn|ref|reference|utr|id)[\s:]*([a-zA-Z0-9]{8,20})/gi,
//         /([A-Z0-9]{12,20})(?:\s|$)/g,
//         /([0-9]{12,20})/g,
//         /([a-zA-Z0-9]{16,20})/g
//     ];

//     for (const pattern of patterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             for (const match of matches) {
//                 const clean = match.replace(/[^a-zA-Z0-9]/g, '');
//                 if (clean.length >= 8 && clean.length <= 25) {
//                     console.log(`✅ Found Transaction ID: ${clean}`);
//                     return clean;
//                 }
//             }
//         }
//     }
    
//     return null;
// }

// /**
//  * Extract timestamp from text
//  */
// function extractTimestamp(text) {
//     const datePatterns = [
//         /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
//         /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/gi,
//         /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
//         /(\d{1,2}\s+\w+\s+\d{4},?\s+\d{1,2}:\d{2}\s*(?:am|pm)?)/gi
//     ];

//     for (const pattern of datePatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             console.log(`✅ Found Timestamp: ${matches[0]}`);
//             return matches[0];
//         }
//     }
    
//     return null;
// }

// /**
//  * Extract payment status from text
//  */
// function extractPaymentStatus(text) {
//     for (const indicator of PAYMENT_INDICATORS.success) {
//         if (text.includes(indicator)) {
//             console.log(`✅ Payment Status: Success (found "${indicator}")`);
//             return 'success';
//         }
//     }
    
//     for (const indicator of PAYMENT_INDICATORS.failure) {
//         if (text.includes(indicator)) {
//             console.log(`❌ Payment Status: Failed (found "${indicator}")`);
//             return 'failed';
//         }
//     }
    
//     console.log('⚠️ Payment Status: Unknown');
//     return 'unknown';
// }

// /**
//  * Extract bank name from text
//  */
// function extractBankName(text) {
//     const banks = [
//         { name: 'sbi', patterns: ['sbi', 'state bank'] },
//         { name: 'hdfc', patterns: ['hdfc', 'hdfc bank'] },
//         { name: 'icici', patterns: ['icici', 'icici bank'] },
//         { name: 'axis', patterns: ['axis', 'axis bank'] },
//         { name: 'pnb', patterns: ['pnb', 'punjab national bank'] },
//         { name: 'kotak', patterns: ['kotak', 'kotak mahindra'] }
//     ];

//     for (const bank of banks) {
//         for (const pattern of bank.patterns) {
//             if (text.includes(pattern)) {
//                 console.log(`🏦 Bank Detected: ${bank.name}`);
//                 return bank.name;
//             }
//         }
//     }
    
//     return null;
// }

// /**
//  * Extract app name from text
//  */
// function extractAppName(text) {
//     const apps = {
//         'gpay': ['gpay', 'google pay', 'googlepay'],
//         'phonepe': ['phonepe', 'phone pe'],
//         'paytm': ['paytm'],
//         'bhim': ['bhim', 'bhim upi'],
//         'amazonpay': ['amazon pay', 'amazonpay']
//     };

//     for (const [appName, keywords] of Object.entries(apps)) {
//         if (keywords.some(keyword => text.includes(keyword))) {
//             console.log(`📱 App Detected: ${appName}`);
//             return appName;
//         }
//     }
    
//     return null;
// }

// /**
//  * Find and validate payment against orders - ENHANCED MATCHING
//  */
// async function findAndValidatePayment(ocrResult, pendingOrders) {
//     const validation = {
//         isValid: false,
//         confidence: 0,
//         matchedOrder: null,
//         details: {},
//         errors: [],
//         warnings: [],
//         autoVerifiable: true,
//         matchQuality: 'none'
//     };

//     const extractedAmount = ocrResult.analysis.amount;
//     const extractedUPI = ocrResult.analysis.upiId;
//     const paymentStatus = ocrResult.analysis.status;

//     console.log('🔍 Starting Payment Validation:', {
//         extractedAmount,
//         extractedUPI,
//         paymentStatus,
//         pendingOrdersCount: pendingOrders.length
//     });

//     // If no pending orders
//     if (pendingOrders.length === 0) {
//         validation.errors.push('❌ No pending orders found. You may have already paid or your order is processed.');
//         return validation;
//     }

//     // Validate payment status
//     if (paymentStatus !== 'success') {
//         validation.errors.push('❌ Payment status not successful');
//         validation.autoVerifiable = false;
//     }

//     // If no amount detected
//     if (!extractedAmount) {
//         validation.errors.push('❌ Could not detect payment amount in screenshot');
//         validation.warnings.push('💡 Please ensure the payment amount (₹) is clearly visible');
//         validation.autoVerifiable = false;
//         return validation;
//     }

//     console.log(`💰 Looking for order matching amount: ₹${extractedAmount}`);
    
//     // Find matching order by amount with enhanced matching
//     let matchedOrder = null;
//     let matchType = 'none';
//     let amountDifference = Infinity;
//     let matchScore = 0;
    
//     for (const order of pendingOrders) {
//         const orderAmount = order.totalPrice;
//         const diff = Math.abs(extractedAmount - orderAmount);
        
//         // Calculate match score
//         let score = 0;
//         let type = 'none';
        
//         if (diff === 0) {
//             score = 100;
//             type = 'exact';
//         } else if (diff <= VALIDATION_CONFIG.amountTolerance) {
//             score = 90 - (diff * 5);
//             type = 'close';
//         } else if (diff <= 10) {
//             score = 70 - diff;
//             type = 'near';
//         } else if (diff <= 20) {
//             score = 50 - diff/2;
//             type = 'far';
//         }
        
//         console.log(`   Order ${order.orderNumber}: ₹${orderAmount}, Diff: ₹${diff}, Score: ${score}, Type: ${type}`);
        
//         if (score > matchScore) {
//             matchedOrder = order;
//             matchType = type;
//             amountDifference = diff;
//             matchScore = score;
            
//             if (type === 'exact') break;
//         }
//     }

//     if (!matchedOrder) {
//         const errorMsg = `❌ No matching order found for payment of ₹${extractedAmount}`;
//         validation.errors.push(errorMsg);
        
//         // Show user their pending orders
//         if (pendingOrders.length > 0) {
//             validation.warnings.push(`📋 *Your pending orders:*`);
//             pendingOrders.slice(0, 3).forEach(order => {
//                 const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
//                 validation.warnings.push(`   • ${order.orderNumber}: ${productNames} - ₹${order.totalPrice}`);
//             });
//         }
        
//         return validation;
//     }

//     validation.matchedOrder = matchedOrder;
//     validation.matchQuality = matchType;
    
//     // Get product details
//     const productNames = matchedOrder.items?.map(item => item.productName).join(', ') || 'Product';
//     console.log(`✅ Matched Order: ${matchedOrder.orderNumber}, Amount: ₹${matchedOrder.totalPrice}, Match Type: ${matchType}`);

//     validation.matchedOrder.productDetails = {
//         names: productNames,
//         items: matchedOrder.items || []
//     };

//     // Validate UPI ID
//     const upiValidation = validateUPIId(extractedUPI);
//     validation.details.upi = upiValidation;
    
//     if (!upiValidation.isValid) {
//         if (!extractedUPI) {
//             validation.errors.push(`❌ UPI ID not found in screenshot`);
//             validation.warnings.push(`💡 Please ensure receiver UPI ID is visible: ${VALID_UPI_IDS[0]}`);
//         } else {
//             validation.errors.push(`❌ Invalid UPI ID: ${extractedUPI}`);
//             validation.warnings.push(`💡 Please pay to our official UPI: ${VALID_UPI_IDS[0]}`);
//         }
//         validation.autoVerifiable = false;
//     }

//     // Validate amount
//     const amountValidation = {
//         isValid: amountDifference <= VALIDATION_CONFIG.amountTolerance,
//         expected: matchedOrder.totalPrice,
//         found: extractedAmount,
//         difference: amountDifference,
//         matchType: matchType
//     };
    
//     validation.details.amount = amountValidation;
    
//     if (!amountValidation.isValid) {
//         validation.errors.push(`❌ Amount mismatch: Paid ₹${extractedAmount}, Expected ₹${matchedOrder.totalPrice}`);
//     }

//     // Calculate confidence score
//     validation.confidence = calculateConfidenceScore(validation);
    
//     // Determine if payment is valid
//     validation.isValid = 
//         validation.errors.length === 0 && 
//         validation.confidence >= VALIDATION_CONFIG.minConfidenceScore &&
//         paymentStatus === 'success' &&
//         amountValidation.isValid &&
//         upiValidation.isValid;

//     console.log(`📊 Final Validation:`, {
//         isValid: validation.isValid,
//         confidence: validation.confidence,
//         matchType: matchType,
//         errors: validation.errors.length
//     });

//     return validation;
// }

// /**
//  * Enhanced UPI ID validation
//  */
// function validateUPIId(extractedUPI) {
//     if (!extractedUPI) {
//         return { isValid: false, found: 'Not found' };
//     }

//     const cleanExtracted = extractedUPI.toLowerCase().trim();
    
//     for (const validUPI of VALID_UPI_IDS) {
//         const cleanValid = validUPI.toLowerCase();
        
//         // Exact match
//         if (cleanExtracted === cleanValid) {
//             return { 
//                 isValid: true, 
//                 found: validUPI, 
//                 extracted: extractedUPI,
//                 matchType: 'exact'
//             };
//         }
        
//         // Contains match
//         if (cleanExtracted.includes(cleanValid) || cleanValid.includes(cleanExtracted)) {
//             return { 
//                 isValid: true, 
//                 found: validUPI, 
//                 extracted: extractedUPI,
//                 matchType: 'contains'
//             };
//         }
        
//         // Partial match for our IDs
//         if (cleanExtracted.includes('subaask21') || cleanExtracted.includes('posterpro.store')) {
//             return { 
//                 isValid: true, 
//                 found: validUPI, 
//                 extracted: extractedUPI,
//                 matchType: 'partial'
//             };
//         }
//     }

//     return { isValid: false, found: extractedUPI };
// }

// /**
//  * Calculate confidence score
//  */
// function calculateConfidenceScore(validation) {
//     let score = 0;

//     // Amount match score
//     switch (validation.matchQuality) {
//         case 'exact': score += 50; break;
//         case 'close': score += 40; break;
//         case 'near': score += 30; break;
//         case 'far': score += 20; break;
//         default: score += 10;
//     }
    
//     // UPI validation score
//     if (validation.details.upi?.isValid) {
//         switch (validation.details.upi.matchType) {
//             case 'exact': score += 30; break;
//             case 'contains': score += 25; break;
//             case 'partial': score += 20; break;
//             default: score += 15;
//         }
//     }
    
//     // Penalties
//     if (validation.errors.length > 0) {
//         score -= validation.errors.length * 15;
//     }

//     return Math.max(0, Math.min(100, Math.round(score)));
// }

// /**
//  * Process successful verification
//  */
// async function processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone, imageHash) {
//     try {
//         const order = verificationResult.matchedOrder;
//         const productNames = verificationResult.matchedOrder.productDetails?.names || 'Product';
        
//         console.log(`✅ Processing successful verification for order: ${order.orderNumber}`);

//         // Create payment verification record
//         const paymentVerification = await apiService.createPaymentVerification({
//             orderNumber: order.orderNumber,
//             customerPhone: customerPhone,
//             orderReference: order._id,
//             orderDetails: {
//                 totalAmount: order.totalPrice,
//                 items: order.items,
//                 productNames: productNames,
//                 shippingAddress: order.shippingAddress,
//                 pincode: order.pincode,
//                 customerName: order.customerName
//             },
//             paymentProof: {
//                 imageData: imageData.substring(0, 10000),
//                 mimeType: 'image/jpeg',
//                 imageHash: imageHash
//             },
//             ocrAnalysis: {
//                 extractedText: ocrResult.text.substring(0, 500),
//                 confidenceScore: ocrResult.confidence,
//                 extractedAmount: ocrResult.analysis.amount,
//                 extractedUPI: ocrResult.analysis.upiId,
//                 transactionId: ocrResult.analysis.transactionId,
//                 timestamp: ocrResult.analysis.timestamp
//             },
//             detectedPayment: {
//                 amount: ocrResult.analysis.amount,
//                 upiId: ocrResult.analysis.upiId,
//                 transactionId: ocrResult.analysis.transactionId,
//                 transactionTime: new Date(),
//                 status: 'success',
//                 appName: ocrResult.analysis.appName,
//                 bankName: ocrResult.analysis.bankName
//             },
//             validationResults: {
//                 amountMatch: verificationResult.details.amount?.isValid,
//                 upiMatch: verificationResult.details.upi?.isValid,
//                 confidenceScore: verificationResult.confidence,
//                 matchQuality: verificationResult.matchQuality
//             },
//             status: 'verified',
//             verifiedBy: 'auto_ocr',
//             verifiedAt: new Date()
//         });

//         if (!paymentVerification) {
//             throw new Error('Failed to create payment verification record');
//         }

//         console.log('✅ Payment verification record created:', paymentVerification._id);

//         // Update order status - CRITICAL: This sets payment to 'paid'
//         try {
//             await apiService.updateOrderStatus(order._id, 'confirmed', 'Payment verified automatically');
            
//             // Update payment status to 'paid'
//             await apiService.updateOrderPaymentStatus(order.orderNumber, {
//                 paymentStatus: 'paid',
//                 paidAmount: order.totalPrice,
//                 transactionId: ocrResult.analysis.transactionId,
//                 paymentMethod: 'upi',
//                 verifiedAt: new Date(),
//                 verificationId: paymentVerification._id
//             });
            
//             console.log(`✅ Order ${order.orderNumber} payment status updated to PAID`);
//         } catch (updateError) {
//             console.error('⚠️ Order status update failed:', updateError.message);
//         }

//         // Store verification state
//         verificationState.set(customerPhone, {
//             verified: true,
//             orderId: order._id,
//             orderNumber: order.orderNumber,
//             amount: order.totalPrice,
//             productName: productNames,
//             items: order.items,
//             customerName: order.customerName,
//             timestamp: Date.now(),
//             verificationId: paymentVerification._id
//         });

//         // Store order details
//         userOrderState.set(customerPhone, {
//             orderNumber: order.orderNumber,
//             productName: productNames,
//             items: order.items,
//             amount: order.totalPrice,
//             customerName: order.customerName
//         });

//         // Send success messages
//         await sendSuccessMessages(order, verificationResult, originalMessage, productNames);

//         // Send notification to admin
//         await sendAdminNotification(order, customerPhone, verificationResult.confidence);

//         // Generate and send invoice
//         await generateAndSendInvoice(order, originalMessage);

//         console.log(`🎉 Payment verification completed successfully for ${productNames}`);

//     } catch (error) {
//         console.error('Successful verification processing error:', error);
//         await originalMessage.reply(
//             '✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n' +
//             'Your payment has been verified. Our team will process your order shortly.\n\n' +
//             'If you have any questions, please contact support.'
//         );
//     }
// }

// /**
//  * Generate and send invoice
//  */
// async function generateAndSendInvoice(order, message) {
//     try {
//         console.log(`📄 Generating invoice for order: ${order.orderNumber}`);
        
//         // Format items for invoice
//         const items = order.items?.map(item => ({
//             name: item.productName,
//             quantity: item.quantity,
//             price: item.price,
//             total: item.price * item.quantity
//         })) || [];

//         const subtotal = items.reduce((sum, item) => sum + item.total, 0);
//         const gst = order.totalGst || 0;
//         const total = order.totalPrice || subtotal + gst;

//         // Create invoice text
//         let invoiceText = 
//             `🧾 *INVOICE - Order #${order.orderNumber}*\n` +
//             `═══════════════════════\n\n` +
//             `👤 *Customer:* ${order.customerName || 'Valued Customer'}\n` +
//             `📱 *Phone:* ${order.phoneNumber || 'N/A'}\n` +
//             `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
//             `*Items:*\n`;

//         items.forEach((item, index) => {
//             invoiceText += `${index + 1}. ${item.name}\n`;
//             invoiceText += `   Qty: ${item.quantity} x ₹${item.price} = ₹${item.total}\n`;
//         });

//         invoiceText += 
//             `\n*Summary:*\n` +
//             `📦 Subtotal: ₹${subtotal}\n`;

//         if (gst > 0) {
//             invoiceText += `💵 GST: ₹${gst}\n`;
//         }

//         invoiceText += 
//             `💰 *Total: ₹${total}*\n\n` +
//             `*Payment Details:*\n` +
//             `✅ Status: Paid\n` +
//             `💳 Method: UPI\n` +
//             `⏱️ Time: ${new Date().toLocaleString('en-IN')}\n` +
//             `🔢 Transaction ID: ${order.transactionId || 'N/A'}\n\n` +
//             `*Delivery Address:*\n` +
//             `${typeof order.shippingAddress === 'object' ? 
//                 `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}` : 
//                 order.shippingAddress || 'Address provided in order'}\n\n` +
//             `Thank you for shopping with us! 🎉\n` +
//             `_For any queries, reply to this message_`;

//         await message.reply(invoiceText);
//         console.log(`✅ Invoice sent for order: ${order.orderNumber}`);

//     } catch (error) {
//         console.error('❌ Invoice generation error:', error);
//     }
// }

// /**
//  * Send success messages to customer
//  */
// async function sendSuccessMessages(order, verificationResult, message, productNames) {
//     const confidence = Math.round(verificationResult.confidence);
    
//     // Build order items text
//     let orderItemsText = '';
//     if (order.items && order.items.length > 0) {
//         orderItemsText = `📝 *Order Items:*\n`;
//         order.items.forEach(item => {
//             const itemTotal = (item.price || 0) * (item.quantity || 1);
//             const productName = item.productName || 'Product';
//             orderItemsText += `• ${productName} x ${item.quantity || 1} - ₹${itemTotal}\n`;
//         });
//     }

//     let successMessage = 
//         `✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n` +
//         `🧾 *Order Number:* ${order.orderNumber}\n` +
//         `👤 *Customer:* ${order.customerName || 'Valued Customer'}\n` +
//         `📦 *Product:* ${productNames}\n` +
//         `💰 *Amount Paid:* ₹${order.totalPrice}\n` +
//         `🎯 *Verification Score:* ${confidence}%\n` +
//         `🔢 *Transaction ID:* ${order.transactionId || verificationResult.details.transactionId || 'N/A'}\n` +
//         `📊 *Status:* Order Confirmed & Processing\n\n` +
//         orderItemsText +
//         `\n*What Happens Next:*\n` +
//         `• Order processing: 24-48 hours\n` +
//         `• Quality check & packaging\n` +
//         `• Shipping confirmation with tracking\n` +
//         `• Delivery: 3-5 business days\n\n` +
//         `📞 *Need Help?* Reply to this message\n\n` +
//         `🎉 *THANK YOU FOR YOUR PURCHASE!*`;

//     await message.reply(successMessage);
// }

// /**
//  * Send admin notification
//  */
// async function sendAdminNotification(order, customerPhone, confidence) {
//     try {
//         await notificationManager.sendNotification('PAYMENT_VERIFIED', {
//             title: '✅ Payment Verified',
//             body: `Payment of ₹${order.totalPrice} verified for order ${order.orderNumber}`,
//             data: {
//                 orderNumber: order.orderNumber,
//                 customerName: order.customerName,
//                 customerPhone: customerPhone,
//                 amount: order.totalPrice,
//                 product: order.items?.[0]?.productName,
//                 confidence: confidence,
//                 timestamp: new Date().toISOString()
//             }
//         });
//     } catch (error) {
//         console.warn('⚠️ Admin notification failed:', error.message);
//     }
// }

// /**
//  * Handle failed verification
//  */
// async function handleFailedVerification(verificationResult, client, originalMessage) {
//     const order = verificationResult.matchedOrder;
    
//     let errorMessage = `❌ *PAYMENT VERIFICATION FAILED*\n\n`;
    
//     errorMessage += `*Verification Score:* ${Math.round(verificationResult.confidence)}%\n`;
//     errorMessage += `*Minimum Required:* ${VALIDATION_CONFIG.minConfidenceScore}%\n\n`;
    
//     if (verificationResult.errors.length > 0) {
//         errorMessage += `*Issues Found:*\n${verificationResult.errors.join('\n')}\n\n`;
//     }

//     if (verificationResult.warnings.length > 0) {
//         errorMessage += `*Suggestions:*\n${verificationResult.warnings.join('\n')}\n\n`;
//     }

//     if (order) {
//         const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
//         errorMessage += `*Your Order Details:*\n` +
//             `📦 Order: ${order.orderNumber}\n` +
//             `📦 Product: ${productNames}\n` +
//             `💰 Amount Due: ₹${order.totalPrice}\n\n`;
//     }

//     errorMessage += `*How to Fix:*\n` +
//         `1. Pay exactly ₹${order?.totalPrice || 'the order amount'}\n` +
//         `2. Use our UPI: ${VALID_UPI_IDS[0]}\n` +
//         `3. Ensure payment shows "SUCCESSFUL"\n` +
//         `4. Send clear screenshot immediately\n` +
//         `5. Screenshot must be within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes of payment\n\n` +
//         `Try again with correct payment details.`;

//     await originalMessage.reply(errorMessage);
// }

// // ========== HELPER FUNCTIONS ==========

// async function sendOldPaymentMessage(message, timeValidation) {
//     await message.reply(
//         `❌ *OLD PAYMENT SCREENSHOT*\n\n` +
//         `This payment screenshot is too old.\n\n` +
//         `*Details:*\n` +
//         `• Detected: ${timeValidation.detectedTime || 'Unknown'}\n` +
//         `• Current: ${timeValidation.currentTime || 'Unknown'}\n` +
//         `• Difference: ${timeValidation.reason}\n\n` +
//         `*Please send a recent screenshot:*\n` +
//         `✅ Make payment now\n` +
//         `✅ Take screenshot immediately\n` +
//         `✅ Send within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes`
//     );
// }

// async function sendAlreadyVerifiedMessage(message, state) {
//     const productName = state.productName || 'your product';
    
//     await message.reply(
//         `✅ *ORDER ALREADY VERIFIED!*\n\n` +
//         `Your order *${state.orderNumber}* for *${productName}* is already verified and being processed.\n\n` +
//         `💰 Amount Paid: ₹${state.amount}\n` +
//         `📦 Status: Processing\n\n` +
//         `_To place a new order, send *!menu*_`
//     );
// }

// function validateImage(media) {
//     const base64Length = media.data.length;
//     const fileSizeInBytes = (base64Length * 3) / 4;
    
//     if (fileSizeInBytes > VALIDATION_CONFIG.maxImageSize) {
//         return {
//             isValid: false,
//             reason: `Image too large (${(fileSizeInBytes / 1024 / 1024).toFixed(1)}MB). Max size: 5MB`
//         };
//     }

//     const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     if (!validMimeTypes.includes(media.mimetype)) {
//         return {
//             isValid: false,
//             reason: `Invalid format (${media.mimetype}). Please send JPEG, PNG, or WebP`
//         };
//     }

//     return { isValid: true };
// }

// async function sendNoPendingOrdersMessage(message, customerPhone) {
//     await message.reply(
//         '❌ *No Pending Orders Found*\n\n' +
//         `We couldn't find any pending orders for phone *${customerPhone}*.\n\n` +
//         '*Possible reasons:*\n' +
//         '1. You have already paid and order is processed\n' +
//         '2. Order was cancelled\n' +
//         '3. You haven\'t placed an order yet\n\n' +
//         '*What to do:*\n' +
//         '• Type *Order* to place a new order\n' +
//         '• Type *MyOrders* to check order status\n' +
//         '• Contact support if you need help\n\n' +
//         'Send *!menu* to see available products.'
//     );
// }

// async function sendErrorMessage(message, errorText) {
//     await message.reply(errorText);
// }

// async function sendInvalidImageMessage(message, reason) {
//     await message.reply(
//         `❌ *Invalid Image*\n\n` +
//         `${reason}\n\n` +
//         `*Please send:*\n` +
//         `• Clear, high-quality screenshot\n` +
//         `• JPEG, PNG, or WebP format\n` +
//         `• File size under 5MB`
//     );
// }

// async function sendInvalidPaymentScreenshotMessage(message, validation) {
//     await message.reply(
//         `❌ *Not a Payment Screenshot*\n\n` +
//         `This doesn't appear to be a UPI payment screenshot.\n\n` +
//         `*Detected:* ${validation.reason}\n` +
//         `*Confidence:* ${validation.confidence}%\n` +
//         `*Minimum:* 50%\n\n` +
//         `*Please send a proper payment screenshot showing:*\n` +
//         `✅ Payment amount\n` +
//         `✅ Our UPI ID (${VALID_UPI_IDS[0]})\n` +
//         `✅ "Payment Successful" message\n` +
//         `✅ Transaction ID\n` +
//         `✅ Date and Time`
//     );
// }

// async function sendUnreadableScreenshotMessage(message, ocrResult) {
//     await message.reply(
//         `❌ *Cannot Read Screenshot*\n\n` +
//         `The image is too blurry or has insufficient text.\n\n` +
//         `*OCR Analysis:*\n` +
//         `• Text: ${ocrResult.text.length} characters\n` +
//         `• Confidence: ${Math.round(ocrResult.confidence)}%\n` +
//         `• Words: ${ocrResult.wordCount}\n\n` +
//         `*Please ensure:*\n` +
//         `✅ Screenshot is clear and sharp\n` +
//         `✅ All transaction text is visible\n` +
//         `✅ Text is not too small\n\n` +
//         `Take a better screenshot and try again.`
//     );
// }

// async function showPaymentInstructions(message, client) {
//     await message.reply(
//         `📋 *HOW TO PAY & VERIFY*\n\n` +
//         `*Step 1 - Make Payment:*\n` +
//         `1. Open UPI app (GPay, PhonePe, PayTM)\n` +
//         `2. Send ₹[Your Order Amount] to: ${VALID_UPI_IDS[0]}\n` +
//         `3. Ensure payment shows "SUCCESSFUL"\n\n` +
//         `*Step 2 - Send Screenshot:*\n` +
//         `1. Take clear screenshot\n` +
//         `2. Ensure visible:\n` +
//         `   • Amount\n` +
//         `   • Status: "SUCCESSFUL"\n` +
//         `   • To: ${VALID_UPI_IDS[0]}\n` +
//         `   • Transaction ID\n` +
//         `   • Date & Time\n\n` +
//         `*Step 3 - Automatic Verification:*\n` +
//         `• We'll verify within seconds\n` +
//         `• Payment must be recent (${VALIDATION_CONFIG.recentPaymentThreshold} minutes)\n` +
//         `• You'll receive confirmation\n` +
//         `• Order will be processed immediately`
//     );
// }

// async function showVerificationHelp(message, client) {
//     await message.reply(
//         `🔒 *PAYMENT VERIFICATION*\n\n` +
//         `*For Customers:*\n` +
//         `Send UPI payment screenshot after payment\n` +
//         `• Payment must be within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n` +
//         `• Screenshot must be clear and readable\n\n` +
//         `*Admin Commands:*\n` +
//         `• !verify ORDER_NUMBER - Manual verification\n` +
//         `• !reject ORDER_NUMBER REASON - Reject payment\n` +
//         `• !pending - Show pending verifications\n` +
//         `• !invoice ORDER_NUMBER - Generate invoice\n` +
//         `• !fraud ORDER_NUMBER REASONS - Mark as fraud\n` +
//         `• !stats - Show verification statistics\n` +
//         `• !testocr - Test OCR on an image\n` +
//         `• !paymenthelp - Payment instructions\n` +
//         `• !menu - Start new order\n` +
//         `• !clear - Clear verification state`
//     );
// }

// // ========== ADMIN COMMANDS HANDLER ==========

// async function handleAdminCommands(message, client, userMessage) {
//     try {
//         if (userMessage.startsWith('!verify ')) {
//             await verifyPaymentCommand(message, client);
//             return true;
//         }
//         else if (userMessage.startsWith('!reject ')) {
//             await rejectPaymentCommand(message, client);
//             return true;
//         }
//         else if (userMessage.startsWith('!pending')) {
//             await showPendingVerifications(message, client);
//             return true;
//         }
//         else if (userMessage.startsWith('!invoice ')) {
//             await generateInvoiceCommand(message, client);
//             return true;
//         }
//         else if (userMessage.startsWith('!fraud ')) {
//             await markAsFraudCommand(message, client);
//             return true;
//         }
//         else if (userMessage === '!stats') {
//             await showVerificationStats(message, client);
//             return true;
//         }
//         else if (userMessage === '!testocr') {
//             await testOCRCommand(message, client);
//             return true;
//         }
        
//         return false;
//     } catch (error) {
//         console.error('Admin command error:', error);
//         await message.reply('❌ Admin command failed.');
//         return true;
//     }
// }

// async function verifyPaymentCommand(message, client) {
//     try {
//         const parts = message.body.split(' ');
//         if (parts.length < 2) {
//             return await message.reply('❌ Usage: !verify ORDER_NUMBER');
//         }

//         const orderNumber = parts[1];
//         const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
//         if (!verification) {
//             return await message.reply(`❌ No payment verification found for order: ${orderNumber}`);
//         }

//         await apiService.updatePaymentVerificationStatus(verification._id, {
//             status: 'verified',
//             verifiedBy: 'admin_manual',
//             verifiedAt: new Date()
//         });

//         // Update order status
//         await apiService.updateOrderStatus(verification.orderReference, 'confirmed', 'Payment manually verified');
//         await apiService.updateOrderPaymentStatus(orderNumber, {
//             paymentStatus: 'paid',
//             paymentVerified: true,
//             verifiedBy: 'admin',
//             transactionId: verification.detectedPayment?.transactionId
//         });

//         await message.reply(`✅ Payment manually verified for order: ${orderNumber}`);
        
//     } catch (error) {
//         console.error('Verify command error:', error);
//         await message.reply('❌ Failed to verify payment.');
//     }
// }

// async function rejectPaymentCommand(message, client) {
//     try {
//         const parts = message.body.split(' ');
//         if (parts.length < 3) {
//             return await message.reply('❌ Usage: !reject ORDER_NUMBER REASON');
//         }

//         const orderNumber = parts[1];
//         const reason = parts.slice(2).join(' ');
//         const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
//         if (!verification) {
//             return await message.reply(`❌ No payment verification found for order: ${orderNumber}`);
//         }

//         await apiService.rejectPaymentVerification(verification._id, reason, 'admin');

//         await message.reply(`❌ Payment rejected for order: ${orderNumber}\nReason: ${reason}`);
        
//     } catch (error) {
//         console.error('Reject command error:', error);
//         await message.reply('❌ Failed to reject payment.');
//     }
// }

// async function markAsFraudCommand(message, client) {
//     try {
//         const parts = message.body.split(' ');
//         if (parts.length < 3) {
//             return await message.reply('❌ Usage: !fraud ORDER_NUMBER REASONS');
//         }

//         const orderNumber = parts[1];
//         const reasons = parts.slice(2).join(' ');
//         const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
//         if (!verification) {
//             return await message.reply(`❌ No payment verification found for order: ${orderNumber}`);
//         }

//         await apiService.markPaymentAsFraud(verification._id, reasons.split(',').map(r => r.trim()), 'admin');

//         await message.reply(`🚨 Payment marked as fraud for order: ${orderNumber}\nReasons: ${reasons}`);
        
//     } catch (error) {
//         console.error('Fraud command error:', error);
//         await message.reply('❌ Failed to mark payment as fraud.');
//     }
// }

// async function showPendingVerifications(message, client) {
//     try {
//         const pendingVerifications = await apiService.getPendingPaymentVerifications();
        
//         if (pendingVerifications.length === 0) {
//             return await message.reply('✅ No pending payment verifications.');
//         }

//         let response = `📋 *PENDING PAYMENTS (${pendingVerifications.length})*\n\n`;
        
//         pendingVerifications.forEach((verification, index) => {
//             response += `${index + 1}. *Order:* ${verification.orderNumber}\n`;
//             response += `   *Customer:* ${verification.orderDetails?.customerName || 'Unknown'}\n`;
//             response += `   *Phone:* ${verification.customerPhone}\n`;
//             response += `   *Amount:* ₹${verification.orderDetails?.totalAmount || 'N/A'}\n`;
//             response += `   *Products:* ${verification.orderDetails?.productNames || 'N/A'}\n`;
//             response += `   *Submitted:* ${new Date(verification.createdAt).toLocaleString()}\n`;
//             response += `   *Verify:* !verify ${verification.orderNumber}\n`;
//             response += `   *Reject:* !reject ${verification.orderNumber} reason\n\n`;
//         });

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Pending verifications error:', error);
//         await message.reply('❌ Failed to fetch pending verifications.');
//     }
// }

// async function generateInvoiceCommand(message, client) {
//     try {
//         const parts = message.body.split(' ');
//         if (parts.length < 2) {
//             return await message.reply('❌ Usage: !invoice ORDER_NUMBER');
//         }

//         const orderNumber = parts[1];
//         const order = await apiService.getOrderByNumber(orderNumber);
        
//         if (!order) {
//             return await message.reply(`❌ No order found with number: ${orderNumber}`);
//         }

//         // Generate invoice
//         await generateAndSendInvoice(order, message);

//     } catch (error) {
//         console.error('Invoice command error:', error);
//         await message.reply('❌ Failed to generate invoice.');
//     }
// }

// async function showVerificationStats(message, client) {
//     try {
//         const stats = await apiService.getPaymentVerificationStats('week');
        
//         const response = 
//             `📊 *VERIFICATION STATISTICS*\n\n` +
//             `✅ Verified: ${stats.verified || 0}\n` +
//             `⏳ Pending: ${stats.pending || 0}\n` +
//             `❌ Rejected: ${stats.rejected || 0}\n` +
//             `🚨 Fraud: ${stats.fraud || 0}\n` +
//             `🤖 Auto: ${stats.autoVerified || 0}\n` +
//             `👤 Manual: ${stats.manualVerified || 0}\n` +
//             `📊 Success Rate: ${stats.successRate || 0}%\n` +
//             `📝 Total: ${stats.total || 0}`;

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Stats command error:', error);
//         await message.reply('❌ Failed to fetch verification statistics.');
//     }
// }

// async function testOCRCommand(message, client) {
//     try {
//         if (!message.hasMedia) {
//             return await message.reply('❌ Please send an image with !testocr command');
//         }

//         const media = await message.downloadMedia();
//         const ocrResult = await performDetailedOCRAnalysis(media.data);
        
//         let response = `🔍 *OCR TEST RESULTS*\n\n`;
//         response += `*Confidence:* ${Math.round(ocrResult.confidence)}%\n`;
//         response += `*Characters:* ${ocrResult.text.length}\n`;
//         response += `*Words:* ${ocrResult.wordCount}\n`;
//         response += `*Readable:* ${ocrResult.isReadable ? '✅' : '❌'}\n\n`;
//         response += `*Extracted Amount:* ₹${ocrResult.analysis.amount || 'Not found'}\n`;
//         response += `*UPI ID:* ${ocrResult.analysis.upiId || 'Not found'}\n`;
//         response += `*Transaction ID:* ${ocrResult.analysis.transactionId || 'Not found'}\n`;
//         response += `*Status:* ${ocrResult.analysis.status}\n`;
//         response += `*App:* ${ocrResult.analysis.appName || 'Not found'}\n`;
//         response += `*Timestamp:* ${ocrResult.analysis.timestamp || 'Not found'}\n\n`;
//         response += `*Time Detection:*\n`;
        
//         const detectedTime = extractExactTime(ocrResult.text);
//         if (detectedTime) {
//             response += `Detected: ${detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
//             response += `Current: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
//             response += `Difference: ${Math.round(Math.abs(new Date() - detectedTime) / (1000 * 60))} minutes\n`;
//         } else {
//             response += `No time detected\n`;
//         }
        
//         response += `\n*First 300 chars:*\n${ocrResult.text.substring(0, 300)}`;

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Test OCR error:', error);
//         await message.reply('❌ OCR test failed.');
//     }
// }

// // Cleanup function
// export function cleanupVerificationState() {
//     const now = Date.now();
//     const twoHours = 2 * 60 * 60 * 1000;
    
//     for (const [phone, data] of verificationState.entries()) {
//         if (now - data.timestamp > twoHours) {
//             verificationState.delete(phone);
//             userOrderState.delete(phone);
//         }
//     }
    
//     // Cleanup image hash cache
//     for (const [hash, timestamp] of imageHashCache.entries()) {
//         if (now - timestamp > 24 * 60 * 60 * 1000) { // 24 hours
//             imageHashCache.delete(hash);
//         }
//     }
// }

// // Get user verification state
// export function getUserVerificationState(phone) {
//     return verificationState.get(phone);
// }

// // Check if user is verified
// export function isUserVerified(phone) {
//     const state = verificationState.get(phone);
//     return state ? state.verified : false;
// }

// export default handlePaymentVerification;




// handlers/paymentVerificationHandler.js - ENHANCED PROFESSIONAL VERSION
import apiService from "../../services/apiService.js";
import notificationManager from "../../services/notifications/notification-manager.js";
import pkg from 'whatsapp-web.js';
import Tesseract from 'tesseract.js';
import crypto from 'crypto';
import CompanyConfig from '../../shared/companyConfig.js';
import invoiceGenerator from './invoiceGenerator.js'; // ✅ ADD THIS IMPORT

const { MessageMedia } = pkg;

// Dynamic UPI IDs from database
let VALID_UPI_IDS = [];

// Default fallback UPI IDs (used only if API fails)
const DEFAULT_UPI_IDS = [
    'subaask21@oksbi',
    'posterpro.store@okaxis',
    'posterpro.store@paytm',
    'posterpro.store@axl',
    'posterpro.store@ybl'
];

/**
 * Initialize UPI IDs from database via API
 */
async function initializeUpiIds() {
    try {
        console.log('🔄 [PaymentVerification] Loading UPI IDs from database...');
        const activeUpiIds = await CompanyConfig.getActiveUpiIds();
        
        if (activeUpiIds && activeUpiIds.length > 0) {
            VALID_UPI_IDS = activeUpiIds;
            console.log('✅ [PaymentVerification] Loaded UPI IDs:', VALID_UPI_IDS.join(', '));
        } else {
            console.warn('⚠️ [PaymentVerification] No active UPI IDs found, using defaults');
            VALID_UPI_IDS = [...DEFAULT_UPI_IDS];
        }
    } catch (error) {
        console.error('❌ [PaymentVerification] Failed to load UPI IDs:', error.message);
        VALID_UPI_IDS = [...DEFAULT_UPI_IDS];
    }
}

// Initialize immediately
initializeUpiIds();

// Auto-refresh every 5 minutes
setInterval(async () => {
    console.log('⏰ [PaymentVerification] Auto-refreshing UPI IDs...');
    await initializeUpiIds();
}, 5 * 60 * 1000);

const VALIDATION_CONFIG = {
    amountTolerance: 2, // ₹2 tolerance for exact matching
    minConfidenceScore: 85, // Minimum confidence for auto-verification
    minTextLength: 20,
    requiredPaymentIndicators: 4,
    maxImageSize: 5 * 1024 * 1024,
    recentPaymentThreshold: 15, // 15 minutes window
    duplicateWindow: 5 * 60 * 1000, // 5 minutes
    ocrEngine: {
        language: 'eng',
        oem: 3,
        psm: 6,
        tessedit_char_whitelist: '0123456789₹Rs.INRabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@-: /,()',
        preserve_interword_spaces: '1'
    }
};

const PAYMENT_INDICATORS = {
    success: [
        'successful', 'completed', 'paid', 'sent', 'transferred', 'payment done', 
        'success', 'approved', 'payment successful', 'money sent', 'transaction successful',
        'paid successfully', 'payment completed', 'successfully paid', 'done'
    ],
    failure: [
        'failed', 'rejected', 'cancelled', 'declined', 'error', 'unsuccessful', 
        'payment failed', 'transaction failed', 'insufficient', 'declined'
    ],
    amount: [
        'amount', 'rs', '₹', 'inr', 'rupees', 'total', 'money', 'sent', 'paid', 'pay',
        'payment of', 'of ₹', 'amount paid', 'total amount', 'paid amount'
    ],
    transaction: [
        'transaction', 'payment', 'upi', 'reference', 'id', 'utr', 'ref', 'txn', 
        'transaction id', 'reference no', 'utr no', 'transaction ref'
    ],
    apps: [
        'gpay', 'phonepe', 'paytm', 'bhim', 'bank', 'upi', 'google pay',
        'googlepay', 'phone pe', 'paytm payment bank', 'upi payment'
    ]
};

// Track verification state
const verificationState = new Map();
const userOrderState = new Map();

// Processed images cache
const processedImages = new Map();

// OCR cache for performance
const ocrCache = new Map();
const OCR_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Image hash cache for duplicate detection
const imageHashCache = new Map();

/**
 * Generate hash from image data for duplicate detection
 */
function generateImageHash(imageData) {
    return crypto.createHash('md5').update(imageData.substring(0, 1000)).digest('hex');
}

/**
 * Enhanced phone number cleaning for WhatsApp IDs
 */
function cleanPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Handle WhatsApp ID format (number@lid)
    if (phoneNumber.includes('@')) {
        const numberPart = phoneNumber.split('@')[0];
        const digits = numberPart.replace(/\D/g, '');
        
        // Check for Malawi country code (265) followed by Indian number
        if (digits.startsWith('265') && digits.length === 13) {
            // Extract last 10 digits (your Indian number)
            return digits.slice(-10);
        }
        // Check for Indian country code (91)
        else if (digits.startsWith('91') && digits.length === 12) {
            return digits.substring(2);
        }
        // If it's exactly 10 digits
        else if (digits.length === 10) {
            return digits;
        }
        // Take last 10 digits as fallback
        else if (digits.length > 10) {
            return digits.slice(-10);
        }
    }
    
    // Handle raw number strings
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return cleaned.substring(2);
    }
    else if (cleaned.length === 10) {
        return cleaned;
    }
    else if (cleaned.length > 10) {
        // Check if it starts with 265 (Malawi) followed by Indian number
        if (cleaned.startsWith('265') && cleaned.length === 13) {
            return cleaned.slice(-10);
        }
        return cleaned.slice(-10);
    }
    
    return cleaned;
}

/**
 * Main payment verification handler
 */
export async function handlePaymentVerification(message, client) {
    try {
        const from = message.from;
        const userPhone = cleanPhoneNumber(from);
        const userMessage = message.body.trim().toLowerCase();
        
        console.log(`🔍 Payment verification request from: ${userPhone} (original: ${from})`);

        // Check for admin commands first
        if (await handleAdminCommands(message, client, userMessage)) {
            return;
        }

        // Check if user has already completed verification
        const existingState = verificationState.get(userPhone);
        if (existingState?.verified) {
            await sendAlreadyVerifiedMessage(message, existingState);
            return;
        }

        // Handle media (screenshot)
        if (message.hasMedia) {
            return await handlePaymentScreenshot(message, client);
        }

        // Handle help requests
        if (userMessage === '!paymenthelp' || userMessage === 'payment help') {
            return await showPaymentInstructions(message, client);
        }

        // Handle menu or clear commands
        if (userMessage === '!menu' || userMessage === 'menu') {
            verificationState.delete(userPhone);
            userOrderState.delete(userPhone);
            await message.reply('🔄 *Starting fresh order process...*\n\nPlease wait for the menu...');
            return;
        }

        if (userMessage === '!clear') {
            verificationState.delete(userPhone);
            userOrderState.delete(userPhone);
            await message.reply('✅ Verification state cleared. You can now send payment screenshot.');
            return;
        }

        // Default: Show verification help
        await showVerificationHelp(message, client);

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        await sendErrorMessage(message, '❌ Verification failed. Please try again or contact support.');
    }
}

/**
 * Handle payment screenshot from customer
 */
async function handlePaymentScreenshot(message, client) {
    try {
        const from = message.from;
        const customerPhone = cleanPhoneNumber(from);
        
        console.log(`📸 Processing payment screenshot from: ${customerPhone}`);

        // Check if already verified
        const existingState = verificationState.get(customerPhone);
        if (existingState?.verified) {
            await sendAlreadyVerifiedMessage(message, existingState);
            return;
        }

        // Check for duplicate processing
        const processingKey = `${customerPhone}_${Date.now()}`;
        if (processedImages.has(processingKey)) {
            await message.reply('⏳ Please wait, your previous screenshot is still being processed.');
            return;
        }
        processedImages.set(processingKey, true);
        setTimeout(() => processedImages.delete(processingKey), VALIDATION_CONFIG.duplicateWindow);

        const media = await message.downloadMedia();
        
        if (!media) {
            return await sendErrorMessage(message, '❌ Failed to download image. Please try again.');
        }

        // Generate image hash for duplicate detection
        const imageHash = generateImageHash(media.data);
        if (imageHashCache.has(imageHash)) {
            const lastUpload = imageHashCache.get(imageHash);
            if (Date.now() - lastUpload < VALIDATION_CONFIG.duplicateWindow) {
                return await message.reply('⏳ This screenshot was already uploaded recently. Please wait for processing.');
            }
        }
        imageHashCache.set(imageHash, Date.now());

        // Validate image
        const imageValidation = validateImage(media);
        if (!imageValidation.isValid) {
            return await sendInvalidImageMessage(message, imageValidation.reason);
        }

        // Get orders that need payment verification (pending payment)
        const pendingOrders = await getCustomerPendingOrders(customerPhone, from);
        
        console.log(`📦 Found ${pendingOrders.length} orders needing payment verification for ${customerPhone}`);

        if (!pendingOrders || pendingOrders.length === 0) {
            return await sendNoPendingOrdersMessage(message, customerPhone);
        }

        // Quick validation
        await message.reply('🔍 *Analyzing payment screenshot...*');
        const quickValidation = await quickImageValidation(media.data);
        
        if (!quickValidation.isValid) {
            return await sendInvalidPaymentScreenshotMessage(message, quickValidation);
        }

        // Process payment with enhanced validation
        await processPaymentScreenshot(media.data, customerPhone, client, message, pendingOrders, imageHash);

    } catch (error) {
        console.error('Payment screenshot handling error:', error);
        await sendErrorMessage(message, '❌ Failed to process payment screenshot. Please try again.');
    }
}

/**
 * Enhanced function to get customer pending orders - FIXED VERSION
 */
async function getCustomerPendingOrders(customerIdentifier, originalFrom) {
    try {
        // Clean the identifier to get 10-digit format
        const cleanIdentifier = cleanPhoneNumber(customerIdentifier);
        console.log(`📞 Fetching orders for customer: ${cleanIdentifier} (original: ${customerIdentifier})`);
        
        // Get all orders for this customer using the identifier
        const allOrders = await apiService.getCustomerOrders(cleanIdentifier);
        
        console.log(`📊 Total orders found: ${allOrders?.length || 0}`);
        
        if (!allOrders || allOrders.length === 0) {
            console.log(`❌ No orders found for identifier: ${cleanIdentifier}`);
            return [];
        }

        // Log all orders for debugging
        console.log('📋 All customer orders:');
        allOrders.forEach((order, idx) => {
            console.log(`  ${idx + 1}. Order: ${order.orderNumber}, Status: ${order.status}, Payment: ${order.paymentStatus}, Amount: ₹${order.totalPrice}, WhatsApp: ${order.whatsappNumber || 'N/A'}`);
        });

        // Filter for orders that need payment verification
        const pendingOrders = allOrders.filter(order => {
            const status = (order.status || '').toLowerCase();
            const paymentStatus = (order.paymentStatus || '').toLowerCase();
            
            // Check if payment is NOT completed
            const isPaymentNotPaid = !['paid', 'completed', 'verified'].includes(paymentStatus);
            
            // Check if order is NOT cancelled/returned/refunded
            const isOrderActive = !['cancelled', 'returned', 'refunded'].includes(status);
            
            // Check if this order belongs to the customer (by matching either phone or whatsapp)
            const orderPhone = cleanPhoneNumber(order.phoneNumber || '');
            const orderWhatsapp = cleanPhoneNumber(order.whatsappNumber || '');
            const searchIdentifier = cleanIdentifier;
            
            const belongsToCustomer = 
                orderPhone === searchIdentifier || 
                orderWhatsapp === searchIdentifier ||
                (order.secondaryPhoneNumber && cleanPhoneNumber(order.secondaryPhoneNumber) === searchIdentifier);
            
            const isEligible = isPaymentNotPaid && isOrderActive && belongsToCustomer;
            
            if (isEligible) {
                console.log(`  ✅ Order ${order.orderNumber} needs verification (Payment: ${paymentStatus}, Status: ${status})`);
            }
            
            return isEligible;
        });

        console.log(`✅ Filtered to ${pendingOrders.length} orders needing payment verification:`);
        pendingOrders.forEach((order, idx) => {
            const productNames = order.items?.map(item => item.productName).join(', ') || 'Unknown';
            console.log(`  ${idx + 1}. ${order.orderNumber}: ₹${order.totalPrice} - ${productNames} (Status: ${order.status}, Payment: ${order.paymentStatus})`);
        });

        return pendingOrders;

    } catch (error) {
        console.error('❌ Error fetching customer orders:', error);
        return [];
    }
}

/**
 * Enhanced quick image validation
 */
async function quickImageValidation(imageData) {
    try {
        // Check cache first
        const cacheKey = imageData.substring(0, 100);
        if (ocrCache.has(cacheKey)) {
            const cached = ocrCache.get(cacheKey);
            if (Date.now() - cached.timestamp < OCR_CACHE_TTL) {
                console.log('📦 Using cached OCR result');
                return cached.result;
            }
            ocrCache.delete(cacheKey);
        }

        const result = await Tesseract.recognize(
            Buffer.from(imageData, 'base64'),
            'eng',
            { 
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        if (progress % 25 === 0) console.log(`📊 OCR Progress: ${progress}%`);
                    }
                },
                tessedit_pageseg_mode: VALIDATION_CONFIG.ocrEngine.psm,
                tessedit_ocr_engine_mode: VALIDATION_CONFIG.ocrEngine.oem
            }
        );

        const text = result.data.text.toLowerCase();
        console.log('📝 OCR Text Sample:', text.substring(0, 300) + '...');
        
        const analysis = analyzeTextForPaymentIndicators(text);
        
        const validationResult = {
            isValid: analysis.isPaymentScreenshot,
            confidence: analysis.confidence,
            foundIndicators: analysis.foundIndicators,
            missingIndicators: analysis.missingIndicators,
            reason: analysis.reason,
            textLength: text.length,
            rawText: text
        };

        // Cache the result
        ocrCache.set(cacheKey, {
            timestamp: Date.now(),
            result: validationResult
        });

        return validationResult;

    } catch (error) {
        console.error('Quick validation error:', error);
        return {
            isValid: false,
            reason: 'Cannot process image for validation',
            confidence: 0,
            rawText: ''
        };
    }
}

/**
 * Enhanced text analysis for payment indicators
 */
function analyzeTextForPaymentIndicators(text) {
    const foundIndicators = [];
    let score = 0;

    // Check for payment app indicators
    PAYMENT_INDICATORS.apps.forEach(indicator => {
        if (text.includes(indicator)) {
            foundIndicators.push(indicator);
            score += 10;
        }
    });

    // Check for transaction indicators
    PAYMENT_INDICATORS.transaction.forEach(indicator => {
        if (text.includes(indicator)) {
            foundIndicators.push(indicator);
            score += 8;
        }
    });

    // Check for amount indicators
    PAYMENT_INDICATORS.amount.forEach(indicator => {
        if (text.includes(indicator)) {
            foundIndicators.push(indicator);
            score += 8;
        }
    });

    // Check for success indicators
    const hasSuccess = PAYMENT_INDICATORS.success.some(indicator => text.includes(indicator));
    const hasFailure = PAYMENT_INDICATORS.failure.some(indicator => text.includes(indicator));

    if (hasSuccess) {
        foundIndicators.push('success');
        score += 30;
    }

    if (hasFailure) {
        foundIndicators.push('failure');
        score -= 50;
    }

    // Check for UPI ID patterns
    const upiPattern = /@(?:oksbi|okaxis|paytm|axl|ybl|sbi|hdfc|icici)/i;
    if (upiPattern.test(text)) {
        foundIndicators.push('upi_detected');
        score += 20;
    }

    // Check for amount patterns with currency
    const amountPattern = /(?:rs\.?|₹|inr)\s*(\d+)/i;
    if (amountPattern.test(text)) {
        foundIndicators.push('amount_with_currency');
        score += 15;
    }

    // Check for transaction ID patterns
    const txnPattern = /(?:txn|trn|ref|utr|id)[:\s]*([a-z0-9]{8,})/i;
    if (txnPattern.test(text)) {
        foundIndicators.push('transaction_id');
        score += 15;
    }

    // Check for date/time patterns
    const dateTimePattern = /\d{1,2}[\/\-:]\d{1,2}(?:[\/\-:]\d{2,4})?|\d{1,2}:\d{2}/;
    if (dateTimePattern.test(text)) {
        foundIndicators.push('datetime');
        score += 5;
    }

    // Determine if it's a payment screenshot
    const isPaymentScreenshot = score >= 50 && foundIndicators.length >= VALIDATION_CONFIG.requiredPaymentIndicators;

    return {
        isPaymentScreenshot,
        confidence: Math.min(100, Math.max(0, score)),
        foundIndicators: [...new Set(foundIndicators)],
        missingIndicators: [],
        reason: isPaymentScreenshot ? 
            `Valid payment screenshot detected (${foundIndicators.length} indicators, score: ${score})` :
            `Not a payment screenshot (only ${foundIndicators.length} indicators found, score: ${score})`
    };
}

/**
 * Process payment screenshot with full analysis
 */
async function processPaymentScreenshot(imageData, customerPhone, client, originalMessage, pendingOrders, imageHash) {
    try {
        await originalMessage.reply('🔍 *Analyzing Payment Screenshot...*\n\nPlease wait while we verify your payment details.');

        // Perform detailed OCR analysis
        const ocrResult = await performDetailedOCRAnalysis(imageData);
        
        if (!ocrResult.isReadable) {
            return await sendUnreadableScreenshotMessage(originalMessage, ocrResult);
        }

        // Enhanced validation: Check if it's a recent payment
        const timeValidation = validatePaymentTime(ocrResult.analysis);
        if (!timeValidation.isRecent) {
            return await sendOldPaymentMessage(originalMessage, timeValidation);
        }

        // Find matching order and validate payment
        const verificationResult = await findAndValidatePayment(ocrResult, pendingOrders);
        
        console.log('📊 Verification Result:', {
            isValid: verificationResult.isValid,
            confidence: verificationResult.confidence,
            matchedOrder: verificationResult.matchedOrder?.orderNumber,
            errors: verificationResult.errors.length,
            warnings: verificationResult.warnings.length
        });

        if (verificationResult.isValid) {
            await processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone, imageHash);
        } else {
            await handleFailedVerification(verificationResult, client, originalMessage);
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        await sendErrorMessage(originalMessage, '❌ Error processing payment. Please try again or contact support.');
    }
}

/**
 * Validate payment time - Check if payment is recent
 */
function validatePaymentTime(analysis) {
    try {
        const now = new Date();
        const detectedTime = extractExactTime(analysis.timestamp || analysis.rawText);
        
        if (!detectedTime) {
            console.log('⏰ No timestamp detected in OCR');
            return { isRecent: true, reason: 'No timestamp found, proceeding with validation' };
        }

        const timeDiff = Math.abs(now - detectedTime) / (1000 * 60); // Difference in minutes
        
        console.log('⏰ Time Validation:', {
            detectedTime: detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            difference: Math.round(timeDiff) + ' minutes'
        });
        
        if (timeDiff > VALIDATION_CONFIG.recentPaymentThreshold) {
            return {
                isRecent: false,
                reason: `Payment is too old (${Math.round(timeDiff)} minutes ago). Please send screenshot within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes of payment.`,
                detectedTime: detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                currentTime: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };
        }

        return { 
            isRecent: true, 
            reason: `Payment is recent (${Math.round(timeDiff)} minutes ago)`,
            detectedTime: detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

    } catch (error) {
        console.error('Time validation error:', error);
        return { isRecent: true, reason: 'Time validation skipped' };
    }
}

/**
 * Extract exact time from text - ENHANCED VERSION
 */
function extractExactTime(text) {
    try {
        console.log('⏰ Extracting time from text...');
        
        const now = new Date();
        
        // Enhanced patterns for Indian formats
        const patterns = [
            // DD/MM/YYYY HH:MM AM/PM
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[,\s]*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)/i,
            
            // DD/MM/YYYY HH:MM (24hr)
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})[,\s]*(\d{1,2}):(\d{2})(?::(\d{2}))?/i,
            
            // Today at HH:MM AM/PM
            /today\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i,
            
            // HH:MM AM/PM DD/MM/YYYY
            /(\d{1,2}):(\d{2})\s*(am|pm)?[,\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
            
            // HH:MM AM/PM (assume today)
            /(\d{1,2}):(\d{2})\s*(am|pm)/i,
            
            // HH:MM (24hr format)
            /(\d{1,2}):(\d{2})(?![0-9])/,
            
            // Just now / few seconds ago
            /(just\s+now|few\s+seconds\s+ago|a\s+moment\s+ago|now)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                console.log('⏰ Pattern matched:', pattern.source.substring(0, 50) + '...');
                
                let hours = 0, minutes = 0, seconds = 0;
                let day = now.getDate(), month = now.getMonth(), year = now.getFullYear();
                let period = '';

                if (pattern.source.includes('just now')) {
                    return new Date(now.getTime() - 60000); // 1 minute ago
                }

                if (pattern.source.includes('today at')) {
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    period = (match[3] || '').toLowerCase();
                }
                else if (match[6] && match[7]) { // Full date with AM/PM
                    day = parseInt(match[1]);
                    month = parseInt(match[2]) - 1;
                    year = parseInt(match[3]);
                    if (year < 100) year += 2000;
                    hours = parseInt(match[4]);
                    minutes = parseInt(match[5]);
                    if (match[6]) seconds = parseInt(match[6]) || 0;
                    period = (match[7] || '').toLowerCase();
                }
                else if (match[3] && match[4] && match[5]) { // Time with AM/PM and date
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    period = (match[3] || '').toLowerCase();
                    day = parseInt(match[4]);
                    month = parseInt(match[5]) - 1;
                    year = parseInt(match[6]);
                    if (year < 100) year += 2000;
                }
                else if (match[3]) { // Just time with AM/PM
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    period = match[3].toLowerCase();
                }
                else { // Just time without AM/PM
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    if (match[3]) seconds = parseInt(match[3]) || 0;
                    
                    // Try to infer AM/PM from context
                    if (hours > 12) {
                        period = 'pm';
                    } else {
                        const context = text.toLowerCase();
                        if (context.includes('pm') && hours < 12) period = 'pm';
                        else if (context.includes('am')) period = 'am';
                        else period = now.getHours() >= 12 ? 'pm' : 'am';
                    }
                }

                // Convert to 24-hour format
                if (period === 'pm' && hours < 12) hours += 12;
                if (period === 'am' && hours === 12) hours = 0;

                // Validate
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    const date = new Date(year, month, day, hours, minutes, seconds);
                    
                    // Check if date is in the future (timezone issue)
                    if (date > now) {
                        const timeDiff = date - now;
                        if (timeDiff > 12 * 60 * 60 * 1000) { // More than 12 hours
                            date.setDate(date.getDate() - 1);
                        }
                    }
                    
                    console.log('⏰ Parsed date:', date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
                    return date;
                }
            }
        }

        console.log('⏰ No valid time pattern found');
        return null;
    } catch (error) {
        console.error('⏰ Time extraction error:', error);
        return null;
    }
}

/**
 * Perform detailed OCR analysis with enhancements
 */
async function performDetailedOCRAnalysis(imageData) {
    try {
        console.log('🔍 Starting detailed OCR analysis...');
        const startTime = Date.now();

        const result = await Tesseract.recognize(
            Buffer.from(imageData, 'base64'),
            'eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        console.log(`📊 OCR Progress: ${progress}%`);
                    }
                },
                tessedit_pageseg_mode: VALIDATION_CONFIG.ocrEngine.psm,
                tessedit_ocr_engine_mode: VALIDATION_CONFIG.ocrEngine.oem
            }
        );

        const processingTime = Date.now() - startTime;
        const text = result.data.text;
        const words = result.data.words || [];
        
        console.log(`✅ OCR completed in ${processingTime}ms`);
        console.log(`📝 Text length: ${text.length} chars, Words: ${words.length}`);
        
        // Enhanced analysis
        const analysis = analyzePaymentText(text);

        return {
            text: text,
            confidence: result.data.confidence,
            words: words,
            isReadable: text.length >= VALIDATION_CONFIG.minTextLength && result.data.confidence > 30,
            wordCount: words.length,
            processingTime: processingTime,
            analysis: analysis
        };

    } catch (error) {
        console.error('OCR Analysis Error:', error);
        return {
            text: '',
            confidence: 0,
            words: [],
            isReadable: false,
            wordCount: 0,
            processingTime: 0,
            analysis: {},
            error: error.message
        };
    }
}

/**
 * Enhanced payment text analysis
 */
function analyzePaymentText(text) {
    console.log('🔍 Starting payment text analysis...');
    
    const lowerText = text.toLowerCase();
    
    const analysis = {
        amount: extractAmount(text, lowerText),
        upiId: extractUPIId(lowerText),
        transactionId: extractTransactionId(lowerText),
        timestamp: extractTimestamp(lowerText),
        status: extractPaymentStatus(lowerText),
        bankName: extractBankName(lowerText),
        appName: extractAppName(lowerText),
        rawText: text
    };

    console.log('🔍 Analysis Result:', {
        amount: analysis.amount,
        upiId: analysis.upiId,
        status: analysis.status,
        timestamp: analysis.timestamp,
        appName: analysis.appName,
        hasTransactionId: !!analysis.transactionId
    });

    return analysis;
}

/**
 * SMART AMOUNT EXTRACTION - ENHANCED VERSION
 */
function extractAmount(originalText, lowerText) {
    console.log('💰 Starting amount extraction...');
    
    // Remove phone numbers and dates first
    let cleanText = originalText
        .replace(/\+\d{10,}/g, ' ')
        .replace(/\b\d{10}\b/g, ' ')
        .replace(/\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi, ' ')
        .replace(/\d{1,2}:\d{2}\s*(?:am|pm)?/gi, ' ');
    
    console.log('🧹 Cleaned text sample:', cleanText.substring(0, 200));

    // Strategy 1: Look for amount with currency symbol
    const currencyPatterns = [
        /₹\s*(\d+(?:[.,]\d+)?)/gi,
        /rs\.?\s*(\d+(?:[.,]\d+)?)/gi,
        /inr\s*(\d+(?:[.,]\d+)?)/gi,
        /rupees?\s*(\d+(?:[.,]\d+)?)/gi
    ];

    for (const pattern of currencyPatterns) {
        const matches = [...cleanText.matchAll(pattern)];
        for (const match of matches) {
            if (match[1]) {
                const amount = parseFloat(match[1].replace(/[.,]/g, ''));
                if (!isNaN(amount) && amount >= 1 && amount <= 50000) {
                    console.log(`🎯 Found amount via currency pattern: ₹${amount}`);
                    return Math.round(amount);
                }
            }
        }
    }

    // Strategy 2: Look for amount near payment keywords
    const paymentKeywords = ['pay', 'sent', 'paid', 'amount', 'total', 'money', 'transfer'];
    const numberPattern = /\b(\d{1,5})\b/g;
    const numberMatches = [...cleanText.matchAll(numberPattern)];
    
    const candidateAmounts = [];

    for (const match of numberMatches) {
        const amount = parseInt(match[1]);
        if (!isNaN(amount) && amount >= 10 && amount <= 50000) {
            // Check context around the number
            const startIdx = Math.max(0, match.index - 40);
            const endIdx = Math.min(cleanText.length, match.index + 40);
            const context = cleanText.substring(startIdx, endIdx).toLowerCase();
            
            // Score the amount
            let score = 0;
            
            // Check if near payment keywords
            if (paymentKeywords.some(keyword => context.includes(keyword))) {
                score += 20;
            }
            
            // Check if amount is likely (ends with 0, 5, 9)
            if (amount % 5 === 0 || amount % 10 === 0 || amount % 9 === 0) {
                score += 10;
            }
            
            // Check if near currency symbol
            if (context.includes('₹') || context.includes('rs')) {
                score += 15;
            }
            
            candidateAmounts.push({ amount, score, context, index: match.index });
        }
    }

    if (candidateAmounts.length > 0) {
        // Sort by score and position
        candidateAmounts.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.index - b.index;
        });
        
        const bestMatch = candidateAmounts[0];
        console.log(`🎯 Selected amount from ${candidateAmounts.length} candidates: ₹${bestMatch.amount} (score: ${bestMatch.score})`);
        return bestMatch.amount;
    }

    console.log('⚠️ No reasonable amount found');
    return null;
}

/**
 * Extract UPI ID from text - ENHANCED
 */
function extractUPIId(text) {
    const upiPatterns = [
        /([a-zA-Z0-9._-]+@(?:oksbi|okaxis|okhdfc|okicici|paytm|axl|ybl|sbi|hdfc|icici))/gi,
        /to:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
        /receiver:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
        /pay to\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
        /upi id:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
        /vpa:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/gi,
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/g
    ];

    for (const pattern of upiPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                let upi = match.trim()
                    .replace(/^(?:to|receiver|pay to|upi id|vpa)[:\s]*/gi, '')
                    .trim();
                
                if (upi.includes('@') && upi.split('@')[0].length > 2) {
                    console.log(`✅ Found UPI ID: ${upi}`);
                    return upi;
                }
            }
        }
    }
    
    return null;
}

/**
 * Extract transaction ID from text - ENHANCED
 */
function extractTransactionId(text) {
    const patterns = [
        /(?:transaction|txn|trn|ref|reference|utr|id)[\s:]*([a-zA-Z0-9]{8,20})/gi,
        /([A-Z0-9]{12,20})(?:\s|$)/g,
        /([0-9]{12,20})/g,
        /([a-zA-Z0-9]{16,20})/g
    ];

    for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                const clean = match.replace(/[^a-zA-Z0-9]/g, '');
                if (clean.length >= 8 && clean.length <= 25) {
                    console.log(`✅ Found Transaction ID: ${clean}`);
                    return clean;
                }
            }
        }
    }
    
    return null;
}

/**
 * Extract timestamp from text
 */
function extractTimestamp(text) {
    const datePatterns = [
        /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
        /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/gi,
        /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
        /(\d{1,2}\s+\w+\s+\d{4},?\s+\d{1,2}:\d{2}\s*(?:am|pm)?)/gi
    ];

    for (const pattern of datePatterns) {
        const matches = text.match(pattern);
        if (matches) {
            console.log(`✅ Found Timestamp: ${matches[0]}`);
            return matches[0];
        }
    }
    
    return null;
}

/**
 * Extract payment status from text
 */
function extractPaymentStatus(text) {
    for (const indicator of PAYMENT_INDICATORS.success) {
        if (text.includes(indicator)) {
            console.log(`✅ Payment Status: Success (found "${indicator}")`);
            return 'success';
        }
    }
    
    for (const indicator of PAYMENT_INDICATORS.failure) {
        if (text.includes(indicator)) {
            console.log(`❌ Payment Status: Failed (found "${indicator}")`);
            return 'failed';
        }
    }
    
    console.log('⚠️ Payment Status: Unknown');
    return 'unknown';
}

/**
 * Extract bank name from text
 */
function extractBankName(text) {
    const banks = [
        { name: 'sbi', patterns: ['sbi', 'state bank'] },
        { name: 'hdfc', patterns: ['hdfc', 'hdfc bank'] },
        { name: 'icici', patterns: ['icici', 'icici bank'] },
        { name: 'axis', patterns: ['axis', 'axis bank'] },
        { name: 'pnb', patterns: ['pnb', 'punjab national bank'] },
        { name: 'kotak', patterns: ['kotak', 'kotak mahindra'] }
    ];

    for (const bank of banks) {
        for (const pattern of bank.patterns) {
            if (text.includes(pattern)) {
                console.log(`🏦 Bank Detected: ${bank.name}`);
                return bank.name;
            }
        }
    }
    
    return null;
}

/**
 * Extract app name from text
 */
function extractAppName(text) {
    const apps = {
        'gpay': ['gpay', 'google pay', 'googlepay'],
        'phonepe': ['phonepe', 'phone pe'],
        'paytm': ['paytm'],
        'bhim': ['bhim', 'bhim upi'],
        'amazonpay': ['amazon pay', 'amazonpay']
    };

    for (const [appName, keywords] of Object.entries(apps)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            console.log(`📱 App Detected: ${appName}`);
            return appName;
        }
    }
    
    return null;
}

/**
 * Find and validate payment against orders - ENHANCED MATCHING
 */
async function findAndValidatePayment(ocrResult, pendingOrders) {
    const validation = {
        isValid: false,
        confidence: 0,
        matchedOrder: null,
        details: {},
        errors: [],
        warnings: [],
        autoVerifiable: true,
        matchQuality: 'none'
    };

    const extractedAmount = ocrResult.analysis.amount;
    const extractedUPI = ocrResult.analysis.upiId;
    const paymentStatus = ocrResult.analysis.status;

    console.log('🔍 Starting Payment Validation:', {
        extractedAmount,
        extractedUPI,
        paymentStatus,
        pendingOrdersCount: pendingOrders.length
    });

    // If no pending orders
    if (pendingOrders.length === 0) {
        validation.errors.push('❌ No pending orders found. You may have already paid or your order is processed.');
        return validation;
    }

    // Validate payment status
    if (paymentStatus !== 'success') {
        validation.errors.push('❌ Payment status not successful');
        validation.autoVerifiable = false;
    }

    // If no amount detected
    if (!extractedAmount) {
        validation.errors.push('❌ Could not detect payment amount in screenshot');
        validation.warnings.push('💡 Please ensure the payment amount (₹) is clearly visible');
        validation.autoVerifiable = false;
        return validation;
    }

    console.log(`💰 Looking for order matching amount: ₹${extractedAmount}`);
    
    // Find matching order by amount with enhanced matching
    let matchedOrder = null;
    let matchType = 'none';
    let amountDifference = Infinity;
    let matchScore = 0;
    
    for (const order of pendingOrders) {
        const orderAmount = order.totalPrice;
        const diff = Math.abs(extractedAmount - orderAmount);
        
        // Calculate match score
        let score = 0;
        let type = 'none';
        
        if (diff === 0) {
            score = 100;
            type = 'exact';
        } else if (diff <= VALIDATION_CONFIG.amountTolerance) {
            score = 90 - (diff * 5);
            type = 'close';
        } else if (diff <= 10) {
            score = 70 - diff;
            type = 'near';
        } else if (diff <= 20) {
            score = 50 - diff/2;
            type = 'far';
        }
        
        console.log(`   Order ${order.orderNumber}: ₹${orderAmount}, Diff: ₹${diff}, Score: ${score}, Type: ${type}`);
        
        if (score > matchScore) {
            matchedOrder = order;
            matchType = type;
            amountDifference = diff;
            matchScore = score;
            
            if (type === 'exact') break;
        }
    }

    if (!matchedOrder) {
        const errorMsg = `❌ No matching order found for payment of ₹${extractedAmount}`;
        validation.errors.push(errorMsg);
        
        // Show user their pending orders
        if (pendingOrders.length > 0) {
            validation.warnings.push(`📋 *Your pending orders:*`);
            pendingOrders.slice(0, 3).forEach(order => {
                const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
                validation.warnings.push(`   • ${order.orderNumber}: ${productNames} - ₹${order.totalPrice}`);
            });
        }
        
        return validation;
    }

    validation.matchedOrder = matchedOrder;
    validation.matchQuality = matchType;
    
    // Get product details
    const productNames = matchedOrder.items?.map(item => item.productName).join(', ') || 'Product';
    console.log(`✅ Matched Order: ${matchedOrder.orderNumber}, Amount: ₹${matchedOrder.totalPrice}, Match Type: ${matchType}`);

    validation.matchedOrder.productDetails = {
        names: productNames,
        items: matchedOrder.items || []
    };

    // Validate UPI ID
    const upiValidation = validateUPIId(extractedUPI);
    validation.details.upi = upiValidation;
    
    if (!upiValidation.isValid) {
        if (!extractedUPI) {
            validation.errors.push(`❌ UPI ID not found in screenshot`);
            validation.warnings.push(`💡 Please ensure receiver UPI ID is visible: ${VALID_UPI_IDS[0]}`);
        } else {
            validation.errors.push(`❌ Invalid UPI ID: ${extractedUPI}`);
            validation.warnings.push(`💡 Please pay to our official UPI: ${VALID_UPI_IDS[0]}`);
        }
        validation.autoVerifiable = false;
    }

    // Validate amount
    const amountValidation = {
        isValid: amountDifference <= VALIDATION_CONFIG.amountTolerance,
        expected: matchedOrder.totalPrice,
        found: extractedAmount,
        difference: amountDifference,
        matchType: matchType
    };
    
    validation.details.amount = amountValidation;
    
    if (!amountValidation.isValid) {
        validation.errors.push(`❌ Amount mismatch: Paid ₹${extractedAmount}, Expected ₹${matchedOrder.totalPrice}`);
    }

    // Calculate confidence score
    validation.confidence = calculateConfidenceScore(validation);
    
    // Determine if payment is valid
    validation.isValid = 
        validation.errors.length === 0 && 
        validation.confidence >= VALIDATION_CONFIG.minConfidenceScore &&
        paymentStatus === 'success' &&
        amountValidation.isValid &&
        upiValidation.isValid;

    console.log(`📊 Final Validation:`, {
        isValid: validation.isValid,
        confidence: validation.confidence,
        matchType: matchType,
        errors: validation.errors.length
    });

    return validation;
}

/**
 * Enhanced UPI ID validation
 */
function validateUPIId(extractedUPI) {
    if (!extractedUPI) {
        return { isValid: false, found: 'Not found' };
    }

    const cleanExtracted = extractedUPI.toLowerCase().trim();
    
    for (const validUPI of VALID_UPI_IDS) {
        const cleanValid = validUPI.toLowerCase();
        
        // Exact match
        if (cleanExtracted === cleanValid) {
            return { 
                isValid: true, 
                found: validUPI, 
                extracted: extractedUPI,
                matchType: 'exact'
            };
        }
        
        // Contains match
        if (cleanExtracted.includes(cleanValid) || cleanValid.includes(cleanExtracted)) {
            return { 
                isValid: true, 
                found: validUPI, 
                extracted: extractedUPI,
                matchType: 'contains'
            };
        }
        
        // Partial match for our IDs
        if (cleanExtracted.includes('subaask21') || cleanExtracted.includes('posterpro.store')) {
            return { 
                isValid: true, 
                found: validUPI, 
                extracted: extractedUPI,
                matchType: 'partial'
            };
        }
    }

    return { isValid: false, found: extractedUPI };
}

/**
 * Calculate confidence score
 */
function calculateConfidenceScore(validation) {
    let score = 0;

    // Amount match score
    switch (validation.matchQuality) {
        case 'exact': score += 50; break;
        case 'close': score += 40; break;
        case 'near': score += 30; break;
        case 'far': score += 20; break;
        default: score += 10;
    }
    
    // UPI validation score
    if (validation.details.upi?.isValid) {
        switch (validation.details.upi.matchType) {
            case 'exact': score += 30; break;
            case 'contains': score += 25; break;
            case 'partial': score += 20; break;
            default: score += 15;
        }
    }
    
    // Penalties
    if (validation.errors.length > 0) {
        score -= validation.errors.length * 15;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Process successful verification
 */
async function processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone, imageHash) {
    try {
        const order = verificationResult.matchedOrder;
        const productNames = verificationResult.matchedOrder.productDetails?.names || 'Product';
        
        console.log(`✅ Processing successful verification for order: ${order.orderNumber}`);

        // Create payment verification record
        const paymentVerification = await apiService.createPaymentVerification({
            orderNumber: order.orderNumber,
            customerPhone: customerPhone,
            orderReference: order._id,
            orderDetails: {
                totalAmount: order.totalPrice,
                items: order.items,
                productNames: productNames,
                shippingAddress: order.shippingAddress,
                pincode: order.pincode,
                customerName: order.customerName
            },
            paymentProof: {
                imageData: imageData.substring(0, 10000),
                mimeType: 'image/jpeg',
                imageHash: imageHash
            },
            ocrAnalysis: {
                extractedText: ocrResult.text.substring(0, 500),
                confidenceScore: ocrResult.confidence,
                extractedAmount: ocrResult.analysis.amount,
                extractedUPI: ocrResult.analysis.upiId,
                transactionId: ocrResult.analysis.transactionId,
                timestamp: ocrResult.analysis.timestamp
            },
            detectedPayment: {
                amount: ocrResult.analysis.amount,
                upiId: ocrResult.analysis.upiId,
                transactionId: ocrResult.analysis.transactionId,
                transactionTime: new Date(),
                status: 'success',
                appName: ocrResult.analysis.appName,
                bankName: ocrResult.analysis.bankName
            },
            validationResults: {
                amountMatch: verificationResult.details.amount?.isValid,
                upiMatch: verificationResult.details.upi?.isValid,
                confidenceScore: verificationResult.confidence,
                matchQuality: verificationResult.matchQuality
            },
            status: 'verified',
            verifiedBy: 'auto_ocr',
            verifiedAt: new Date()
        });

        if (!paymentVerification) {
            throw new Error('Failed to create payment verification record');
        }

        console.log('✅ Payment verification record created:', paymentVerification._id);

        // Update order status - CRITICAL: This sets payment to 'paid'
        try {
            await apiService.updateOrderStatus(order._id, 'confirmed', 'Payment verified automatically');
            
            // Update payment status to 'paid'
            await apiService.updateOrderPaymentStatus(order.orderNumber, {
                paymentStatus: 'paid',
                paidAmount: order.totalPrice,
                transactionId: ocrResult.analysis.transactionId,
                paymentMethod: 'upi',
                verifiedAt: new Date(),
                verificationId: paymentVerification._id
            });
            
            console.log(`✅ Order ${order.orderNumber} payment status updated to PAID`);
        } catch (updateError) {
            console.error('⚠️ Order status update failed:', updateError.message);
        }

        // Store verification state
        verificationState.set(customerPhone, {
            verified: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
            amount: order.totalPrice,
            productName: productNames,
            items: order.items,
            customerName: order.customerName,
            timestamp: Date.now(),
            verificationId: paymentVerification._id
        });

        // Store order details
        userOrderState.set(customerPhone, {
            orderNumber: order.orderNumber,
            productName: productNames,
            items: order.items,
            amount: order.totalPrice,
            customerName: order.customerName
        });

        // Send success messages
        await sendSuccessMessages(order, verificationResult, originalMessage, productNames);

        // Send notification to admin
        await sendAdminNotification(order, customerPhone, verificationResult.confidence);

        // Generate and send invoice
        await generateAndSendInvoice(order, originalMessage);

        console.log(`🎉 Payment verification completed successfully for ${productNames}`);

    } catch (error) {
        console.error('Successful verification processing error:', error);
        await originalMessage.reply(
            '✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n' +
            'Your payment has been verified. Our team will process your order shortly.\n\n' +
            'If you have any questions, please contact support.'
        );
    }
}

/**
 * Generate and send invoice
 */
async function generateAndSendInvoice(order, message) {
    try {
        console.log(`📄 Generating invoice for order: ${order.orderNumber}`);
        
        // Try to generate PDF invoice
        try {
            // Generate PDF invoice
            const pdfBuffer = await invoiceGenerator.generateInvoicePDF(order);
            
            // Create MessageMedia from PDF buffer
            const media = new MessageMedia(
                'application/pdf',
                pdfBuffer.toString('base64'),
                `invoice-${order.orderNumber}.pdf`
            );
            
            // Send PDF invoice
            await message.reply(media, null, { 
                caption: `🧾 *Invoice for Order #${order.orderNumber}*\n\nThank you for your purchase! 🎉` 
            });
            
            console.log(`✅ PDF invoice sent for order: ${order.orderNumber}`);
            
        } catch (pdfError) {
            console.error('❌ PDF invoice generation failed, falling back to text:', pdfError.message);
            
            // Fallback to text invoice
            const items = order.items?.map(item => ({
                name: item.productName,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })) || [];

            const subtotal = items.reduce((sum, item) => sum + item.total, 0);
            const gst = order.totalGst || 0;
            const total = order.totalPrice || subtotal + gst;

            let invoiceText = 
                `🧾 *INVOICE - Order #${order.orderNumber}*\n` +
                `═══════════════════════\n\n` +
                `👤 *Customer:* ${order.customerName || 'Valued Customer'}\n` +
                `📱 *Phone:* ${order.phoneNumber || 'N/A'}\n` +
                `📅 *Date:* ${new Date().toLocaleDateString('en-IN')}\n\n` +
                `*Items:*\n`;

            items.forEach((item, index) => {
                invoiceText += `${index + 1}. ${item.name}\n`;
                invoiceText += `   Qty: ${item.quantity} x ₹${item.price} = ₹${item.total}\n`;
            });

            invoiceText += 
                `\n*Summary:*\n` +
                `📦 Subtotal: ₹${subtotal}\n`;

            if (gst > 0) {
                invoiceText += `💵 GST: ₹${gst}\n`;
            }

            invoiceText += 
                `💰 *Total: ₹${total}*\n\n` +
                `*Payment Details:*\n` +
                `✅ Status: Paid\n` +
                `💳 Method: UPI\n` +
                `⏱️ Time: ${new Date().toLocaleString('en-IN')}\n` +
                `🔢 Transaction ID: ${order.transactionId || 'N/A'}\n\n` +
                `*Delivery Address:*\n` +
                `${typeof order.shippingAddress === 'object' ? 
                    `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}` : 
                    order.shippingAddress || 'Address provided in order'}\n\n` +
                `Thank you for shopping with us! 🎉\n` +
                `_For any queries, reply to this message_`;

            await message.reply(invoiceText);
            console.log(`✅ Text invoice sent for order: ${order.orderNumber}`);
        }

    } catch (error) {
        console.error('❌ Invoice generation error:', error);
        // Don't throw - invoice failure shouldn't break payment verification
    }
}

/**
 * Send success messages to customer
 */
async function sendSuccessMessages(order, verificationResult, message, productNames) {
    const confidence = Math.round(verificationResult.confidence);
    
    // Build order items text
    let orderItemsText = '';
    if (order.items && order.items.length > 0) {
        orderItemsText = `📝 *Order Items:*\n`;
        order.items.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            const productName = item.productName || 'Product';
            orderItemsText += `• ${productName} x ${item.quantity || 1} - ₹${itemTotal}\n`;
        });
    }

    let successMessage = 
        `✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n` +
        `🧾 *Order Number:* ${order.orderNumber}\n` +
        `👤 *Customer:* ${order.customerName || 'Valued Customer'}\n` +
        `📦 *Product:* ${productNames}\n` +
        `💰 *Amount Paid:* ₹${order.totalPrice}\n` +
        `🎯 *Verification Score:* ${confidence}%\n` +
        `🔢 *Transaction ID:* ${order.transactionId || verificationResult.details.transactionId || 'N/A'}\n` +
        `📊 *Status:* Order Confirmed & Processing\n\n` +
        orderItemsText +
        `\n📄 *Invoice:* I've sent your invoice as a PDF above. Please save it for your records.\n\n` +
        `*What Happens Next:*\n` +
        `• Order processing: 24-48 hours\n` +
        `• Quality check & packaging\n` +
        `• Shipping confirmation with tracking\n` +
        `• Delivery: 3-5 business days\n\n` +
        `📞 *Need Help?* Reply to this message\n\n` +
        `🎉 *THANK YOU FOR YOUR PURCHASE!*`;

    await message.reply(successMessage);
}

/**
 * Send admin notification
 */
async function sendAdminNotification(order, customerPhone, confidence) {
    try {
        await notificationManager.sendNotification('PAYMENT_VERIFIED', {
            title: '✅ Payment Verified',
            body: `Payment of ₹${order.totalPrice} verified for order ${order.orderNumber}`,
            data: {
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerPhone: customerPhone,
                amount: order.totalPrice,
                product: order.items?.[0]?.productName,
                confidence: confidence,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.warn('⚠️ Admin notification failed:', error.message);
    }
}

/**
 * Handle failed verification
 */
async function handleFailedVerification(verificationResult, client, originalMessage) {
    const order = verificationResult.matchedOrder;
    
    let errorMessage = `❌ *PAYMENT VERIFICATION FAILED*\n\n`;
    
    errorMessage += `*Verification Score:* ${Math.round(verificationResult.confidence)}%\n`;
    errorMessage += `*Minimum Required:* ${VALIDATION_CONFIG.minConfidenceScore}%\n\n`;
    
    if (verificationResult.errors.length > 0) {
        errorMessage += `*Issues Found:*\n${verificationResult.errors.join('\n')}\n\n`;
    }

    if (verificationResult.warnings.length > 0) {
        errorMessage += `*Suggestions:*\n${verificationResult.warnings.join('\n')}\n\n`;
    }

    if (order) {
        const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
        errorMessage += `*Your Order Details:*\n` +
            `📦 Order: ${order.orderNumber}\n` +
            `📦 Product: ${productNames}\n` +
            `💰 Amount Due: ₹${order.totalPrice}\n\n`;
    }

    errorMessage += `*How to Fix:*\n` +
        `1. Pay exactly ₹${order?.totalPrice || 'the order amount'}\n` +
        `2. Use our UPI: ${VALID_UPI_IDS[0]}\n` +
        `3. Ensure payment shows "SUCCESSFUL"\n` +
        `4. Send clear screenshot immediately\n` +
        `5. Screenshot must be within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes of payment\n\n` +
        `Try again with correct payment details.`;

    await originalMessage.reply(errorMessage);
}

// ========== HELPER FUNCTIONS ==========

async function sendOldPaymentMessage(message, timeValidation) {
    await message.reply(
        `❌ *OLD PAYMENT SCREENSHOT*\n\n` +
        `This payment screenshot is too old.\n\n` +
        `*Details:*\n` +
        `• Detected: ${timeValidation.detectedTime || 'Unknown'}\n` +
        `• Current: ${timeValidation.currentTime || 'Unknown'}\n` +
        `• Difference: ${timeValidation.reason}\n\n` +
        `*Please send a recent screenshot:*\n` +
        `✅ Make payment now\n` +
        `✅ Take screenshot immediately\n` +
        `✅ Send within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes`
    );
}

async function sendAlreadyVerifiedMessage(message, state) {
    const productName = state.productName || 'your product';
    
    await message.reply(
        `✅ *ORDER ALREADY VERIFIED!*\n\n` +
        `Your order *${state.orderNumber}* for *${productName}* is already verified and being processed.\n\n` +
        `💰 Amount Paid: ₹${state.amount}\n` +
        `📦 Status: Processing\n\n` +
        `_To place a new order, send *!menu*_`
    );
}

function validateImage(media) {
    const base64Length = media.data.length;
    const fileSizeInBytes = (base64Length * 3) / 4;
    
    if (fileSizeInBytes > VALIDATION_CONFIG.maxImageSize) {
        return {
            isValid: false,
            reason: `Image too large (${(fileSizeInBytes / 1024 / 1024).toFixed(1)}MB). Max size: 5MB`
        };
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validMimeTypes.includes(media.mimetype)) {
        return {
            isValid: false,
            reason: `Invalid format (${media.mimetype}). Please send JPEG, PNG, or WebP`
        };
    }

    return { isValid: true };
}

async function sendNoPendingOrdersMessage(message, customerPhone) {
    await message.reply(
        '❌ *No Pending Orders Found*\n\n' +
        `We couldn't find any pending orders for phone *${customerPhone}*.\n\n` +
        '*Possible reasons:*\n' +
        '1. You have already paid and order is processed\n' +
        '2. Order was cancelled\n' +
        '3. You haven\'t placed an order yet\n\n' +
        '*What to do:*\n' +
        '• Type *Order* to place a new order\n' +
        '• Type *MyOrders* to check order status\n' +
        '• Contact support if you need help\n\n' +
        'Send *!menu* to see available products.'
    );
}

async function sendErrorMessage(message, errorText) {
    await message.reply(errorText);
}

async function sendInvalidImageMessage(message, reason) {
    await message.reply(
        `❌ *Invalid Image*\n\n` +
        `${reason}\n\n` +
        `*Please send:*\n` +
        `• Clear, high-quality screenshot\n` +
        `• JPEG, PNG, or WebP format\n` +
        `• File size under 5MB`
    );
}

async function sendInvalidPaymentScreenshotMessage(message, validation) {
    await message.reply(
        `❌ *Not a Payment Screenshot*\n\n` +
        `This doesn't appear to be a UPI payment screenshot.\n\n` +
        `*Detected:* ${validation.reason}\n` +
        `*Confidence:* ${validation.confidence}%\n` +
        `*Minimum:* 50%\n\n` +
        `*Please send a proper payment screenshot showing:*\n` +
        `✅ Payment amount\n` +
        `✅ Our UPI ID (${VALID_UPI_IDS[0]})\n` +
        `✅ "Payment Successful" message\n` +
        `✅ Transaction ID\n` +
        `✅ Date and Time`
    );
}

async function sendUnreadableScreenshotMessage(message, ocrResult) {
    await message.reply(
        `❌ *Cannot Read Screenshot*\n\n` +
        `The image is too blurry or has insufficient text.\n\n` +
        `*OCR Analysis:*\n` +
        `• Text: ${ocrResult.text.length} characters\n` +
        `• Confidence: ${Math.round(ocrResult.confidence)}%\n` +
        `• Words: ${ocrResult.wordCount}\n\n` +
        `*Please ensure:*\n` +
        `✅ Screenshot is clear and sharp\n` +
        `✅ All transaction text is visible\n` +
        `✅ Text is not too small\n\n` +
        `Take a better screenshot and try again.`
    );
}

async function showPaymentInstructions(message, client) {
    await message.reply(
        `📋 *HOW TO PAY & VERIFY*\n\n` +
        `*Step 1 - Make Payment:*\n` +
        `1. Open UPI app (GPay, PhonePe, PayTM)\n` +
        `2. Send ₹[Your Order Amount] to: ${VALID_UPI_IDS[0]}\n` +
        `3. Ensure payment shows "SUCCESSFUL"\n\n` +
        `*Step 2 - Send Screenshot:*\n` +
        `1. Take clear screenshot\n` +
        `2. Ensure visible:\n` +
        `   • Amount\n` +
        `   • Status: "SUCCESSFUL"\n` +
        `   • To: ${VALID_UPI_IDS[0]}\n` +
        `   • Transaction ID\n` +
        `   • Date & Time\n\n` +
        `*Step 3 - Automatic Verification:*\n` +
        `• We'll verify within seconds\n` +
        `• Payment must be recent (${VALIDATION_CONFIG.recentPaymentThreshold} minutes)\n` +
        `• You'll receive confirmation\n` +
        `• Order will be processed immediately`
    );
}

async function showVerificationHelp(message, client) {
    await message.reply(
        `🔒 *PAYMENT VERIFICATION*\n\n` +
        `*For Customers:*\n` +
        `Send UPI payment screenshot after payment\n` +
        `• Payment must be within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n` +
        `• Screenshot must be clear and readable\n\n` +
        `*Admin Commands:*\n` +
        `• !verify ORDER_NUMBER - Manual verification\n` +
        `• !reject ORDER_NUMBER REASON - Reject payment\n` +
        `• !pending - Show pending verifications\n` +
        `• !invoice ORDER_NUMBER - Generate invoice\n` +
        `• !fraud ORDER_NUMBER REASONS - Mark as fraud\n` +
        `• !stats - Show verification statistics\n` +
        `• !testocr - Test OCR on an image\n` +
        `• !paymenthelp - Payment instructions\n` +
        `• !menu - Start new order\n` +
        `• !clear - Clear verification state`
    );
}

// ========== ADMIN COMMANDS HANDLER ==========

async function handleAdminCommands(message, client, userMessage) {
    try {
        if (userMessage.startsWith('!verify ')) {
            await verifyPaymentCommand(message, client);
            return true;
        }
        else if (userMessage.startsWith('!reject ')) {
            await rejectPaymentCommand(message, client);
            return true;
        }
        else if (userMessage.startsWith('!pending')) {
            await showPendingVerifications(message, client);
            return true;
        }
        else if (userMessage.startsWith('!invoice ')) {
            await generateInvoiceCommand(message, client);
            return true;
        }
        else if (userMessage.startsWith('!fraud ')) {
            await markAsFraudCommand(message, client);
            return true;
        }
        else if (userMessage === '!stats') {
            await showVerificationStats(message, client);
            return true;
        }
        else if (userMessage === '!testocr') {
            await testOCRCommand(message, client);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Admin command error:', error);
        await message.reply('❌ Admin command failed.');
        return true;
    }
}

async function verifyPaymentCommand(message, client) {
    try {
        const parts = message.body.split(' ');
        if (parts.length < 2) {
            return await message.reply('❌ Usage: !verify ORDER_NUMBER');
        }

        const orderNumber = parts[1];
        const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
        if (!verification) {
            return await message.reply(`❌ No payment verification found for order: ${orderNumber}`);
        }

        await apiService.updatePaymentVerificationStatus(verification._id, {
            status: 'verified',
            verifiedBy: 'admin_manual',
            verifiedAt: new Date()
        });

        // Update order status
        await apiService.updateOrderStatus(verification.orderReference, 'confirmed', 'Payment manually verified');
        await apiService.updateOrderPaymentStatus(orderNumber, {
            paymentStatus: 'paid',
            paymentVerified: true,
            verifiedBy: 'admin',
            transactionId: verification.detectedPayment?.transactionId
        });

        await message.reply(`✅ Payment manually verified for order: ${orderNumber}`);
        
    } catch (error) {
        console.error('Verify command error:', error);
        await message.reply('❌ Failed to verify payment.');
    }
}

async function rejectPaymentCommand(message, client) {
    try {
        const parts = message.body.split(' ');
        if (parts.length < 3) {
            return await message.reply('❌ Usage: !reject ORDER_NUMBER REASON');
        }

        const orderNumber = parts[1];
        const reason = parts.slice(2).join(' ');
        const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
        if (!verification) {
            return await message.reply(`❌ No payment verification found for order: ${orderNumber}`);
        }

        await apiService.rejectPaymentVerification(verification._id, reason, 'admin');

        await message.reply(`❌ Payment rejected for order: ${orderNumber}\nReason: ${reason}`);
        
    } catch (error) {
        console.error('Reject command error:', error);
        await message.reply('❌ Failed to reject payment.');
    }
}

async function markAsFraudCommand(message, client) {
    try {
        const parts = message.body.split(' ');
        if (parts.length < 3) {
            return await message.reply('❌ Usage: !fraud ORDER_NUMBER REASONS');
        }

        const orderNumber = parts[1];
        const reasons = parts.slice(2).join(' ');
        const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
        if (!verification) {
            return await message.reply(`❌ No payment verification found for order: ${orderNumber}`);
        }

        await apiService.markPaymentAsFraud(verification._id, reasons.split(',').map(r => r.trim()), 'admin');

        await message.reply(`🚨 Payment marked as fraud for order: ${orderNumber}\nReasons: ${reasons}`);
        
    } catch (error) {
        console.error('Fraud command error:', error);
        await message.reply('❌ Failed to mark payment as fraud.');
    }
}

async function showPendingVerifications(message, client) {
    try {
        const pendingVerifications = await apiService.getPendingPaymentVerifications();
        
        if (pendingVerifications.length === 0) {
            return await message.reply('✅ No pending payment verifications.');
        }

        let response = `📋 *PENDING PAYMENTS (${pendingVerifications.length})*\n\n`;
        
        pendingVerifications.forEach((verification, index) => {
            response += `${index + 1}. *Order:* ${verification.orderNumber}\n`;
            response += `   *Customer:* ${verification.orderDetails?.customerName || 'Unknown'}\n`;
            response += `   *Phone:* ${verification.customerPhone}\n`;
            response += `   *Amount:* ₹${verification.orderDetails?.totalAmount || 'N/A'}\n`;
            response += `   *Products:* ${verification.orderDetails?.productNames || 'N/A'}\n`;
            response += `   *Submitted:* ${new Date(verification.createdAt).toLocaleString()}\n`;
            response += `   *Verify:* !verify ${verification.orderNumber}\n`;
            response += `   *Reject:* !reject ${verification.orderNumber} reason\n\n`;
        });

        await message.reply(response);
        
    } catch (error) {
        console.error('Pending verifications error:', error);
        await message.reply('❌ Failed to fetch pending verifications.');
    }
}

async function generateInvoiceCommand(message, client) {
    try {
        const parts = message.body.split(' ');
        if (parts.length < 2) {
            return await message.reply('❌ Usage: !invoice ORDER_NUMBER');
        }

        const orderNumber = parts[1];
        const order = await apiService.getOrderByNumber(orderNumber);
        
        if (!order) {
            return await message.reply(`❌ No order found with number: ${orderNumber}`);
        }

        // Generate invoice
        await generateAndSendInvoice(order, message);

    } catch (error) {
        console.error('Invoice command error:', error);
        await message.reply('❌ Failed to generate invoice.');
    }
}

async function showVerificationStats(message, client) {
    try {
        const stats = await apiService.getPaymentVerificationStats('week');
        
        const response = 
            `📊 *VERIFICATION STATISTICS*\n\n` +
            `✅ Verified: ${stats.verified || 0}\n` +
            `⏳ Pending: ${stats.pending || 0}\n` +
            `❌ Rejected: ${stats.rejected || 0}\n` +
            `🚨 Fraud: ${stats.fraud || 0}\n` +
            `🤖 Auto: ${stats.autoVerified || 0}\n` +
            `👤 Manual: ${stats.manualVerified || 0}\n` +
            `📊 Success Rate: ${stats.successRate || 0}%\n` +
            `📝 Total: ${stats.total || 0}`;

        await message.reply(response);
        
    } catch (error) {
        console.error('Stats command error:', error);
        await message.reply('❌ Failed to fetch verification statistics.');
    }
}

async function testOCRCommand(message, client) {
    try {
        if (!message.hasMedia) {
            return await message.reply('❌ Please send an image with !testocr command');
        }

        const media = await message.downloadMedia();
        const ocrResult = await performDetailedOCRAnalysis(media.data);
        
        let response = `🔍 *OCR TEST RESULTS*\n\n`;
        response += `*Confidence:* ${Math.round(ocrResult.confidence)}%\n`;
        response += `*Characters:* ${ocrResult.text.length}\n`;
        response += `*Words:* ${ocrResult.wordCount}\n`;
        response += `*Readable:* ${ocrResult.isReadable ? '✅' : '❌'}\n\n`;
        response += `*Extracted Amount:* ₹${ocrResult.analysis.amount || 'Not found'}\n`;
        response += `*UPI ID:* ${ocrResult.analysis.upiId || 'Not found'}\n`;
        response += `*Transaction ID:* ${ocrResult.analysis.transactionId || 'Not found'}\n`;
        response += `*Status:* ${ocrResult.analysis.status}\n`;
        response += `*App:* ${ocrResult.analysis.appName || 'Not found'}\n`;
        response += `*Timestamp:* ${ocrResult.analysis.timestamp || 'Not found'}\n\n`;
        response += `*Time Detection:*\n`;
        
        const detectedTime = extractExactTime(ocrResult.text);
        if (detectedTime) {
            response += `Detected: ${detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
            response += `Current: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
            response += `Difference: ${Math.round(Math.abs(new Date() - detectedTime) / (1000 * 60))} minutes\n`;
        } else {
            response += `No time detected\n`;
        }
        
        response += `\n*First 300 chars:*\n${ocrResult.text.substring(0, 300)}`;

        await message.reply(response);
        
    } catch (error) {
        console.error('Test OCR error:', error);
        await message.reply('❌ OCR test failed.');
    }
}

// Cleanup function
export function cleanupVerificationState() {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    
    for (const [phone, data] of verificationState.entries()) {
        if (now - data.timestamp > twoHours) {
            verificationState.delete(phone);
            userOrderState.delete(phone);
        }
    }
    
    // Cleanup image hash cache
    for (const [hash, timestamp] of imageHashCache.entries()) {
        if (now - timestamp > 24 * 60 * 60 * 1000) { // 24 hours
            imageHashCache.delete(hash);
        }
    }
}

// Get user verification state
export function getUserVerificationState(phone) {
    return verificationState.get(phone);
}

// Check if user is verified
export function isUserVerified(phone) {
    const state = verificationState.get(phone);
    return state ? state.verified : false;
}

export default handlePaymentVerification;