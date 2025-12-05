

// // handlers/paymentVerificationHandler.js - COMPLETE FIXED VERSION
// import apiService from "../../services/apiService.js";
// import notificationManager from "../../services/notifications/notification-manager.js";
// import pkg from 'whatsapp-web.js';
// import Tesseract from 'tesseract.js';

// const { MessageMedia } = pkg;

// // Configuration
// const VALID_UPI_IDS = [
//     'subaask21@oksbi',
//     'posterpro.store@okaxis', 
//     'posterpro.store@paytm',
//     'posterpro.store@axl',
//     'posterpro.store@ybl'
// ];

// const VALIDATION_CONFIG = {
//     amountTolerance: 5,
//     minConfidenceScore: 70,
//     minTextLength: 10,
//     requiredPaymentIndicators: 3,
//     maxImageSize: 5 * 1024 * 1024,
//     recentPaymentThreshold: 24,
//     ocrEngine: {
//         language: 'eng',
//         oem: 1,
//         psm: 3,
//         tessedit_char_whitelist: '0123456789₹Rs.INRabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@-: /,',
//         preserve_interword_spaces: '1'
//     }
// };

// const PAYMENT_INDICATORS = {
//     success: ['successful', 'completed', 'paid', 'sent', 'transferred', 'payment done', 'success', 'approved', 'payment successful'],
//     failure: ['failed', 'rejected', 'cancelled', 'declined', 'error', 'unsuccessful'],
//     amount: ['amount', 'rs', '₹', 'inr', 'rupees', 'total', 'money', 'sent', 'paid', 'pay'],
//     transaction: ['transaction', 'payment', 'upi', 'reference', 'id', 'utr', 'ref', 'txn'],
//     apps: ['gpay', 'phonepe', 'paytm', 'bhim', 'bank', 'upi', 'google pay']
// };

// // Track verification state
// const verificationState = new Map();
// const userOrderState = new Map();

// /**
//  * Main payment verification handler
//  */
// export async function handlePaymentVerification(message, client) {
//     try {
//         const from = message.from;
//         const userPhone = apiService.cleanPhoneNumber(from);
        
//         // Check if user has already completed verification
//         if (verificationState.has(userPhone)) {
//             const state = verificationState.get(userPhone);
//             if (state.verified) {
//                 await sendAlreadyVerifiedMessage(message, state);
//                 return;
//             }
//         }
        
//         if (message.hasMedia) {
//             return await handlePaymentScreenshot(message, client);
//         }

//         const userMessage = message.body.trim().toLowerCase();
        
//         if (userMessage.startsWith('!verify ')) {
//             return await verifyPaymentCommand(message, client);
//         }
//         else if (userMessage.startsWith('!reject ')) {
//             return await rejectPaymentCommand(message, client);
//         }
//         else if (userMessage.startsWith('!pending')) {
//             return await showPendingVerifications(message, client);
//         }
//         else if (userMessage.startsWith('!invoice ')) {
//             return await generateInvoiceCommand(message, client);
//         }
//         else if (userMessage.startsWith('!fraud ')) {
//             return await markAsFraudCommand(message, client);
//         }
//         else if (userMessage === '!paymenthelp') {
//             return await showPaymentInstructions(message, client);
//         }
//         else if (userMessage === '!stats') {
//             return await showVerificationStats(message, client);
//         }
//         else if (userMessage === '!testocr') {
//             return await testOCRCommand(message, client);
//         }
//         else if (userMessage === '!menu' || userMessage === 'menu') {
//             // User wants to start new order - clear verification state
//             verificationState.delete(userPhone);
//             userOrderState.delete(userPhone);
//             await message.reply('🔄 *Starting fresh order process...*\n\nPlease wait for the menu...');
//             // The menu will be handled by orderHandler
//             return;
//         }
//         else if (userMessage === '!clear') {
//             // Admin command to clear state
//             verificationState.delete(userPhone);
//             userOrderState.delete(userPhone);
//             await message.reply('✅ Verification state cleared. You can now send payment screenshot.');
//             return;
//         }
//         else {
//             // Check if user is in post-verification state
//             if (verificationState.has(userPhone) && verificationState.get(userPhone).verified) {
//                 await sendPostVerificationHelp(message, verificationState.get(userPhone));
//             } else {
//                 await showVerificationHelp(message, client);
//             }
//         }

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
//         if (verificationState.has(customerPhone) && verificationState.get(customerPhone).verified) {
//             await sendAlreadyVerifiedMessage(message, verificationState.get(customerPhone));
//             return;
//         }

//         // Get pending orders for this user
//         const pendingOrders = await apiService.getPendingOrdersByPhone(customerPhone);
        
//         if (!pendingOrders || pendingOrders.length === 0) {
//             return await sendNoPendingOrdersMessage(message);
//         }

//         const media = await message.downloadMedia();
        
//         if (!media) {
//             return await sendErrorMessage(message, '❌ Failed to download image. Please try again.');
//         }

//         // Validate image
//         const imageValidation = validateImage(media);
//         if (!imageValidation.isValid) {
//             return await sendInvalidImageMessage(message, imageValidation.reason);
//         }

//         // Quick validation
//         await message.reply('🔍 *Quick validation in progress...*');
//         const quickValidation = await quickImageValidation(media.data);
//         if (!quickValidation.isValid) {
//             return await sendInvalidPaymentScreenshotMessage(message, quickValidation);
//         }

//         // Process payment
//         await processPaymentScreenshot(media.data, customerPhone, client, message, pendingOrders);

//     } catch (error) {
//         console.error('Payment screenshot handling error:', error);
//         await sendErrorMessage(message, '❌ Failed to process payment screenshot. Please try again.');
//     }
// }

// /**
//  * Quick image validation using OCR
//  */
// async function quickImageValidation(imageData) {
//     try {
//         const result = await Tesseract.recognize(
//             Buffer.from(imageData, 'base64'),
//             VALIDATION_CONFIG.ocrEngine.language,
//             { 
//                 ...VALIDATION_CONFIG.ocrEngine,
//                 logger: () => {}
//             }
//         );

//         const text = result.data.text.toLowerCase();
//         const analysis = analyzeTextForPaymentIndicators(text);
        
//         return {
//             isValid: analysis.isPaymentScreenshot,
//             confidence: analysis.confidence,
//             foundIndicators: analysis.foundIndicators,
//             missingIndicators: analysis.missingIndicators,
//             reason: analysis.reason
//         };

//     } catch (error) {
//         return {
//             isValid: false,
//             reason: 'Cannot process image for validation',
//             confidence: 0
//         };
//     }
// }

// /**
//  * Analyze text for payment indicators
//  */
// function analyzeTextForPaymentIndicators(text) {
//     const foundIndicators = [];
//     let score = 0;

//     // Check for payment app indicators
//     PAYMENT_INDICATORS.apps.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 15;
//         }
//     });

//     // Check for transaction indicators
//     PAYMENT_INDICATORS.transaction.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 10;
//         }
//     });

//     // Check for amount indicators
//     PAYMENT_INDICATORS.amount.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 10;
//         }
//     });

//     // Check for success indicators
//     const hasSuccess = PAYMENT_INDICATORS.success.some(indicator => text.includes(indicator));
//     const hasFailure = PAYMENT_INDICATORS.failure.some(indicator => text.includes(indicator));

//     if (hasSuccess) {
//         foundIndicators.push('success');
//         score += 25;
//     }

//     if (hasFailure) {
//         foundIndicators.push('failure');
//         score -= 40;
//     }

//     // Check for UPI ID patterns
//     const hasUPI = /@(?:oksbi|okaxis|paytm|axl|ybl)/i.test(text);
//     if (hasUPI) {
//         foundIndicators.push('upi_detected');
//         score += 15;
//     }

//     // Determine if it's a payment screenshot
//     const isPaymentScreenshot = score >= 35 && foundIndicators.length >= VALIDATION_CONFIG.requiredPaymentIndicators;

//     return {
//         isPaymentScreenshot,
//         confidence: Math.min(100, Math.max(0, score)),
//         foundIndicators,
//         reason: isPaymentScreenshot ? 
//             `Valid payment screenshot detected (${foundIndicators.length} indicators)` :
//             `Not a payment screenshot (only ${foundIndicators.length} payment indicators found)`
//     };
// }

// /**
//  * Process payment screenshot with full analysis
//  */
// async function processPaymentScreenshot(imageData, customerPhone, client, originalMessage, pendingOrders) {
//     try {
//         await originalMessage.reply('🔍 *Analyzing Payment Screenshot...*\n\nPlease wait while we verify your payment details.');

//         // Perform detailed OCR analysis
//         const ocrResult = await performDetailedOCRAnalysis(imageData);
        
//         if (!ocrResult.isReadable) {
//             return await sendUnreadableScreenshotMessage(originalMessage, ocrResult);
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
//             await processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone);
//         } else {
//             await handleFailedVerification(verificationResult, client, originalMessage);
//         }

//     } catch (error) {
//         console.error('Payment processing error:', error);
//         await sendErrorMessage(originalMessage, '❌ Error processing payment. Please try again or contact support.');
//     }
// }

// /**
//  * Perform detailed OCR analysis
//  */
// async function performDetailedOCRAnalysis(imageData) {
//     try {
//         console.log('🔍 Starting detailed OCR analysis...');
//         const startTime = Date.now();

//         const result = await Tesseract.recognize(
//             Buffer.from(imageData, 'base64'),
//             VALIDATION_CONFIG.ocrEngine.language,
//             {
//                 ...VALIDATION_CONFIG.ocrEngine,
//                 logger: m => {
//                     if (m.status === 'recognizing text') {
//                         const progress = Math.round(m.progress * 100);
//                         console.log(`📊 OCR Progress: ${progress}%`);
//                     }
//                 }
//             }
//         );

//         const processingTime = Date.now() - startTime;
//         const text = result.data.text;
//         const words = result.data.words || [];
        
//         console.log(`✅ OCR completed in ${processingTime}ms`);
//         console.log(`📝 Text extracted: ${text.length} characters, ${words.length} words`);
//         console.log('📄 FULL OCR TEXT:\n' + text);
//         console.log('\n=== END OF OCR TEXT ===\n');

//         return {
//             text: text,
//             confidence: result.data.confidence,
//             words: words,
//             isReadable: text.length >= VALIDATION_CONFIG.minTextLength && result.data.confidence > 30,
//             wordCount: words.length,
//             processingTime: processingTime,
//             analysis: analyzePaymentText(text)
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
//  * Analyze payment text from OCR
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

//     console.log('🔍 Payment Analysis Result:', analysis);
//     return analysis;
// }

// /**
//  * SMART AMOUNT EXTRACTION - FIXED VERSION
//  */
// function extractAmount(originalText, lowerText) {
//     console.log('💰 Starting SMART amount extraction...');
    
//     // Remove phone numbers first
//     let cleanText = originalText.replace(/\+\d{10,}/g, ' ');
//     cleanText = cleanText.replace(/\b\d{10}\b/g, ' ');
    
//     // Remove dates
//     cleanText = cleanText.replace(/\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi, ' ');
    
//     // Remove times
//     cleanText = cleanText.replace(/\d{1,2}:\d{2}\s*(?:am|pm)?/gi, ' ');
    
//     console.log('🧹 Cleaned text after removing phone/dates:', cleanText);
    
//     // Strategy 1: Look for amount patterns with "Pay" keyword
//     const payPatterns = [
//         /pay\s*(\d+)/gi,
//         /pay\s*again\s*(\d+)/gi,
//         /pay\s*₹\s*(\d+)/gi,
//         /pay\s*rs\.?\s*(\d+)/gi,
//         /(\d+)\s*pay/gi,
//         /(\d+)\s*pay\s*again/gi
//     ];
    
//     for (const pattern of payPatterns) {
//         const matches = [...cleanText.matchAll(pattern)];
//         for (const match of matches) {
//             if (match[1]) {
//                 const amount = parseInt(match[1]);
//                 if (!isNaN(amount) && amount >= 1 && amount <= 10000) {
//                     console.log(`🎯 Found amount via PAY pattern "${pattern}": ₹${amount}`);
//                     return amount;
//                 }
//             }
//         }
//     }
    
//     // Strategy 2: Look for standalone numbers that could be amounts
//     const standaloneNumbers = [...cleanText.matchAll(/\b(\d{1,4})\b/g)];
//     const candidateAmounts = [];
    
//     for (const match of standaloneNumbers) {
//         if (match[1]) {
//             const amount = parseInt(match[1]);
            
//             if (!isNaN(amount) && amount >= 10 && amount <= 5000) {
//                 const start = Math.max(0, match.index - 20);
//                 const end = Math.min(cleanText.length, match.index + 20);
//                 const context = cleanText.substring(start, end).toLowerCase();
                
//                 const isLikelyAmount = 
//                     context.includes('pay') ||
//                     context.includes('₹') ||
//                     context.includes('rs') ||
//                     context.includes('amount') ||
//                     context.includes('sent') ||
//                     context.includes('paid') ||
//                     (amount % 5 === 0 || amount % 10 === 0);
                
//                 if (isLikelyAmount) {
//                     candidateAmounts.push({
//                         amount: amount,
//                         context: context,
//                         position: match.index
//                     });
//                 }
//             }
//         }
//     }
    
//     if (candidateAmounts.length > 0) {
//         console.log('📊 Candidate amounts found:');
//         candidateAmounts.forEach(candidate => {
//             console.log(`   ₹${candidate.amount} - Context: "${candidate.context}"`);
//         });
        
//         candidateAmounts.sort((a, b) => a.position - b.position);
        
//         const selectedAmount = candidateAmounts[0].amount;
//         console.log(`🎯 Selected early-occurring amount: ₹${selectedAmount}`);
//         return selectedAmount;
//     }
    
//     // Strategy 3: Look for any number in the entire text that makes sense
//     const allNumbers = [...originalText.matchAll(/\b(\d{1,4})\b/g)];
//     const frequency = {};
    
//     for (const match of allNumbers) {
//         if (match[1]) {
//             const amount = parseInt(match[1]);
//             if (!isNaN(amount) && amount >= 10 && amount <= 5000) {
//                 frequency[amount] = (frequency[amount] || 0) + 1;
//             }
//         }
//     }
    
//     if (Object.keys(frequency).length > 0) {
//         const sortedAmounts = Object.entries(frequency)
//             .sort(([,a], [,b]) => b - a)
//             .map(([amount]) => parseInt(amount));
        
//         const mostFrequent = sortedAmounts[0];
//         console.log(`🎯 Selected most frequent amount: ₹${mostFrequent}`);
//         return mostFrequent;
//     }
    
//     // Strategy 4: Look for "20 Pay again" pattern specifically
//     const payAgainMatch = originalText.match(/(\d+)\s*Pay\s*again/i);
//     if (payAgainMatch && payAgainMatch[1]) {
//         const amount = parseInt(payAgainMatch[1]);
//         if (!isNaN(amount) && amount >= 1) {
//             console.log(`🎯 Found amount in "Pay again" pattern: ₹${amount}`);
//             return amount;
//         }
//     }
    
//     console.log('⚠️ No reasonable amount found in text');
//     return null;
// }

// /**
//  * Extract UPI ID from text
//  */
// function extractUPIId(text) {
//     const upiPatterns = [
//         /[\w.-]+@(?:oksbi|okaxis|okhdfc|okicici|paytm|axl|ybl)/gi,
//         /[\w.-]+@[\w.]+/g,
//         /to:\s*([\w.-]+@[\w.]+)/gi,
//         /google pay.*?([\w.-]+@[\w.]+)/gi
//     ];

//     for (const pattern of upiPatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             for (const match of matches) {
//                 let upi = match.replace(/^to:\s*/gi, '').trim();
//                 upi = upi.replace(/^google pay.*?/gi, '').trim();
                
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
//  * Extract transaction ID from text
//  */
// function extractTransactionId(text) {
//     const transactionPatterns = [
//         /transaction\s*(?:id|no)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
//         /txn?\s*(?:id|no)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
//         /ref\s*(?:no|number|id)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
//         /([A-Z0-9]{12,20})(?:\s|$)/g,
//         /upi transaction id\s*([a-zA-Z0-9]{8,20})/gi,
//         /google transaction id\s*([a-zA-Z0-9]{8,20})/gi
//     ];

//     for (const pattern of transactionPatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             const txnId = matches[0].replace(/[^a-zA-Z0-9]/gi, '').trim();
//             if (txnId.length >= 8) {
//                 console.log(`✅ Found Transaction ID: ${txnId}`);
//                 return txnId;
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
//         /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
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
    
//     if (text.includes('completed')) {
//         console.log(`✅ Payment Status: Success (found "completed")`);
//         return 'success';
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
//         { name: 'iob', patterns: ['indian overseas bank', 'iob'] },
//         { name: 'pnb', patterns: ['pnb', 'punjab national bank'] }
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
//         'gpay': ['gpay', 'google pay', 'google pay'],
//         'phonepe': ['phonepe'],
//         'paytm': ['paytm'],
//         'bhim': ['bhim', 'bhim upi']
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
//  * Find and validate payment against orders - FIXED MATCHING
//  */
// async function findAndValidatePayment(ocrResult, pendingOrders) {
//     const validation = {
//         isValid: false,
//         confidence: 0,
//         matchedOrder: null,
//         details: {},
//         errors: [],
//         warnings: [],
//         autoVerifiable: true
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

//     // Filter only TRULY PENDING orders (not processing, not completed)
//     const trulyPendingOrders = pendingOrders.filter(order => {
//         const status = order.status?.toLowerCase();
//         return status === 'pending' || 
//                status === 'payment_pending' || 
//                status === 'awaiting_payment' ||
//                !status; // If no status, assume pending
//     });

//     if (trulyPendingOrders.length === 0) {
//         validation.errors.push('❌ No pending orders found. Your orders may already be verified.');
//         return validation;
//     }

//     // Show orders with their ACTUAL PRODUCT NAMES
//     console.log('📋 Pending orders with product details:');
//     trulyPendingOrders.slice(0, 5).forEach((order, index) => {
//         const productNames = order.items?.map(item => item.productName).join(', ') || 'Unknown';
//         console.log(`  ${index + 1}. Order: ${order.orderNumber}, Amount: ₹${order.totalPrice}, Products: ${productNames}`);
//     });

//     // Validate payment status
//     if (paymentStatus !== 'success') {
//         validation.errors.push('❌ Payment status not successful');
//         validation.autoVerifiable = false;
//         console.log('❌ Payment status validation failed');
//     }

//     // If no amount detected, we can't proceed
//     if (!extractedAmount) {
//         validation.errors.push('❌ Could not detect payment amount in screenshot');
//         validation.warnings.push('💡 Please ensure the payment amount (₹) is clearly visible in the screenshot');
//         validation.autoVerifiable = false;
//         console.log('❌ No amount detected in OCR');
//         return validation;
//     }

//     console.log(`💰 Looking for order matching amount: ₹${extractedAmount}`);
    
//     // Find matching order by amount - EXACT MATCHING ONLY
//     let matchedOrder = null;
//     let matchType = 'none';
//     let amountDifference = Infinity;
    
//     for (const order of trulyPendingOrders) {
//         const orderAmount = order.totalPrice;
//         const diff = Math.abs(extractedAmount - orderAmount);
        
//         console.log(`   Comparing: Paid ₹${extractedAmount} vs Order ${order.orderNumber}: ₹${orderAmount}, Diff: ₹${diff}`);
        
//         // Check for exact match (within ₹5 tolerance)
//         if (diff <= VALIDATION_CONFIG.amountTolerance) {
//             if (diff < amountDifference) {
//                 matchedOrder = order;
//                 matchType = diff === 0 ? 'exact' : 'close';
//                 amountDifference = diff;
                
//                 const productNames = order.items?.map(item => item.productName).join(', ') || 'Unknown';
//                 console.log(`   🎯 ${matchType.toUpperCase()} MATCH FOUND! Order: ${order.orderNumber}, Products: ${productNames}`);
                
//                 if (diff === 0) {
//                     break;
//                 }
//             }
//         }
//     }

//     if (!matchedOrder) {
//         const errorMsg = `❌ No matching order found for payment of ₹${extractedAmount}`;
//         validation.errors.push(errorMsg);
        
//         // Show user their pending orders with product names
//         if (trulyPendingOrders.length > 0) {
//             validation.warnings.push(`📋 Your pending orders:`);
//             trulyPendingOrders.slice(0, 3).forEach(order => {
//                 const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
//                 validation.warnings.push(`   • ${order.orderNumber}: ${productNames} - ₹${order.totalPrice}`);
//             });
            
//             validation.warnings.push(`💡 Please pay exactly ₹${trulyPendingOrders[0].totalPrice} for ${trulyPendingOrders[0].items?.[0]?.productName || 'your order'}`);
//         }
        
//         console.log('❌ No matching order found for amount:', extractedAmount);
//         return validation;
//     }

//     validation.matchedOrder = matchedOrder;
    
//     // Get actual product names for the matched order
//     const productNames = matchedOrder.items?.map(item => item.productName).join(', ') || 'Product';
//     console.log(`✅ Matched Order: ${matchedOrder.orderNumber}, Amount: ₹${matchedOrder.totalPrice}, Products: ${productNames}, Match Type: ${matchType}`);

//     // Store product details for later use in messages
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
//         console.log('❌ UPI validation failed');
//     } else {
//         console.log('✅ UPI validation passed');
//     }

//     // Validate amount match details
//     const amountValidation = {
//         isValid: amountDifference <= VALIDATION_CONFIG.amountTolerance,
//         expected: matchedOrder.totalPrice,
//         found: extractedAmount,
//         difference: amountDifference,
//         matchType: matchType
//     };
    
//     validation.details.amount = amountValidation;
    
//     if (!amountValidation.isValid) {
//         validation.errors.push(`❌ Amount mismatch: Paid ₹${extractedAmount}, Expected ₹${matchedOrder.totalPrice} (Difference: ₹${amountDifference})`);
//         console.log('❌ Amount validation failed');
//     } else {
//         console.log('✅ Amount validation passed');
//     }

//     // Calculate confidence score
//     validation.confidence = calculateConfidenceScore(validation);
    
//     // Determine if payment is valid
//     validation.isValid = 
//         validation.errors.length === 0 && 
//         validation.confidence >= VALIDATION_CONFIG.minConfidenceScore &&
//         paymentStatus === 'success' &&
//         validation.autoVerifiable;

//     console.log(`📊 Final Validation Result:`, {
//         isValid: validation.isValid,
//         confidence: validation.confidence,
//         matchType: matchType,
//         amountDifference: amountDifference,
//         errors: validation.errors.length,
//         autoVerifiable: validation.autoVerifiable
//     });

//     return validation;
// }

// /**
//  * Validate UPI ID
//  */
// function validateUPIId(extractedUPI) {
//     if (!extractedUPI) {
//         return { isValid: false, found: 'Not found' };
//     }

//     const cleanExtracted = extractedUPI.toLowerCase().replace(/[@.\s]/g, '');
    
//     for (const validUPI of VALID_UPI_IDS) {
//         const cleanValid = validUPI.toLowerCase().replace(/[@.\s]/g, '');
        
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
//     }

//     return { isValid: false, found: extractedUPI };
// }

// /**
//  * Calculate confidence score
//  */
// function calculateConfidenceScore(validation) {
//     let score = 0;

//     // Base scores
//     if (validation.details.amount.matchType === 'exact') {
//         score += 50;
//     } else if (validation.details.amount.matchType === 'close') {
//         score += 40;
//     }
    
//     if (validation.details.upi.isValid) {
//         if (validation.details.upi.matchType === 'exact') {
//             score += 30;
//         } else {
//             score += 20;
//         }
//     }
    
//     // Penalties
//     if (validation.errors.length > 0) {
//         score -= validation.errors.length * 10;
//     }

//     // Ensure score is within bounds
//     return Math.max(0, Math.min(100, Math.round(score)));
// }

// /**
//  * Process successful verification - FIXED PRODUCT DETAILS
//  */
// async function processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone) {
//     try {
//         const order = verificationResult.matchedOrder;
//         const productNames = verificationResult.matchedOrder.productDetails?.names || 'Product';
        
//         console.log(`✅ Processing successful verification for order: ${order.orderNumber}, Product: ${productNames}`);

//         // Create payment verification record FIRST
//         const paymentVerification = await apiService.createPaymentVerification({
//             orderNumber: order.orderNumber,
//             customerPhone: customerPhone,
//             orderReference: order._id,
//             orderDetails: {
//                 totalAmount: order.totalPrice,
//                 items: order.items,
//                 productNames: productNames,
//                 shippingAddress: order.shippingAddress,
//                 pincode: order.pincode
//             },
//             paymentProof: {
//                 imageData: imageData,
//                 mimeType: 'image/jpeg'
//             },
//             ocrAnalysis: {
//                 extractedText: ocrResult.text.substring(0, 1000),
//                 confidenceScore: ocrResult.confidence,
//                 extractedAmount: ocrResult.analysis.amount
//             },
//             detectedPayment: {
//                 amount: ocrResult.analysis.amount,
//                 upiId: ocrResult.analysis.upiId,
//                 transactionId: ocrResult.analysis.transactionId,
//                 transactionTime: new Date(),
//                 status: 'success',
//                 appName: ocrResult.analysis.appName
//             },
//             validationResults: {
//                 amountMatch: verificationResult.details.amount.isValid,
//                 upiMatch: verificationResult.details.upi.isValid,
//                 confidenceScore: verificationResult.confidence
//             },
//             status: 'verified'
//         });

//         if (!paymentVerification) {
//             throw new Error('Failed to create payment verification record');
//         }

//         console.log('✅ Payment verification record created:', paymentVerification._id);

//         // Auto-verify the payment
//         const verificationResultForAPI = {
//             confidence: verificationResult.confidence,
//             isVerified: true,
//             verificationMethod: 'auto_ocr',
//             matchedOrder: verificationResult.matchedOrder
//         };
        
//         const autoVerifyResult = await apiService.verifyPaymentAutomatically(
//             paymentVerification._id, 
//             verificationResultForAPI
//         );
        
//         if (!autoVerifyResult) {
//             console.warn('⚠️ Auto-verification may have failed, but continuing with order update');
//         }

//         // Update order status
//         console.log('🔄 Updating order status for:', order._id);
        
//         try {
//             const orderUpdateResult = await apiService.confirmOrderPayment(order._id, {
//                 paymentVerified: true,
//                 verificationId: paymentVerification._id,
//                 status: 'processing'
//             });
            
//             console.log('✅ Order status update result:', orderUpdateResult);
//         } catch (updateError) {
//             console.warn('⚠️ Order status update failed:', updateError.message);
            
//             // Try alternative method
//             try {
//                 const altUpdateResult = await apiService.updateOrderPaymentStatus(order._id, 'paid');
//                 console.log('✅ Alternative order update result:', altUpdateResult);
//             } catch (altError) {
//                 console.error('❌ All order update methods failed:', altError.message);
//             }
//         }

//         // Store user verification state WITH CORRECT PRODUCT DETAILS
//         verificationState.set(customerPhone, {
//             verified: true,
//             orderId: order._id,
//             orderNumber: order.orderNumber,
//             amount: order.totalPrice,
//             productName: productNames,
//             items: order.items,
//             timestamp: Date.now()
//         });

//         // Store order details for later reference
//         userOrderState.set(customerPhone, {
//             orderNumber: order.orderNumber,
//             productName: productNames,
//             items: order.items,
//             amount: order.totalPrice
//         });

//         // Send success messages with CORRECT PRODUCT DETAILS
//         await sendSuccessMessages(order, verificationResult, client, originalMessage, productNames);

//         console.log(`🎉 Payment verification completed successfully for ${productNames}`);

//     } catch (error) {
//         console.error('Successful verification processing error:', error);
        
//         // Still send success message to user
//         await originalMessage.reply(
//             '✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n' +
//             'Your payment has been verified and your order is being processed.\n\n' +
//             'If you have any questions, please contact support.'
//         );
//     }
// }

// /**
//  * Send success messages to customer - FIXED PRODUCT DETAILS DISPLAY
//  */
// async function sendSuccessMessages(order, verificationResult, client, originalMessage, productNames) {
//     const confidence = Math.round(verificationResult.confidence);
//     const customerPhone = apiService.cleanPhoneNumber(originalMessage.from);
    
//     // Get ACTUAL product details from the matched order
//     const actualProductNames = productNames || order.items?.map(item => item.productName).join(', ') || 'Your Product';
    
//     // Build order items text
//     let orderItemsText = '';
//     if (order.items && order.items.length > 0) {
//         orderItemsText = `📝 *Order Items:*\n`;
//         order.items.forEach(item => {
//             const itemTotal = (item.price || 0) * (item.quantity || 1);
//             const productName = item.productName || 'Product';
//             orderItemsText += `• ${productName} x ${item.quantity || 1} - ₹${itemTotal}\n`;
//         });
//         orderItemsText += `\n`;
//     }

//     // Immediate confirmation with CORRECT PRODUCT DETAILS
//     let successMessage = 
//         `✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n` +
//         `🧾 *Order Number:* ${order.orderNumber}\n` +
//         `📦 *Product:* ${actualProductNames}\n` +
//         `💰 *Amount Paid:* ₹${order.totalPrice}\n` +
//         `🎯 *Verification Score:* ${confidence}%\n` +
//         `📊 *Status:* Order Confirmed & Processing\n\n` +
//         `*Your order is now being processed.*\n\n` +
//         orderItemsText +
//         `🚚 *What Happens Next:*\n` +
//         `• Order processing: 24-48 hours\n` +
//         `• Quality check & packaging\n` +
//         `• Shipping confirmation with tracking\n` +
//         `• Delivery: 3-5 business days\n\n` +
//         `📞 *Customer Support:*\n` +
//         `For any queries, simply reply to this message.\n\n` +
//         `🎉 *THANK YOU FOR YOUR PURCHASE!*\n\n` +
//         `_To place a new order, send *!menu*_`;
    
//     await originalMessage.reply(successMessage);

//     // Clear verification state after 2 hours
//     setTimeout(() => {
//         if (verificationState.has(customerPhone)) {
//             verificationState.delete(customerPhone);
//             userOrderState.delete(customerPhone);
//             console.log(`🔄 Cleared verification state for: ${customerPhone}`);
//         }
//     }, 2 * 60 * 60 * 1000); // 2 hours
// }

// /**
//  * Handle failed verification
//  */
// async function handleFailedVerification(verificationResult, client, originalMessage) {
//     const order = verificationResult.matchedOrder;
    
//     let errorMessage = `❌ *PAYMENT VERIFICATION FAILED*\n\n`;
    
//     errorMessage += `*Verification Score:* ${Math.round(verificationResult.confidence)}%\n\n`;
    
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

//     errorMessage += `*How to Fix This:*\n` +
//         `1. ✅ Pay exactly ₹${order?.totalPrice || 'the order amount'}\n` +
//         `2. ✅ Use our official UPI: ${VALID_UPI_IDS[0]}\n` +
//         `3. ✅ Ensure payment shows "SUCCESSFUL" or "COMPLETED"\n` +
//         `4. ✅ Take clear screenshot with all details visible\n` +
//         `5. ✅ Send screenshot immediately after payment\n\n` +
//         `*Required in Screenshot:*\n` +
//         `• Payment amount (₹${order?.totalPrice || 'XXX'})\n` +
//         `• Our UPI ID (${VALID_UPI_IDS[0]})\n` +
//         `• Transaction status: "SUCCESSFUL"\n` +
//         `• Transaction/Reference ID\n` +
//         `• Date and time\n\n` +
//         `Please try again with the correct payment details.`;

//     await originalMessage.reply(errorMessage);
// }

// // ========== HELPER FUNCTIONS ==========

// /**
//  * Send message when user is already verified
//  */
// async function sendAlreadyVerifiedMessage(message, state) {
//     const productName = state.productName || 'your product';
    
//     await message.reply(
//         `✅ *ORDER ALREADY VERIFIED!*\n\n` +
//         `Your order *${state.orderNumber}* for *${productName}* is already verified and being processed.\n\n` +
//         `💰 Amount Paid: ₹${state.amount}\n` +
//         `📦 Status: Processing\n\n` +
//         `_To place a new order, send *!menu*_\n` +
//         `_For order status updates, contact support_`
//     );
// }

// /**
//  * Send post-verification help message
//  */
// async function sendPostVerificationHelp(message, state) {
//     const productName = state.productName || 'your product';
    
//     await message.reply(
//         `📦 *ORDER PROCESSING*\n\n` +
//         `Your order *${state.orderNumber}* for *${productName}* is being processed.\n\n` +
//         `✅ Payment verified successfully\n` +
//         `🔄 Currently: Quality check & packaging\n` +
//         `📦 Next: Shipping with tracking\n\n` +
//         `_To place a new order, send *!menu*_\n` +
//         `_For order status, contact support_`
//     );
// }

// function validateImage(media) {
//     const base64Length = media.data.length;
//     const fileSizeInBytes = (base64Length * 3) / 4;
    
//     if (fileSizeInBytes > VALIDATION_CONFIG.maxImageSize) {
//         return {
//             isValid: false,
//             reason: `Image too large (${(fileSizeInBytes / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`
//         };
//     }

//     const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     if (!validMimeTypes.includes(media.mimetype)) {
//         return {
//             isValid: false,
//             reason: `Invalid image format (${media.mimetype}). Please send JPEG, PNG, or WebP.`
//         };
//     }

//     return { isValid: true };
// }

// async function sendNoPendingOrdersMessage(message) {
//     await message.reply(
//         '❌ *No Pending Orders Found*\n\n' +
//         'You don\'t have any pending orders requiring payment.\n\n' +
//         '*What to do:*\n' +
//         '1. Place a new order first\n' +
//         '2. Complete the order process\n' +
//         '3. Then send payment screenshot\n\n' +
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
//         `*Confidence:* ${validation.confidence}%\n\n` +
//         `*Please send a proper payment screenshot from:*\n` +
//         `• Google Pay (GPay)\n` +
//         `• PhonePe\n` +
//         `• PayTM\n` +
//         `• BHIM UPI\n\n` +
//         `Take a clear screenshot and try again.`
//     );
// }

// async function sendUnreadableScreenshotMessage(message, ocrResult) {
//     await message.reply(
//         `❌ *Cannot Read Screenshot*\n\n` +
//         `The image is too blurry or has insufficient text.\n\n` +
//         `*OCR Analysis:*\n` +
//         `• Text found: ${ocrResult.text.length} characters\n` +
//         `• Confidence: ${Math.round(ocrResult.confidence)}%\n` +
//         `• Words detected: ${ocrResult.wordCount}\n\n` +
//         `*Please ensure:*\n` +
//         `✅ Screenshot is clear and high quality\n` +
//         `✅ All transaction text is visible\n` +
//         `✅ Text is not too small\n\n` +
//         `Take a better screenshot and try again.`
//     );
// }

// async function showPaymentInstructions(message, client) {
//     await message.reply(
//         `📋 *HOW TO MAKE PAYMENT & VERIFY*\n\n` +
//         `*Step 1 - Make Payment:*\n` +
//         `1. Open your UPI app (GPay, PhonePe, PayTM)\n` +
//         `2. Send ₹[Your Order Amount] to: ${VALID_UPI_IDS[0]}\n` +
//         `3. Ensure payment shows "SUCCESSFUL" or "COMPLETED"\n\n` +
//         `*Step 2 - Send Screenshot:*\n` +
//         `1. Take screenshot of successful payment\n` +
//         `2. Ensure these are visible:\n` +
//         `   • Amount: ₹[Your Order Amount]\n` +
//         `   • Status: "SUCCESSFUL" or "COMPLETED"\n` +
//         `   • To: ${VALID_UPI_IDS[0]}\n` +
//         `   • Transaction/Reference ID\n\n` +
//         `*Step 3 - Automatic Verification:*\n` +
//         `• We'll verify within seconds\n` +
//         `• You'll receive confirmation\n` +
//         `• Order will be processed immediately`
//     );
// }

// async function showVerificationHelp(message, client) {
//     await message.reply(
//         `🔒 *PAYMENT VERIFICATION SYSTEM*\n\n` +
//         `*For Customers:*\n` +
//         `Simply send UPI payment screenshot after payment\n\n` +
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

// // ========== ADMIN COMMANDS ==========

// /**
//  * Admin command: Verify payment manually
//  */
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
//             verifiedBy: 'admin_manual'
//         });

//         // Update order status
//         try {
//             await apiService.confirmOrderPayment(verification.orderReference, {
//                 paymentVerified: true,
//                 verificationId: verification._id,
//                 status: 'processing'
//             });
//         } catch (error) {
//             console.warn('⚠️ Order status update in manual verify failed:', error.message);
//         }

//         await message.reply(`✅ Payment manually verified for order: ${orderNumber}`);
        
//     } catch (error) {
//         console.error('Verify command error:', error);
//         await message.reply('❌ Failed to verify payment.');
//     }
// }

// /**
//  * Admin command: Reject payment
//  */
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

// /**
//  * Admin command: Mark payment as fraud
//  */
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

//         await apiService.markPaymentAsFraud(verification._id, [reasons], 'admin');

//         await message.reply(`🚨 Payment marked as fraud for order: ${orderNumber}\nReasons: ${reasons}`);
        
//     } catch (error) {
//         console.error('Fraud command error:', error);
//         await message.reply('❌ Failed to mark payment as fraud.');
//     }
// }

// /**
//  * Admin command: Show pending verifications
//  */
// async function showPendingVerifications(message, client) {
//     try {
//         const pendingVerifications = await apiService.getPendingPaymentVerifications();
        
//         if (pendingVerifications.length === 0) {
//             return await message.reply('✅ No pending payment verifications.');
//         }

//         let response = `📋 *PENDING PAYMENT VERIFICATIONS (${pendingVerifications.length})*\n\n`;
        
//         pendingVerifications.forEach((verification, index) => {
//             response += `${index + 1}. *Order:* ${verification.orderNumber}\n`;
//             response += `   *Customer:* ${formatIndianPhoneNumber(verification.customerPhone)}\n`;
//             response += `   *Amount:* ₹${verification.orderDetails?.totalAmount || 'N/A'}\n`;
//             response += `   *Products:* ${verification.orderDetails?.productNames || 'N/A'}\n`;
//             response += `   *Confidence:* ${Math.round(verification.validationResults?.confidenceScore || 0)}%\n`;
//             response += `   *Verify:* !verify ${verification.orderNumber}\n`;
//             response += `   *Reject:* !reject ${verification.orderNumber} reason\n\n`;
//         });

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Pending verifications error:', error);
//         await message.reply('❌ Failed to fetch pending verifications.');
//     }
// }

// /**
//  * Admin command: Generate invoice
//  */
// async function generateInvoiceCommand(message, client) {
//     try {
//         const parts = message.body.split(' ');
//         if (parts.length < 2) {
//             return await message.reply('❌ Usage: !invoice ORDER_NUMBER');
//         }

//         const orderNumber = parts[1];
//         const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
//         if (!verification) {
//             return await message.reply(`❌ No verified payment found for order: ${orderNumber}`);
//         }

//         await message.reply(`📄 Invoice generated for order: ${orderNumber}`);
        
//     } catch (error) {
//         console.error('Invoice command error:', error);
//         await message.reply('❌ Failed to generate invoice.');
//     }
// }

// /**
//  * Admin command: Show verification stats
//  */
// async function showVerificationStats(message, client) {
//     try {
//         const stats = await apiService.getPaymentVerificationStats('week');
        
//         const total = (stats.verified || 0) + (stats.pending || 0) + (stats.rejected || 0);
//         const successRate = total > 0 ? Math.round(((stats.verified || 0) / total) * 100) : 0;
        
//         const response = 
//             `📊 *PAYMENT VERIFICATION STATISTICS*\n\n` +
//             `✅ Verified: ${stats.verified || 0}\n` +
//             `⏳ Pending: ${stats.pending || 0}\n` +
//             `❌ Rejected: ${stats.rejected || 0}\n` +
//             `📈 Success Rate: ${successRate}%\n` +
//             `📝 Total: ${total}`;

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Stats command error:', error);
//         await message.reply('❌ Failed to fetch verification statistics.');
//     }
// }

// /**
//  * Admin command: Test OCR
//  */
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
//         response += `*Words:* ${ocrResult.wordCount}\n\n`;
//         response += `*Extracted Amount:* ₹${ocrResult.analysis.amount || 'Not found'}\n`;
//         response += `*UPI ID:* ${ocrResult.analysis.upiId || 'Not found'}\n`;
//         response += `*Status:* ${ocrResult.analysis.status}\n`;
//         response += `*App:* ${ocrResult.analysis.appName || 'Not found'}\n\n`;
//         response += `*First 500 chars:*\n${ocrResult.text.substring(0, 500)}${ocrResult.text.length > 500 ? '...' : ''}`;

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Test OCR error:', error);
//         await message.reply('❌ OCR test failed.');
//     }
// }

// // Export cleanup function
// export function cleanupVerificationState() {
//     const now = Date.now();
//     const twoHours = 2 * 60 * 60 * 1000;
    
//     for (const [phone, data] of verificationState.entries()) {
//         if (now - data.timestamp > twoHours) {
//             verificationState.delete(phone);
//             userOrderState.delete(phone);
//         }
//     }
// }

// // Get user verification state (for other handlers)
// export function getUserVerificationState(phone) {
//     return verificationState.get(phone);
// }

// // Check if user is verified
// export function isUserVerified(phone) {
//     const state = verificationState.get(phone);
//     return state ? state.verified : false;
// }

// export default handlePaymentVerification;




// // handlers/paymentVerificationHandler.js - PROFESSIONAL VERSION
// import apiService from "../../services/apiService.js";
// import notificationManager from "../../services/notifications/notification-manager.js";
// import pkg from 'whatsapp-web.js';
// import Tesseract from 'tesseract.js';

// const { MessageMedia } = pkg;

// // Configuration
// const VALID_UPI_IDS = [
//     'subaask21@oksbi',
//     'posterpro.store@okaxis', 
//     'posterpro.store@paytm',
//     'posterpro.store@axl',
//     'posterpro.store@ybl'
// ];

// const VALIDATION_CONFIG = {
//     amountTolerance: 5, // ₹5 tolerance
//     minConfidenceScore: 85, // Increased from 70 for stricter validation
//     minTextLength: 15,
//     requiredPaymentIndicators: 4,
//     maxImageSize: 5 * 1024 * 1024,
//     recentPaymentThreshold: 10, // 10 minutes window for payment
//     ocrEngine: {
//         language: 'eng',
//         oem: 1,
//         psm: 3,
//         tessedit_char_whitelist: '0123456789₹Rs.INRabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@-: /,()',
//         preserve_interword_spaces: '1'
//     }
// };

// const PAYMENT_INDICATORS = {
//     success: ['successful', 'completed', 'paid', 'sent', 'transferred', 'payment done', 'success', 'approved', 'payment successful', 'money sent'],
//     failure: ['failed', 'rejected', 'cancelled', 'declined', 'error', 'unsuccessful', 'payment failed'],
//     amount: ['amount', 'rs', '₹', 'inr', 'rupees', 'total', 'money', 'sent', 'paid', 'pay'],
//     transaction: ['transaction', 'payment', 'upi', 'reference', 'id', 'utr', 'ref', 'txn', 'transaction id'],
//     apps: ['gpay', 'phonepe', 'paytm', 'bhim', 'bank', 'upi', 'google pay']
// };

// // Track verification state
// const verificationState = new Map();
// const userOrderState = new Map();

// // Time validation cache to prevent duplicate processing
// const processedImages = new Map();
// const PROCESSING_WINDOW = 5 * 60 * 1000; // 5 minutes

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
//         setTimeout(() => processedImages.delete(processingKey), PROCESSING_WINDOW);

//         // Get pending orders for this user
//         const pendingOrders = await apiService.getPendingOrdersByPhone(customerPhone);
        
//         if (!pendingOrders || pendingOrders.length === 0) {
//             return await sendNoPendingOrdersMessage(message);
//         }

//         const media = await message.downloadMedia();
        
//         if (!media) {
//             return await sendErrorMessage(message, '❌ Failed to download image. Please try again.');
//         }

//         // Validate image
//         const imageValidation = validateImage(media);
//         if (!imageValidation.isValid) {
//             return await sendInvalidImageMessage(message, imageValidation.reason);
//         }

//         // Quick validation
//         await message.reply('🔍 *Analyzing payment screenshot...*');
//         const quickValidation = await quickImageValidation(media.data);
        
//         if (!quickValidation.isValid) {
//             return await sendInvalidPaymentScreenshotMessage(message, quickValidation);
//         }

//         // Process payment with enhanced validation
//         await processPaymentScreenshot(media.data, customerPhone, client, message, pendingOrders);

//     } catch (error) {
//         console.error('Payment screenshot handling error:', error);
//         await sendErrorMessage(message, '❌ Failed to process payment screenshot. Please try again.');
//     }
// }

// /**
//  * Enhanced quick image validation
//  */
// async function quickImageValidation(imageData) {
//     try {
//         const result = await Tesseract.recognize(
//             Buffer.from(imageData, 'base64'),
//             VALIDATION_CONFIG.ocrEngine.language,
//             { 
//                 ...VALIDATION_CONFIG.ocrEngine,
//                 logger: () => {}
//             }
//         );

//         const text = result.data.text.toLowerCase();
//         console.log('📝 Quick OCR Text:', text.substring(0, 200));
        
//         const analysis = analyzeTextForPaymentIndicators(text);
        
//         return {
//             isValid: analysis.isPaymentScreenshot,
//             confidence: analysis.confidence,
//             foundIndicators: analysis.foundIndicators,
//             missingIndicators: analysis.missingIndicators,
//             reason: analysis.reason,
//             textLength: text.length
//         };

//     } catch (error) {
//         console.error('Quick validation error:', error);
//         return {
//             isValid: false,
//             reason: 'Cannot process image for validation',
//             confidence: 0
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
//             score += 15;
//         }
//     });

//     // Check for transaction indicators
//     PAYMENT_INDICATORS.transaction.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 10;
//         }
//     });

//     // Check for amount indicators
//     PAYMENT_INDICATORS.amount.forEach(indicator => {
//         if (text.includes(indicator)) {
//             foundIndicators.push(indicator);
//             score += 10;
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
//         score -= 50; // Heavy penalty for failure indicators
//     }

//     // Check for UPI ID patterns
//     const hasUPI = /@(?:oksbi|okaxis|paytm|axl|ybl)/i.test(text);
//     if (hasUPI) {
//         foundIndicators.push('upi_detected');
//         score += 20;
//     }

//     // Check for amount patterns
//     const hasAmountPattern = /₹\s*\d+|rs\s*\d+|rupees\s*\d+/i.test(text);
//     if (hasAmountPattern) {
//         foundIndicators.push('amount_pattern');
//         score += 15;
//     }

//     // Check for date/time patterns (for recent payment validation)
//     const hasDateTime = /\d{1,2}[:\/]\d{1,2}[:\/]\d{2,4}|\d{1,2}:\d{2}/i.test(text);
//     if (hasDateTime) {
//         foundIndicators.push('datetime');
//         score += 10;
//     }

//     // Determine if it's a payment screenshot
//     const isPaymentScreenshot = score >= 50 && foundIndicators.length >= VALIDATION_CONFIG.requiredPaymentIndicators;

//     return {
//         isPaymentScreenshot,
//         confidence: Math.min(100, Math.max(0, score)),
//         foundIndicators,
//         reason: isPaymentScreenshot ? 
//             `Valid payment screenshot detected (${foundIndicators.length} indicators)` :
//             `Not a payment screenshot (only ${foundIndicators.length} payment indicators found, score: ${score})`
//     };
// }

// /**
//  * Process payment screenshot with full analysis
//  */
// async function processPaymentScreenshot(imageData, customerPhone, client, originalMessage, pendingOrders) {
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
//             await processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone);
//         } else {
//             await handleFailedVerification(verificationResult, client, originalMessage);
//         }

//     } catch (error) {
//         console.error('Payment processing error:', error);
//         await sendErrorMessage(originalMessage, '❌ Error processing payment. Please try again or contact support.');
//     }
// }

// /**
//  * Validate payment time - Check if payment is recent (within 10 minutes)
//  */
// function validatePaymentTime(analysis) {
//     try {
//         const now = new Date();
//         const detectedTime = extractExactTime(analysis.timestamp || analysis.rawText);
        
//         if (!detectedTime) {
//             return { isRecent: true, reason: 'No timestamp found, proceeding with validation' };
//         }

//         const timeDiff = Math.abs(now - detectedTime) / (1000 * 60); // Difference in minutes
        
//         if (timeDiff > VALIDATION_CONFIG.recentPaymentThreshold) {
//             return {
//                 isRecent: false,
//                 reason: `Payment is too old (${Math.round(timeDiff)} minutes ago). Please send screenshot within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes of payment.`,
//                 detectedTime: detectedTime.toLocaleString(),
//                 currentTime: now.toLocaleString()
//             };
//         }

//         return { 
//             isRecent: true, 
//             reason: `Payment is recent (${Math.round(timeDiff)} minutes ago)`,
//             detectedTime: detectedTime.toLocaleString()
//         };

//     } catch (error) {
//         console.error('Time validation error:', error);
//         return { isRecent: true, reason: 'Time validation skipped' };
//     }
// }

// /**
//  * Extract exact time from text
//  */
// function extractExactTime(text) {
//     try {
//         // Try to find date-time patterns
//         const patterns = [
//             // DD/MM/YYYY HH:MM
//             /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})[,\s]*(\d{1,2}):(\d{2})/,
//             // HH:MM (assuming today)
//             /(\d{1,2}):(\d{2})\s*(?:am|pm)?/i,
//             // Today at HH:MM
//             /today\s+at\s+(\d{1,2}):(\d{2})/i,
//             // Just now / a few seconds ago
//             /just\s+now|few\s+seconds\s+ago|a\s+moment\s+ago/i
//         ];

//         for (const pattern of patterns) {
//             const match = text.match(pattern);
//             if (match) {
//                 const now = new Date();
                
//                 if (pattern.source.includes('just now') || pattern.source.includes('few seconds')) {
//                     return new Date(now.getTime() - 60000); // 1 minute ago
//                 }

//                 if (pattern.source.includes('today at')) {
//                     const hours = parseInt(match[1]);
//                     const minutes = parseInt(match[2]);
//                     const date = new Date(now);
//                     date.setHours(hours, minutes, 0, 0);
//                     return date;
//                 }

//                 if (match[4] && match[5]) {
//                     // Full date-time pattern
//                     const day = parseInt(match[1]);
//                     const month = parseInt(match[2]) - 1;
//                     const year = parseInt(match[3]) < 100 ? 2000 + parseInt(match[3]) : parseInt(match[3]);
//                     const hours = parseInt(match[4]);
//                     const minutes = parseInt(match[5]);
                    
//                     return new Date(year, month, day, hours, minutes);
//                 }

//                 if (match[1] && match[2]) {
//                     // Time-only pattern
//                     const hours = parseInt(match[1]);
//                     const minutes = parseInt(match[2]);
//                     const date = new Date(now);
//                     date.setHours(hours, minutes, 0, 0);
                    
//                     // If time appears to be in the future, assume it's from yesterday
//                     if (date > now) {
//                         date.setDate(date.getDate() - 1);
//                     }
                    
//                     return date;
//                 }
//             }
//         }

//         return null;
//     } catch (error) {
//         console.error('Time extraction error:', error);
//         return null;
//     }
// }

// /**
//  * Perform detailed OCR analysis
//  */
// async function performDetailedOCRAnalysis(imageData) {
//     try {
//         console.log('🔍 Starting detailed OCR analysis...');
//         const startTime = Date.now();

//         const result = await Tesseract.recognize(
//             Buffer.from(imageData, 'base64'),
//             VALIDATION_CONFIG.ocrEngine.language,
//             {
//                 ...VALIDATION_CONFIG.ocrEngine,
//                 logger: m => {
//                     if (m.status === 'recognizing text') {
//                         const progress = Math.round(m.progress * 100);
//                         console.log(`📊 OCR Progress: ${progress}%`);
//                     }
//                 }
//             }
//         );

//         const processingTime = Date.now() - startTime;
//         const text = result.data.text;
//         const words = result.data.words || [];
        
//         console.log(`✅ OCR completed in ${processingTime}ms`);
//         console.log(`📝 Text extracted: ${text.length} characters, ${words.length} words`);
        
//         // Enhanced logging for debugging
//         console.log('📄 OCR TEXT SAMPLE (first 500 chars):\n' + text.substring(0, 500));
//         console.log('\n=== END OF OCR TEXT ===\n');

//         return {
//             text: text,
//             confidence: result.data.confidence,
//             words: words,
//             isReadable: text.length >= VALIDATION_CONFIG.minTextLength && result.data.confidence > 30,
//             wordCount: words.length,
//             processingTime: processingTime,
//             analysis: analyzePaymentText(text)
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

//     console.log('🔍 Payment Analysis Result:', {
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
//     console.log('💰 Starting SMART amount extraction...');
    
//     // Remove phone numbers first
//     let cleanText = originalText.replace(/\+\d{10,}/g, ' ');
//     cleanText = cleanText.replace(/\b\d{10}\b/g, ' ');
    
//     // Remove dates
//     cleanText = cleanText.replace(/\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi, ' ');
    
//     // Remove times
//     cleanText = cleanText.replace(/\d{1,2}:\d{2}\s*(?:am|pm)?/gi, ' ');
    
//     console.log('🧹 Cleaned text after removing phone/dates:', cleanText.substring(0, 200));
    
//     // Strategy 1: Look for amount patterns with currency symbols
//     const currencyPatterns = [
//         /₹\s*(\d+)/gi,
//         /rs\.?\s*(\d+)/gi,
//         /inr\s*(\d+)/gi,
//         /rupees\s*(\d+)/gi
//     ];
    
//     for (const pattern of currencyPatterns) {
//         const matches = [...cleanText.matchAll(pattern)];
//         for (const match of matches) {
//             if (match[1]) {
//                 const amount = parseInt(match[1]);
//                 if (!isNaN(amount) && amount >= 1 && amount <= 10000) {
//                     console.log(`🎯 Found amount via currency pattern "${pattern}": ₹${amount}`);
//                     return amount;
//                 }
//             }
//         }
//     }
    
//     // Strategy 2: Look for "Pay" keyword with amount
//     const payPatterns = [
//         /pay\s*₹?\s*(\d+)/gi,
//         /pay\s*again\s*₹?\s*(\d+)/gi,
//         /sent\s*₹?\s*(\d+)/gi,
//         /paid\s*₹?\s*(\d+)/gi,
//         /amount\s*₹?\s*(\d+)/gi
//     ];
    
//     for (const pattern of payPatterns) {
//         const matches = [...cleanText.matchAll(pattern)];
//         for (const match of matches) {
//             if (match[1]) {
//                 const amount = parseInt(match[1]);
//                 if (!isNaN(amount) && amount >= 1 && amount <= 10000) {
//                     console.log(`🎯 Found amount via PAY pattern "${pattern}": ₹${amount}`);
//                     return amount;
//                 }
//             }
//         }
//     }
    
//     // Strategy 3: Look for numbers near payment-related keywords
//     const paymentKeywords = ['pay', 'sent', 'paid', 'amount', 'money', 'transfer'];
//     const numberPattern = /\b(\d{1,5})\b/g;
//     const numberMatches = [...cleanText.matchAll(numberPattern)];
    
//     const candidateAmounts = [];
    
//     for (const match of numberMatches) {
//         const amount = parseInt(match[1]);
//         if (!isNaN(amount) && amount >= 10 && amount <= 5000) {
//             // Check context around the number
//             const startIdx = Math.max(0, match.index - 30);
//             const endIdx = Math.min(cleanText.length, match.index + 30);
//             const context = cleanText.substring(startIdx, endIdx).toLowerCase();
            
//             // Check if near payment keywords
//             const hasPaymentContext = paymentKeywords.some(keyword => 
//                 context.includes(keyword)
//             );
            
//             // Check if it's likely a price (ends with 0, 5, 9)
//             const isLikelyPrice = amount % 5 === 0 || amount % 10 === 0 || amount % 9 === 0;
            
//             if (hasPaymentContext || isLikelyPrice) {
//                 candidateAmounts.push({
//                     amount: amount,
//                     context: context,
//                     position: match.index,
//                     score: (hasPaymentContext ? 10 : 0) + (isLikelyPrice ? 5 : 0)
//                 });
//             }
//         }
//     }
    
//     if (candidateAmounts.length > 0) {
//         // Sort by score and position
//         candidateAmounts.sort((a, b) => {
//             if (b.score !== a.score) return b.score - a.score;
//             return a.position - b.position;
//         });
        
//         const selectedAmount = candidateAmounts[0].amount;
//         console.log(`🎯 Selected amount from ${candidateAmounts.length} candidates: ₹${selectedAmount}`);
//         return selectedAmount;
//     }
    
//     // Strategy 4: Look for any number that appears multiple times
//     const allNumbers = [...originalText.matchAll(/\b(\d{2,4})\b/g)];
//     const frequency = {};
    
//     for (const match of allNumbers) {
//         if (match[1]) {
//             const amount = parseInt(match[1]);
//             if (!isNaN(amount) && amount >= 10 && amount <= 5000) {
//                 frequency[amount] = (frequency[amount] || 0) + 1;
//             }
//         }
//     }
    
//     if (Object.keys(frequency).length > 0) {
//         const sortedAmounts = Object.entries(frequency)
//             .sort(([,a], [,b]) => b - a)
//             .map(([amount]) => parseInt(amount));
        
//         const mostFrequent = sortedAmounts[0];
//         console.log(`🎯 Selected most frequent amount (${frequency[mostFrequent]} times): ₹${mostFrequent}`);
//         return mostFrequent;
//     }
    
//     console.log('⚠️ No reasonable amount found in text');
//     return null;
// }

// /**
//  * Extract UPI ID from text
//  */
// function extractUPIId(text) {
//     const upiPatterns = [
//         /[\w.-]+@(?:oksbi|okaxis|okhdfc|okicici|paytm|axl|ybl)/gi,
//         /[\w.-]+@[\w.]+/g,
//         /to:\s*([\w.-]+@[\w.]+)/gi,
//         /receiver:\s*([\w.-]+@[\w.]+)/gi,
//         /[\w.-]+@upi/gi
//     ];

//     for (const pattern of upiPatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             for (const match of matches) {
//                 let upi = match.trim();
                
//                 // Clean up
//                 upi = upi.replace(/^to:\s*/gi, '');
//                 upi = upi.replace(/^receiver:\s*/gi, '');
//                 upi = upi.replace(/[\s,]+$/g, '');
                
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
//  * Extract transaction ID from text
//  */
// function extractTransactionId(text) {
//     const transactionPatterns = [
//         /transaction\s*(?:id|no)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
//         /txn?\s*(?:id|no)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
//         /ref\s*(?:no|number|id)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
//         /([A-Z0-9]{12,20})(?:\s|$)/g,
//         /upi transaction id\s*([a-zA-Z0-9]{8,20})/gi,
//         /transaction id\s*([a-zA-Z0-9]{8,20})/gi,
//         /ID\s*:\s*([A-Z0-9]{10,20})/gi
//     ];

//     for (const pattern of transactionPatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//             const txnId = matches[0].replace(/[^a-zA-Z0-9]/gi, '').trim();
//             if (txnId.length >= 8) {
//                 console.log(`✅ Found Transaction ID: ${txnId}`);
//                 return txnId;
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
//         /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
//         /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/gi,
//         /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
//         /(\d{1,2}\s+\w+\s+\d{4},?\s+\d{1,2}:\d{2}\s*(?:am|pm)?)/gi,
//         /(\d{1,2}:\d{2})\s*(?:IST|UTC|GMT)?/gi,
//         /on\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/gi,
//         /at\s+(\d{1,2}:\d{2})/gi
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
    
//     if (text.includes('completed')) {
//         console.log(`✅ Payment Status: Success (found "completed")`);
//         return 'success';
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
//         { name: 'iob', patterns: ['indian overseas bank', 'iob'] },
//         { name: 'pnb', patterns: ['pnb', 'punjab national bank'] },
//         { name: 'kotak', patterns: ['kotak', 'kotak mahindra'] },
//         { name: 'yes', patterns: ['yes bank'] }
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
//         'gpay': ['gpay', 'google pay', 'google pay'],
//         'phonepe': ['phonepe'],
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

//     // Filter only TRULY PENDING orders
//     const trulyPendingOrders = pendingOrders.filter(order => {
//         const status = order.status?.toLowerCase();
//         const paymentStatus = order.paymentStatus?.toLowerCase();
        
//         return (status === 'pending' || status === 'awaiting_payment') &&
//                (paymentStatus === 'pending' || paymentStatus === 'awaiting_payment');
//     });

//     if (trulyPendingOrders.length === 0) {
//         validation.errors.push('❌ No pending orders found. Your orders may already be verified.');
//         return validation;
//     }

//     // Log orders with details
//     console.log('📋 Pending orders:');
//     trulyPendingOrders.forEach((order, index) => {
//         const productNames = order.items?.map(item => item.productName).join(', ') || 'Unknown';
//         console.log(`  ${index + 1}. Order: ${order.orderNumber}, Amount: ₹${order.totalPrice}, Products: ${productNames}`);
//     });

//     // Validate payment status
//     if (paymentStatus !== 'success') {
//         validation.errors.push('❌ Payment status not successful');
//         validation.autoVerifiable = false;
//         console.log('❌ Payment status validation failed');
//     }

//     // If no amount detected, we can't proceed
//     if (!extractedAmount) {
//         validation.errors.push('❌ Could not detect payment amount in screenshot');
//         validation.warnings.push('💡 Please ensure the payment amount (₹) is clearly visible in the screenshot');
//         validation.autoVerifiable = false;
//         console.log('❌ No amount detected in OCR');
//         return validation;
//     }

//     console.log(`💰 Looking for order matching amount: ₹${extractedAmount}`);
    
//     // Find matching order by amount - Enhanced matching
//     let matchedOrder = null;
//     let matchType = 'none';
//     let amountDifference = Infinity;
//     let matchScore = 0;
    
//     for (const order of trulyPendingOrders) {
//         const orderAmount = order.totalPrice;
//         const diff = Math.abs(extractedAmount - orderAmount);
        
//         // Calculate match score
//         let score = 0;
//         let type = 'none';
        
//         if (diff === 0) {
//             score = 100;
//             type = 'exact';
//         } else if (diff <= VALIDATION_CONFIG.amountTolerance) {
//             score = 80 - (diff * 2); // Score decreases with difference
//             type = 'close';
//         } else if (diff <= 20) {
//             score = 60 - diff; // Small penalty for larger differences
//             type = 'near';
//         }
        
//         console.log(`   Order ${order.orderNumber}: ₹${orderAmount}, Diff: ₹${diff}, Score: ${score}, Type: ${type}`);
        
//         if (score > matchScore) {
//             matchedOrder = order;
//             matchType = type;
//             amountDifference = diff;
//             matchScore = score;
            
//             if (type === 'exact') {
//                 break; // Found perfect match
//             }
//         }
//     }

//     if (!matchedOrder) {
//         const errorMsg = `❌ No matching order found for payment of ₹${extractedAmount}`;
//         validation.errors.push(errorMsg);
        
//         // Show user their pending orders with product names
//         if (trulyPendingOrders.length > 0) {
//             validation.warnings.push(`📋 Your pending orders:`);
//             trulyPendingOrders.slice(0, 3).forEach(order => {
//                 const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
//                 validation.warnings.push(`   • ${order.orderNumber}: ${productNames} - ₹${order.totalPrice}`);
//             });
            
//             validation.warnings.push(`💡 Please pay exactly ₹${trulyPendingOrders[0].totalPrice} for ${trulyPendingOrders[0].items?.[0]?.productName || 'your order'}`);
//         }
        
//         console.log('❌ No matching order found for amount:', extractedAmount);
//         return validation;
//     }

//     validation.matchedOrder = matchedOrder;
//     validation.matchQuality = matchType;
    
//     // Store product details
//     const productNames = matchedOrder.items?.map(item => item.productName).join(', ') || 'Product';
//     console.log(`✅ Matched Order: ${matchedOrder.orderNumber}, Amount: ₹${matchedOrder.totalPrice}, Products: ${productNames}, Match Type: ${matchType}`);

//     validation.matchedOrder.productDetails = {
//         names: productNames,
//         items: matchedOrder.items || []
//     };

//     // Validate UPI ID with enhanced validation
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
//         console.log('❌ UPI validation failed');
//     } else {
//         console.log('✅ UPI validation passed');
//     }

//     // Validate amount match details
//     const amountValidation = {
//         isValid: amountDifference <= VALIDATION_CONFIG.amountTolerance,
//         expected: matchedOrder.totalPrice,
//         found: extractedAmount,
//         difference: amountDifference,
//         matchType: matchType
//     };
    
//     validation.details.amount = amountValidation;
    
//     if (!amountValidation.isValid) {
//         validation.errors.push(`❌ Amount mismatch: Paid ₹${extractedAmount}, Expected ₹${matchedOrder.totalPrice} (Difference: ₹${amountDifference})`);
//         console.log('❌ Amount validation failed');
//     } else {
//         console.log('✅ Amount validation passed');
//     }

//     // Calculate confidence score
//     validation.confidence = calculateConfidenceScore(validation);
    
//     // Determine if payment is valid
//     validation.isValid = 
//         validation.errors.length === 0 && 
//         validation.confidence >= VALIDATION_CONFIG.minConfidenceScore &&
//         paymentStatus === 'success' &&
//         validation.autoVerifiable &&
//         amountValidation.isValid &&
//         upiValidation.isValid;

//     console.log(`📊 Final Validation Result:`, {
//         isValid: validation.isValid,
//         confidence: validation.confidence,
//         matchType: matchType,
//         amountDifference: amountDifference,
//         errors: validation.errors.length,
//         autoVerifiable: validation.autoVerifiable
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
        
//         // Contains match (handle spaces and special chars)
//         const extractedWithoutSpaces = cleanExtracted.replace(/\s/g, '');
//         const validWithoutSpaces = cleanValid.replace(/\s/g, '');
        
//         if (extractedWithoutSpaces.includes(validWithoutSpaces) || 
//             validWithoutSpaces.includes(extractedWithoutSpaces)) {
//             return { 
//                 isValid: true, 
//                 found: validUPI, 
//                 extracted: extractedUPI,
//                 matchType: 'contains'
//             };
//         }
        
//         // Partial match (common patterns)
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

//     // Base scores based on match type
//     switch (validation.matchQuality) {
//         case 'exact':
//             score += 50;
//             break;
//         case 'close':
//             score += 40;
//             break;
//         case 'near':
//             score += 30;
//             break;
//         default:
//             score += 10;
//     }
    
//     // UPI validation score
//     if (validation.details.upi.isValid) {
//         switch (validation.details.upi.matchType) {
//             case 'exact':
//                 score += 30;
//                 break;
//             case 'contains':
//                 score += 25;
//                 break;
//             case 'partial':
//                 score += 20;
//                 break;
//             default:
//                 score += 15;
//         }
//     }
    
//     // Payment status score
//     if (validation.details.paymentStatus === 'success') {
//         score += 10;
//     }
    
//     // Transaction ID score
//     if (validation.details.transactionId) {
//         score += 10;
//     }
    
//     // Penalties
//     if (validation.errors.length > 0) {
//         score -= validation.errors.length * 15;
//     }

//     // Ensure score is within bounds
//     return Math.max(0, Math.min(100, Math.round(score)));
// }

// /**
//  * Process successful verification
//  */
// async function processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone) {
//     try {
//         const order = verificationResult.matchedOrder;
//         const productNames = verificationResult.matchedOrder.productDetails?.names || 'Product';
        
//         console.log(`✅ Processing successful verification for order: ${order.orderNumber}, Product: ${productNames}`);

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
//                 imageData: imageData.substring(0, 10000), // Store only part of image to avoid large payloads
//                 mimeType: 'image/jpeg'
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
//                 amountMatch: verificationResult.details.amount.isValid,
//                 upiMatch: verificationResult.details.upi.isValid,
//                 confidenceScore: verificationResult.confidence,
//                 matchQuality: verificationResult.matchQuality,
//                 timeValidated: true
//             },
//             status: 'verified',
//             verifiedBy: 'auto_ocr',
//             verifiedAt: new Date()
//         });

//         if (!paymentVerification) {
//             throw new Error('Failed to create payment verification record');
//         }

//         console.log('✅ Payment verification record created:', paymentVerification._id);

//         // Update order status
//         console.log('🔄 Updating order status for:', order._id);
        
//         try {
//             const orderUpdateResult = await apiService.updateOrderStatus(order._id, 'processing');
//             console.log('✅ Order status update result:', orderUpdateResult);
            
//             // Also update payment status
//             await apiService.updateOrderPaymentStatus(order.orderNumber, {
//                 paymentStatus: 'paid',
//                 paymentVerified: true,
//                 verificationId: paymentVerification._id,
//                 paidAt: new Date()
//             });
            
//         } catch (updateError) {
//             console.warn('⚠️ Order status update failed:', updateError.message);
//         }

//         // Store user verification state
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

//         console.log(`🎉 Payment verification completed successfully for ${productNames}`);

//     } catch (error) {
//         console.error('Successful verification processing error:', error);
        
//         // Still send success message to user
//         await originalMessage.reply(
//             '✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n' +
//             'Your payment has been verified and your order is being processed.\n\n' +
//             'If you have any questions, please contact support.'
//         );
//     }
// }

// /**
//  * Send success messages to customer
//  */
// async function sendSuccessMessages(order, verificationResult, message, productNames) {
//     const confidence = Math.round(verificationResult.confidence);
//     const customerPhone = apiService.cleanPhoneNumber(message.from);
    
//     // Get actual product details
//     const actualProductNames = productNames || order.items?.map(item => item.productName).join(', ') || 'Your Product';
    
//     // Build order items text
//     let orderItemsText = '';
//     if (order.items && order.items.length > 0) {
//         orderItemsText = `📝 *Order Items:*\n`;
//         order.items.forEach(item => {
//             const itemTotal = (item.price || 0) * (item.quantity || 1);
//             const productName = item.productName || 'Product';
//             orderItemsText += `• ${productName} x ${item.quantity || 1} - ₹${itemTotal}\n`;
//         });
//         orderItemsText += `\n`;
//     }

//     // Send confirmation
//     let successMessage = 
//         `✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n` +
//         `🧾 *Order Number:* ${order.orderNumber}\n` +
//         `👤 *Customer:* ${order.customerName || 'Customer'}\n` +
//         `📦 *Product:* ${actualProductNames}\n` +
//         `💰 *Amount Paid:* ₹${order.totalPrice}\n` +
//         `🎯 *Verification Score:* ${confidence}%\n` +
//         `📊 *Status:* Order Confirmed & Processing\n\n` +
//         `*Your order is now being processed.*\n\n` +
//         orderItemsText +
//         `🚚 *What Happens Next:*\n` +
//         `• Order processing: 24-48 hours\n` +
//         `• Quality check & packaging\n` +
//         `• Shipping confirmation with tracking\n` +
//         `• Delivery: 3-5 business days\n\n` +
//         `📞 *Customer Support:*\n` +
//         `For any queries, simply reply to this message.\n\n` +
//         `🎉 *THANK YOU FOR YOUR PURCHASE!*\n\n` +
//         `_To place a new order, send *!menu*_`;
    
//     await message.reply(successMessage);

//     // Clear verification state after 2 hours
//     setTimeout(() => {
//         if (verificationState.has(customerPhone)) {
//             verificationState.delete(customerPhone);
//             userOrderState.delete(customerPhone);
//             console.log(`🔄 Cleared verification state for: ${customerPhone}`);
//         }
//     }, 2 * 60 * 60 * 1000);
// }

// /**
//  * Send admin notification
//  */
// async function sendAdminNotification(order, customerPhone, confidence) {
//     try {
//         await notificationManager.sendNotification('PAYMENT_VERIFIED', {
//             title: '✅ Payment Verified',
//             body: `Payment of ₹${order.totalPrice} verified for order ${order.orderNumber}`,
//             notificationData: {
//                 category: 'payment',
//                 priority: 'normal',
//                 referenceId: order.orderNumber,
//                 actionUrl: `/orders/${order.orderNumber}`,
//                 extraData: {
//                     customerName: order.customerName,
//                     customerPhone: customerPhone,
//                     orderNumber: order.orderNumber,
//                     amount: order.totalPrice,
//                     product: order.items?.[0]?.productName,
//                     confidence: confidence,
//                     timestamp: new Date().toISOString()
//                 }
//             }
//         });
//     } catch (error) {
//         console.warn('⚠️ Failed to send admin notification:', error.message);
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

//     errorMessage += `*How to Fix This:*\n` +
//         `1. ✅ Pay exactly ₹${order?.totalPrice || 'the order amount'}\n` +
//         `2. ✅ Use our official UPI: ${VALID_UPI_IDS[0]}\n` +
//         `3. ✅ Ensure payment shows "SUCCESSFUL" or "COMPLETED"\n` +
//         `4. ✅ Take clear screenshot with all details visible\n` +
//         `5. ✅ Send screenshot immediately after payment\n` +
//         `6. ✅ Payment must be within last ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n\n` +
//         `*Required in Screenshot:*\n` +
//         `• Payment amount (₹${order?.totalPrice || 'XXX'})\n` +
//         `• Our UPI ID (${VALID_UPI_IDS[0]})\n` +
//         `• Transaction status: "SUCCESSFUL"\n` +
//         `• Transaction/Reference ID\n` +
//         `• Date and time (within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes)\n\n` +
//         `Please try again with the correct payment details.`;

//     await originalMessage.reply(errorMessage);
// }

// // ========== HELPER FUNCTIONS ==========

// async function sendOldPaymentMessage(message, timeValidation) {
//     await message.reply(
//         `❌ *OLD PAYMENT SCREENSHOT*\n\n` +
//         `This payment screenshot is too old.\n\n` +
//         `*Details:*\n` +
//         `• Detected time: ${timeValidation.detectedTime || 'Unknown'}\n` +
//         `• Time difference: ${timeValidation.reason}\n\n` +
//         `*Please send a recent payment screenshot:*\n` +
//         `✅ Make payment now\n` +
//         `✅ Take screenshot immediately\n` +
//         `✅ Send within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n\n` +
//         `This ensures your order is processed quickly.`
//     );
// }

// async function sendAlreadyVerifiedMessage(message, state) {
//     const productName = state.productName || 'your product';
    
//     await message.reply(
//         `✅ *ORDER ALREADY VERIFIED!*\n\n` +
//         `Your order *${state.orderNumber}* for *${productName}* is already verified and being processed.\n\n` +
//         `💰 Amount Paid: ₹${state.amount}\n` +
//         `📦 Status: Processing\n\n` +
//         `_To place a new order, send *!menu*_\n` +
//         `_For order status updates, contact support_`
//     );
// }

// function validateImage(media) {
//     const base64Length = media.data.length;
//     const fileSizeInBytes = (base64Length * 3) / 4;
    
//     if (fileSizeInBytes > VALIDATION_CONFIG.maxImageSize) {
//         return {
//             isValid: false,
//             reason: `Image too large (${(fileSizeInBytes / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`
//         };
//     }

//     const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     if (!validMimeTypes.includes(media.mimetype)) {
//         return {
//             isValid: false,
//             reason: `Invalid image format (${media.mimetype}). Please send JPEG, PNG, or WebP.`
//         };
//     }

//     return { isValid: true };
// }

// async function sendNoPendingOrdersMessage(message) {
//     await message.reply(
//         '❌ *No Pending Orders Found*\n\n' +
//         'You don\'t have any pending orders requiring payment.\n\n' +
//         '*What to do:*\n' +
//         '1. Place a new order first\n' +
//         '2. Complete the order process\n' +
//         '3. Then send payment screenshot\n\n' +
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
//         `*Minimum required:* 50%\n\n` +
//         `*Please send a proper payment screenshot from:*\n` +
//         `• Google Pay (GPay)\n` +
//         `• PhonePe\n` +
//         `• PayTM\n` +
//         `• BHIM UPI\n\n` +
//         `Take a clear screenshot showing:\n` +
//         `✅ Payment amount\n` +
//         `✅ UPI ID\n` +
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
//         `• Text found: ${ocrResult.text.length} characters\n` +
//         `• Confidence: ${Math.round(ocrResult.confidence)}%\n` +
//         `• Words detected: ${ocrResult.wordCount}\n\n` +
//         `*Please ensure:*\n` +
//         `✅ Screenshot is clear and high quality\n` +
//         `✅ All transaction text is visible\n` +
//         `✅ Text is not too small\n` +
//         `✅ Screenshot is in English\n\n` +
//         `Take a better screenshot and try again.`
//     );
// }

// async function showPaymentInstructions(message, client) {
//     await message.reply(
//         `📋 *HOW TO MAKE PAYMENT & VERIFY*\n\n` +
//         `*Step 1 - Make Payment:*\n` +
//         `1. Open your UPI app (GPay, PhonePe, PayTM)\n` +
//         `2. Send ₹[Your Order Amount] to: ${VALID_UPI_IDS[0]}\n` +
//         `3. Ensure payment shows "SUCCESSFUL" or "COMPLETED"\n` +
//         `4. Make payment now (don't use old screenshots)\n\n` +
//         `*Step 2 - Send Screenshot:*\n` +
//         `1. Take screenshot of successful payment\n` +
//         `2. Ensure these are visible:\n` +
//         `   • Amount: ₹[Your Order Amount]\n` +
//         `   • Status: "SUCCESSFUL" or "COMPLETED"\n` +
//         `   • To: ${VALID_UPI_IDS[0]}\n` +
//         `   • Transaction/Reference ID\n` +
//         `   • Date & Time (current)\n\n` +
//         `*Step 3 - Automatic Verification:*\n` +
//         `• We'll verify within seconds\n` +
//         `• Payment must be within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n` +
//         `• You'll receive confirmation\n` +
//         `• Order will be processed immediately`
//     );
// }

// async function showVerificationHelp(message, client) {
//     await message.reply(
//         `🔒 *PAYMENT VERIFICATION SYSTEM*\n\n` +
//         `*For Customers:*\n` +
//         `Simply send UPI payment screenshot after payment\n` +
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
//         try {
//             await apiService.updateOrderStatus(verification.orderReference, 'processing');
//             await apiService.updateOrderPaymentStatus(orderNumber, {
//                 paymentStatus: 'paid',
//                 paymentVerified: true
//             });
//         } catch (error) {
//             console.warn('Order status update in manual verify failed:', error.message);
//         }

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

//         await apiService.markPaymentAsFraud(verification._id, [reasons], 'admin');

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

//         let response = `📋 *PENDING PAYMENT VERIFICATIONS (${pendingVerifications.length})*\n\n`;
        
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
//         const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
//         if (!verification) {
//             return await message.reply(`❌ No verified payment found for order: ${orderNumber}`);
//         }

//         // Send invoice notification
//         await notificationManager.sendNotification('INVOICE_GENERATED', {
//             orderNumber: orderNumber,
//             customerPhone: verification.customerPhone,
//             amount: verification.orderDetails?.totalAmount
//         });

//         await message.reply(`📄 Invoice generated for order: ${orderNumber}`);
        
//     } catch (error) {
//         console.error('Invoice command error:', error);
//         await message.reply('❌ Failed to generate invoice.');
//     }
// }

// async function showVerificationStats(message, client) {
//     try {
//         const stats = await apiService.getPaymentVerificationStats('week');
        
//         const total = (stats.verified || 0) + (stats.pending || 0) + (stats.rejected || 0);
//         const successRate = total > 0 ? Math.round(((stats.verified || 0) / total) * 100) : 0;
        
//         const response = 
//             `📊 *PAYMENT VERIFICATION STATISTICS*\n\n` +
//             `✅ Verified: ${stats.verified || 0}\n` +
//             `⏳ Pending: ${stats.pending || 0}\n` +
//             `❌ Rejected: ${stats.rejected || 0}\n` +
//             `🚨 Fraud: ${stats.fraud || 0}\n` +
//             `🤖 Auto-Verified: ${stats.autoVerified || 0}\n` +
//             `👤 Manual-Verified: ${stats.manualVerified || 0}\n` +
//             `📈 Success Rate: ${successRate}%\n` +
//             `📝 Total: ${total}`;

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
//         response += `*Payment Indicators:*\n`;
        
//         const indicatorAnalysis = analyzeTextForPaymentIndicators(ocrResult.text.toLowerCase());
//         response += `Score: ${indicatorAnalysis.confidence}%\n`;
//         response += `Found: ${indicatorAnalysis.foundIndicators.join(', ')}\n\n`;
        
//         response += `*First 300 chars:*\n${ocrResult.text.substring(0, 300)}${ocrResult.text.length > 300 ? '...' : ''}`;

//         await message.reply(response);
        
//     } catch (error) {
//         console.error('Test OCR error:', error);
//         await message.reply('❌ OCR test failed.');
//     }
// }

// // Export cleanup function
// export function cleanupVerificationState() {
//     const now = Date.now();
//     const twoHours = 2 * 60 * 60 * 1000;
    
//     for (const [phone, data] of verificationState.entries()) {
//         if (now - data.timestamp > twoHours) {
//             verificationState.delete(phone);
//             userOrderState.delete(phone);
//         }
//     }
// }

// // Get user verification state (for other handlers)
// export function getUserVerificationState(phone) {
//     return verificationState.get(phone);
// }

// // Check if user is verified
// export function isUserVerified(phone) {
//     const state = verificationState.get(phone);
//     return state ? state.verified : false;
// }

// export default handlePaymentVerification;








// handlers/paymentVerificationHandler.js - FIXED TIME DETECTION VERSION
import apiService from "../../services/apiService.js";
import notificationManager from "../../services/notifications/notification-manager.js";
import pkg from 'whatsapp-web.js';
import Tesseract from 'tesseract.js';

const { MessageMedia } = pkg;

// Configuration
const VALID_UPI_IDS = [
    'subaask21@oksbi',
    'posterpro.store@okaxis', 
    'posterpro.store@paytm',
    'posterpro.store@axl',
    'posterpro.store@ybl'
];

const VALIDATION_CONFIG = {
    amountTolerance: 5, // ₹5 tolerance
    minConfidenceScore: 85, // Increased from 70 for stricter validation
    minTextLength: 15,
    requiredPaymentIndicators: 4,
    maxImageSize: 5 * 1024 * 1024,
    recentPaymentThreshold: 10, // 10 minutes window for payment
    ocrEngine: {
        language: 'eng',
        oem: 1,
        psm: 3,
        tessedit_char_whitelist: '0123456789₹Rs.INRabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@-: /,()',
        preserve_interword_spaces: '1'
    }
};

const PAYMENT_INDICATORS = {
    success: ['successful', 'completed', 'paid', 'sent', 'transferred', 'payment done', 'success', 'approved', 'payment successful', 'money sent'],
    failure: ['failed', 'rejected', 'cancelled', 'declined', 'error', 'unsuccessful', 'payment failed'],
    amount: ['amount', 'rs', '₹', 'inr', 'rupees', 'total', 'money', 'sent', 'paid', 'pay'],
    transaction: ['transaction', 'payment', 'upi', 'reference', 'id', 'utr', 'ref', 'txn', 'transaction id'],
    apps: ['gpay', 'phonepe', 'paytm', 'bhim', 'bank', 'upi', 'google pay']
};

// Track verification state
const verificationState = new Map();
const userOrderState = new Map();

// Time validation cache to prevent duplicate processing
const processedImages = new Map();
const PROCESSING_WINDOW = 5 * 60 * 1000; // 5 minutes

/**
 * Main payment verification handler
 */
export async function handlePaymentVerification(message, client) {
    try {
        const from = message.from;
        const userPhone = apiService.cleanPhoneNumber(from);
        const userMessage = message.body.trim().toLowerCase();
        
        console.log(`🔍 Payment verification request from: ${userPhone}, Message: "${userMessage.substring(0, 50)}"`);

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
        const customerPhone = apiService.cleanPhoneNumber(from);
        
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
        setTimeout(() => processedImages.delete(processingKey), PROCESSING_WINDOW);

        // Get pending orders for this user
        const pendingOrders = await apiService.getPendingOrdersByPhone(customerPhone);
        
        if (!pendingOrders || pendingOrders.length === 0) {
            return await sendNoPendingOrdersMessage(message);
        }

        const media = await message.downloadMedia();
        
        if (!media) {
            return await sendErrorMessage(message, '❌ Failed to download image. Please try again.');
        }

        // Validate image
        const imageValidation = validateImage(media);
        if (!imageValidation.isValid) {
            return await sendInvalidImageMessage(message, imageValidation.reason);
        }

        // Quick validation
        await message.reply('🔍 *Analyzing payment screenshot...*');
        const quickValidation = await quickImageValidation(media.data);
        
        if (!quickValidation.isValid) {
            return await sendInvalidPaymentScreenshotMessage(message, quickValidation);
        }

        // Process payment with enhanced validation
        await processPaymentScreenshot(media.data, customerPhone, client, message, pendingOrders);

    } catch (error) {
        console.error('Payment screenshot handling error:', error);
        await sendErrorMessage(message, '❌ Failed to process payment screenshot. Please try again.');
    }
}

/**
 * Enhanced quick image validation
 */
async function quickImageValidation(imageData) {
    try {
        const result = await Tesseract.recognize(
            Buffer.from(imageData, 'base64'),
            VALIDATION_CONFIG.ocrEngine.language,
            { 
                ...VALIDATION_CONFIG.ocrEngine,
                logger: () => {}
            }
        );

        const text = result.data.text.toLowerCase();
        console.log('📝 Quick OCR Text:', text.substring(0, 200));
        
        const analysis = analyzeTextForPaymentIndicators(text);
        
        return {
            isValid: analysis.isPaymentScreenshot,
            confidence: analysis.confidence,
            foundIndicators: analysis.foundIndicators,
            missingIndicators: analysis.missingIndicators,
            reason: analysis.reason,
            textLength: text.length
        };

    } catch (error) {
        console.error('Quick validation error:', error);
        return {
            isValid: false,
            reason: 'Cannot process image for validation',
            confidence: 0
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
            score += 15;
        }
    });

    // Check for transaction indicators
    PAYMENT_INDICATORS.transaction.forEach(indicator => {
        if (text.includes(indicator)) {
            foundIndicators.push(indicator);
            score += 10;
        }
    });

    // Check for amount indicators
    PAYMENT_INDICATORS.amount.forEach(indicator => {
        if (text.includes(indicator)) {
            foundIndicators.push(indicator);
            score += 10;
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
        score -= 50; // Heavy penalty for failure indicators
    }

    // Check for UPI ID patterns
    const hasUPI = /@(?:oksbi|okaxis|paytm|axl|ybl)/i.test(text);
    if (hasUPI) {
        foundIndicators.push('upi_detected');
        score += 20;
    }

    // Check for amount patterns
    const hasAmountPattern = /₹\s*\d+|rs\s*\d+|rupees\s*\d+/i.test(text);
    if (hasAmountPattern) {
        foundIndicators.push('amount_pattern');
        score += 15;
    }

    // Check for date/time patterns (for recent payment validation)
    const hasDateTime = /\d{1,2}[:\/]\d{1,2}[:\/]\d{2,4}|\d{1,2}:\d{2}/i.test(text);
    if (hasDateTime) {
        foundIndicators.push('datetime');
        score += 10;
    }

    // Determine if it's a payment screenshot
    const isPaymentScreenshot = score >= 50 && foundIndicators.length >= VALIDATION_CONFIG.requiredPaymentIndicators;

    return {
        isPaymentScreenshot,
        confidence: Math.min(100, Math.max(0, score)),
        foundIndicators,
        reason: isPaymentScreenshot ? 
            `Valid payment screenshot detected (${foundIndicators.length} indicators)` :
            `Not a payment screenshot (only ${foundIndicators.length} payment indicators found, score: ${score})`
    };
}

/**
 * Process payment screenshot with full analysis
 */
async function processPaymentScreenshot(imageData, customerPhone, client, originalMessage, pendingOrders) {
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
            errors: verificationResult.errors,
            warnings: verificationResult.warnings
        });

        if (verificationResult.isValid) {
            await processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone);
        } else {
            await handleFailedVerification(verificationResult, client, originalMessage);
        }

    } catch (error) {
        console.error('Payment processing error:', error);
        await sendErrorMessage(originalMessage, '❌ Error processing payment. Please try again or contact support.');
    }
}

/**
 * Validate payment time - Check if payment is recent (within 10 minutes)
 */
function validatePaymentTime(analysis) {
    try {
        const now = new Date();
        const detectedTime = extractExactTime(analysis.timestamp || analysis.rawText);
        
        if (!detectedTime) {
            console.log('⏰ No timestamp detected in OCR, proceeding with validation');
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
 * Extract exact time from text - FIXED AM/PM ISSUE
 */
function extractExactTime(text) {
    try {
        console.log('⏰ Extracting time from text:', text.substring(0, 200));
        
        const now = new Date();
        
        // Try different patterns in order of priority
        const patterns = [
            // Pattern 1: Full date with time and AM/PM (DD/MM/YYYY HH:MM AM/PM)
            /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})[,\s]*(\d{1,2}):(\d{2})\s*(am|pm)?/i,
            
            // Pattern 2: Time with AM/PM and date (HH:MM AM/PM DD/MM/YYYY)
            /(\d{1,2}):(\d{2})\s*(am|pm)?[,\s]*(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/i,
            
            // Pattern 3: Just time with AM/PM (HH:MM AM/PM)
            /(\d{1,2}):(\d{2})\s*(am|pm)/i,
            
            // Pattern 4: 24-hour format time (HH:MM)
            /(\d{1,2}):(\d{2})(?![0-9])/,
            
            // Pattern 5: Today/Now keywords
            /(just\s+now|few\s+seconds\s+ago|a\s+moment\s+ago|now)/i,
            
            // Pattern 6: Today at HH:MM
            /today\s+at\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                console.log('⏰ Pattern matched:', pattern.source);
                console.log('⏰ Match groups:', match);
                
                let hours = 0, minutes = 0, day = now.getDate(), month = now.getMonth(), year = now.getFullYear();
                let period = ''; // am/pm indicator

                if (pattern.source.includes('just now') || pattern.source.includes('few seconds') || pattern.source.includes('moment ago') || pattern.source.includes('now')) {
                    // For "just now" or similar, assume current time minus 1 minute
                    return new Date(now.getTime() - 60000);
                }

                if (pattern.source.includes('today at')) {
                    // Pattern 6: Today at HH:MM
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    period = (match[3] || '').toLowerCase();
                    day = now.getDate();
                    month = now.getMonth();
                    year = now.getFullYear();
                }
                else if (pattern.source.includes('am|pm') && match[6]) {
                    // Pattern 1: Full date with time and AM/PM
                    day = parseInt(match[1]);
                    month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
                    year = parseInt(match[3]);
                    if (year < 100) year += 2000; // Convert 2-digit year to 4-digit
                    hours = parseInt(match[4]);
                    minutes = parseInt(match[5]);
                    period = match[6].toLowerCase();
                }
                else if (pattern.source.includes('am|pm') && match[3]) {
                    // Pattern 2 or 3: Time with AM/PM
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    period = match[3].toLowerCase();
                    
                    if (match[4] && match[5] && match[6]) {
                        // Has date information
                        day = parseInt(match[4]);
                        month = parseInt(match[5]) - 1;
                        year = parseInt(match[6]);
                        if (year < 100) year += 2000;
                    } else {
                        // No date, assume today
                        day = now.getDate();
                        month = now.getMonth();
                        year = now.getFullYear();
                    }
                }
                else if (match[1] && match[2]) {
                    // Pattern 4: 24-hour format or time without AM/PM
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    
                    // Check if hours is in 24-hour format (> 12)
                    if (hours > 12) {
                        // It's already in 24-hour format
                        period = 'pm';
                    } else {
                        // Try to infer AM/PM from context
                        const context = text.toLowerCase();
                        if (context.includes('pm')) {
                            period = 'pm';
                        } else if (context.includes('am')) {
                            period = 'am';
                        } else {
                            // Default to current period based on current time
                            period = now.getHours() >= 12 ? 'pm' : 'am';
                        }
                    }
                    
                    // Assume today if no date provided
                    day = now.getDate();
                    month = now.getMonth();
                    year = now.getFullYear();
                }

                // Convert 12-hour format to 24-hour format if needed
                if (period === 'pm' && hours < 12) {
                    hours += 12;
                } else if (period === 'am' && hours === 12) {
                    hours = 0; // 12 AM is 00:00
                }

                // Validate hours and minutes
                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    const date = new Date(year, month, day, hours, minutes, 0);
                    
                    // Adjust for timezone (India is UTC+5:30)
                    const timezoneOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
                    const adjustedDate = new Date(date.getTime() + timezoneOffset);
                    
                    console.log('⏰ Parsed time details:', {
                        input: match[0],
                        hours: hours,
                        minutes: minutes,
                        period: period,
                        day: day,
                        month: month + 1,
                        year: year,
                        parsedDate: date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                        adjustedDate: adjustedDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                    });
                    
                    // Check if date is in the future (due to timezone issues)
                    if (adjustedDate > now) {
                        // If it appears to be in the future, check if it might be from yesterday
                        const timeDiff = adjustedDate - now;
                        if (timeDiff > 12 * 60 * 60 * 1000) { // More than 12 hours in future
                            adjustedDate.setDate(adjustedDate.getDate() - 1);
                            console.log('⏰ Adjusted date to yesterday:', adjustedDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
                        }
                    }
                    
                    return adjustedDate;
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
 * Perform detailed OCR analysis
 */
async function performDetailedOCRAnalysis(imageData) {
    try {
        console.log('🔍 Starting detailed OCR analysis...');
        const startTime = Date.now();

        const result = await Tesseract.recognize(
            Buffer.from(imageData, 'base64'),
            VALIDATION_CONFIG.ocrEngine.language,
            {
                ...VALIDATION_CONFIG.ocrEngine,
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        console.log(`📊 OCR Progress: ${progress}%`);
                    }
                }
            }
        );

        const processingTime = Date.now() - startTime;
        const text = result.data.text;
        const words = result.data.words || [];
        
        console.log(`✅ OCR completed in ${processingTime}ms`);
        console.log(`📝 Text extracted: ${text.length} characters, ${words.length} words`);
        
        // Enhanced logging for debugging
        console.log('📄 OCR TEXT SAMPLE (first 500 chars):\n' + text.substring(0, 500));
        console.log('\n=== END OF OCR TEXT ===\n');

        return {
            text: text,
            confidence: result.data.confidence,
            words: words,
            isReadable: text.length >= VALIDATION_CONFIG.minTextLength && result.data.confidence > 30,
            wordCount: words.length,
            processingTime: processingTime,
            analysis: analyzePaymentText(text)
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

    console.log('🔍 Payment Analysis Result:', {
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
    console.log('💰 Starting SMART amount extraction...');
    
    // Remove phone numbers first
    let cleanText = originalText.replace(/\+\d{10,}/g, ' ');
    cleanText = cleanText.replace(/\b\d{10}\b/g, ' ');
    
    // Remove dates
    cleanText = cleanText.replace(/\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi, ' ');
    
    // Remove times
    cleanText = cleanText.replace(/\d{1,2}:\d{2}\s*(?:am|pm)?/gi, ' ');
    
    console.log('🧹 Cleaned text after removing phone/dates:', cleanText.substring(0, 200));
    
    // Strategy 1: Look for amount patterns with currency symbols
    const currencyPatterns = [
        /₹\s*(\d+)/gi,
        /rs\.?\s*(\d+)/gi,
        /inr\s*(\d+)/gi,
        /rupees\s*(\d+)/gi
    ];
    
    for (const pattern of currencyPatterns) {
        const matches = [...cleanText.matchAll(pattern)];
        for (const match of matches) {
            if (match[1]) {
                const amount = parseInt(match[1]);
                if (!isNaN(amount) && amount >= 1 && amount <= 10000) {
                    console.log(`🎯 Found amount via currency pattern "${pattern}": ₹${amount}`);
                    return amount;
                }
            }
        }
    }
    
    // Strategy 2: Look for "Pay" keyword with amount
    const payPatterns = [
        /pay\s*₹?\s*(\d+)/gi,
        /pay\s*again\s*₹?\s*(\d+)/gi,
        /sent\s*₹?\s*(\d+)/gi,
        /paid\s*₹?\s*(\d+)/gi,
        /amount\s*₹?\s*(\d+)/gi
    ];
    
    for (const pattern of payPatterns) {
        const matches = [...cleanText.matchAll(pattern)];
        for (const match of matches) {
            if (match[1]) {
                const amount = parseInt(match[1]);
                if (!isNaN(amount) && amount >= 1 && amount <= 10000) {
                    console.log(`🎯 Found amount via PAY pattern "${pattern}": ₹${amount}`);
                    return amount;
                }
            }
        }
    }
    
    // Strategy 3: Look for numbers near payment-related keywords
    const paymentKeywords = ['pay', 'sent', 'paid', 'amount', 'money', 'transfer'];
    const numberPattern = /\b(\d{1,5})\b/g;
    const numberMatches = [...cleanText.matchAll(numberPattern)];
    
    const candidateAmounts = [];
    
    for (const match of numberMatches) {
        const amount = parseInt(match[1]);
        if (!isNaN(amount) && amount >= 10 && amount <= 5000) {
            // Check context around the number
            const startIdx = Math.max(0, match.index - 30);
            const endIdx = Math.min(cleanText.length, match.index + 30);
            const context = cleanText.substring(startIdx, endIdx).toLowerCase();
            
            // Check if near payment keywords
            const hasPaymentContext = paymentKeywords.some(keyword => 
                context.includes(keyword)
            );
            
            // Check if it's likely a price (ends with 0, 5, 9)
            const isLikelyPrice = amount % 5 === 0 || amount % 10 === 0 || amount % 9 === 0;
            
            if (hasPaymentContext || isLikelyPrice) {
                candidateAmounts.push({
                    amount: amount,
                    context: context,
                    position: match.index,
                    score: (hasPaymentContext ? 10 : 0) + (isLikelyPrice ? 5 : 0)
                });
            }
        }
    }
    
    if (candidateAmounts.length > 0) {
        // Sort by score and position
        candidateAmounts.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.position - b.position;
        });
        
        const selectedAmount = candidateAmounts[0].amount;
        console.log(`🎯 Selected amount from ${candidateAmounts.length} candidates: ₹${selectedAmount}`);
        return selectedAmount;
    }
    
    // Strategy 4: Look for any number that appears multiple times
    const allNumbers = [...originalText.matchAll(/\b(\d{2,4})\b/g)];
    const frequency = {};
    
    for (const match of allNumbers) {
        if (match[1]) {
            const amount = parseInt(match[1]);
            if (!isNaN(amount) && amount >= 10 && amount <= 5000) {
                frequency[amount] = (frequency[amount] || 0) + 1;
            }
        }
    }
    
    if (Object.keys(frequency).length > 0) {
        const sortedAmounts = Object.entries(frequency)
            .sort(([,a], [,b]) => b - a)
            .map(([amount]) => parseInt(amount));
        
        const mostFrequent = sortedAmounts[0];
        console.log(`🎯 Selected most frequent amount (${frequency[mostFrequent]} times): ₹${mostFrequent}`);
        return mostFrequent;
    }
    
    console.log('⚠️ No reasonable amount found in text');
    return null;
}

/**
 * Extract UPI ID from text
 */
function extractUPIId(text) {
    const upiPatterns = [
        /[\w.-]+@(?:oksbi|okaxis|okhdfc|okicici|paytm|axl|ybl)/gi,
        /[\w.-]+@[\w.]+/g,
        /to:\s*([\w.-]+@[\w.]+)/gi,
        /receiver:\s*([\w.-]+@[\w.]+)/gi,
        /[\w.-]+@upi/gi
    ];

    for (const pattern of upiPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                let upi = match.trim();
                
                // Clean up
                upi = upi.replace(/^to:\s*/gi, '');
                upi = upi.replace(/^receiver:\s*/gi, '');
                upi = upi.replace(/[\s,]+$/g, '');
                
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
 * Extract transaction ID from text
 */
function extractTransactionId(text) {
    const transactionPatterns = [
        /transaction\s*(?:id|no)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
        /txn?\s*(?:id|no)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
        /ref\s*(?:no|number|id)?\s*[:.]?\s*([a-zA-Z0-9]{8,20})/gi,
        /([A-Z0-9]{12,20})(?:\s|$)/g,
        /upi transaction id\s*([a-zA-Z0-9]{8,20})/gi,
        /transaction id\s*([a-zA-Z0-9]{8,20})/gi,
        /ID\s*:\s*([A-Z0-9]{10,20})/gi
    ];

    for (const pattern of transactionPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            const txnId = matches[0].replace(/[^a-zA-Z0-9]/gi, '').trim();
            if (txnId.length >= 8) {
                console.log(`✅ Found Transaction ID: ${txnId}`);
                return txnId;
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
        /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
        /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/gi,
        /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/gi,
        /(\d{1,2}\s+\w+\s+\d{4},?\s+\d{1,2}:\d{2}\s*(?:am|pm)?)/gi,
        /(\d{1,2}:\d{2})\s*(?:IST|UTC|GMT)?/gi,
        /on\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/gi,
        /at\s+(\d{1,2}:\d{2})/gi
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
    
    if (text.includes('completed')) {
        console.log(`✅ Payment Status: Success (found "completed")`);
        return 'success';
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
        { name: 'iob', patterns: ['indian overseas bank', 'iob'] },
        { name: 'pnb', patterns: ['pnb', 'punjab national bank'] },
        { name: 'kotak', patterns: ['kotak', 'kotak mahindra'] },
        { name: 'yes', patterns: ['yes bank'] }
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
        'gpay': ['gpay', 'google pay', 'google pay'],
        'phonepe': ['phonepe'],
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

    // Filter only TRULY PENDING orders
    const trulyPendingOrders = pendingOrders.filter(order => {
        const status = order.status?.toLowerCase();
        const paymentStatus = order.paymentStatus?.toLowerCase();
        
        return (status === 'pending' || status === 'awaiting_payment') &&
               (paymentStatus === 'pending' || paymentStatus === 'awaiting_payment');
    });

    if (trulyPendingOrders.length === 0) {
        validation.errors.push('❌ No pending orders found. Your orders may already be verified.');
        return validation;
    }

    // Log orders with details
    console.log('📋 Pending orders:');
    trulyPendingOrders.forEach((order, index) => {
        const productNames = order.items?.map(item => item.productName).join(', ') || 'Unknown';
        console.log(`  ${index + 1}. Order: ${order.orderNumber}, Amount: ₹${order.totalPrice}, Products: ${productNames}`);
    });

    // Validate payment status
    if (paymentStatus !== 'success') {
        validation.errors.push('❌ Payment status not successful');
        validation.autoVerifiable = false;
        console.log('❌ Payment status validation failed');
    }

    // If no amount detected, we can't proceed
    if (!extractedAmount) {
        validation.errors.push('❌ Could not detect payment amount in screenshot');
        validation.warnings.push('💡 Please ensure the payment amount (₹) is clearly visible in the screenshot');
        validation.autoVerifiable = false;
        console.log('❌ No amount detected in OCR');
        return validation;
    }

    console.log(`💰 Looking for order matching amount: ₹${extractedAmount}`);
    
    // Find matching order by amount - Enhanced matching
    let matchedOrder = null;
    let matchType = 'none';
    let amountDifference = Infinity;
    let matchScore = 0;
    
    for (const order of trulyPendingOrders) {
        const orderAmount = order.totalPrice;
        const diff = Math.abs(extractedAmount - orderAmount);
        
        // Calculate match score
        let score = 0;
        let type = 'none';
        
        if (diff === 0) {
            score = 100;
            type = 'exact';
        } else if (diff <= VALIDATION_CONFIG.amountTolerance) {
            score = 80 - (diff * 2); // Score decreases with difference
            type = 'close';
        } else if (diff <= 20) {
            score = 60 - diff; // Small penalty for larger differences
            type = 'near';
        }
        
        console.log(`   Order ${order.orderNumber}: ₹${orderAmount}, Diff: ₹${diff}, Score: ${score}, Type: ${type}`);
        
        if (score > matchScore) {
            matchedOrder = order;
            matchType = type;
            amountDifference = diff;
            matchScore = score;
            
            if (type === 'exact') {
                break; // Found perfect match
            }
        }
    }

    if (!matchedOrder) {
        const errorMsg = `❌ No matching order found for payment of ₹${extractedAmount}`;
        validation.errors.push(errorMsg);
        
        // Show user their pending orders with product names
        if (trulyPendingOrders.length > 0) {
            validation.warnings.push(`📋 Your pending orders:`);
            trulyPendingOrders.slice(0, 3).forEach(order => {
                const productNames = order.items?.map(item => item.productName).join(', ') || 'Product';
                validation.warnings.push(`   • ${order.orderNumber}: ${productNames} - ₹${order.totalPrice}`);
            });
            
            validation.warnings.push(`💡 Please pay exactly ₹${trulyPendingOrders[0].totalPrice} for ${trulyPendingOrders[0].items?.[0]?.productName || 'your order'}`);
        }
        
        console.log('❌ No matching order found for amount:', extractedAmount);
        return validation;
    }

    validation.matchedOrder = matchedOrder;
    validation.matchQuality = matchType;
    
    // Store product details
    const productNames = matchedOrder.items?.map(item => item.productName).join(', ') || 'Product';
    console.log(`✅ Matched Order: ${matchedOrder.orderNumber}, Amount: ₹${matchedOrder.totalPrice}, Products: ${productNames}, Match Type: ${matchType}`);

    validation.matchedOrder.productDetails = {
        names: productNames,
        items: matchedOrder.items || []
    };

    // Validate UPI ID with enhanced validation
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
        console.log('❌ UPI validation failed');
    } else {
        console.log('✅ UPI validation passed');
    }

    // Validate amount match details
    const amountValidation = {
        isValid: amountDifference <= VALIDATION_CONFIG.amountTolerance,
        expected: matchedOrder.totalPrice,
        found: extractedAmount,
        difference: amountDifference,
        matchType: matchType
    };
    
    validation.details.amount = amountValidation;
    
    if (!amountValidation.isValid) {
        validation.errors.push(`❌ Amount mismatch: Paid ₹${extractedAmount}, Expected ₹${matchedOrder.totalPrice} (Difference: ₹${amountDifference})`);
        console.log('❌ Amount validation failed');
    } else {
        console.log('✅ Amount validation passed');
    }

    // Calculate confidence score
    validation.confidence = calculateConfidenceScore(validation);
    
    // Determine if payment is valid
    validation.isValid = 
        validation.errors.length === 0 && 
        validation.confidence >= VALIDATION_CONFIG.minConfidenceScore &&
        paymentStatus === 'success' &&
        validation.autoVerifiable &&
        amountValidation.isValid &&
        upiValidation.isValid;

    console.log(`📊 Final Validation Result:`, {
        isValid: validation.isValid,
        confidence: validation.confidence,
        matchType: matchType,
        amountDifference: amountDifference,
        errors: validation.errors.length,
        autoVerifiable: validation.autoVerifiable
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
        
        // Contains match (handle spaces and special chars)
        const extractedWithoutSpaces = cleanExtracted.replace(/\s/g, '');
        const validWithoutSpaces = cleanValid.replace(/\s/g, '');
        
        if (extractedWithoutSpaces.includes(validWithoutSpaces) || 
            validWithoutSpaces.includes(extractedWithoutSpaces)) {
            return { 
                isValid: true, 
                found: validUPI, 
                extracted: extractedUPI,
                matchType: 'contains'
            };
        }
        
        // Partial match (common patterns)
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

    // Base scores based on match type
    switch (validation.matchQuality) {
        case 'exact':
            score += 50;
            break;
        case 'close':
            score += 40;
            break;
        case 'near':
            score += 30;
            break;
        default:
            score += 10;
    }
    
    // UPI validation score
    if (validation.details.upi.isValid) {
        switch (validation.details.upi.matchType) {
            case 'exact':
                score += 30;
                break;
            case 'contains':
                score += 25;
                break;
            case 'partial':
                score += 20;
                break;
            default:
                score += 15;
        }
    }
    
    // Payment status score
    if (validation.details.paymentStatus === 'success') {
        score += 10;
    }
    
    // Transaction ID score
    if (validation.details.transactionId) {
        score += 10;
    }
    
    // Penalties
    if (validation.errors.length > 0) {
        score -= validation.errors.length * 15;
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Process successful verification
 */
async function processSuccessfulVerification(verificationResult, client, originalMessage, imageData, ocrResult, customerPhone) {
    try {
        const order = verificationResult.matchedOrder;
        const productNames = verificationResult.matchedOrder.productDetails?.names || 'Product';
        
        console.log(`✅ Processing successful verification for order: ${order.orderNumber}, Product: ${productNames}`);

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
                imageData: imageData.substring(0, 10000), // Store only part of image to avoid large payloads
                mimeType: 'image/jpeg'
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
                amountMatch: verificationResult.details.amount.isValid,
                upiMatch: verificationResult.details.upi.isValid,
                confidenceScore: verificationResult.confidence,
                matchQuality: verificationResult.matchQuality,
                timeValidated: true
            },
            status: 'verified',
            verifiedBy: 'auto_ocr',
            verifiedAt: new Date()
        });

        if (!paymentVerification) {
            throw new Error('Failed to create payment verification record');
        }

        console.log('✅ Payment verification record created:', paymentVerification._id);

        // Update order status
        console.log('🔄 Updating order status for:', order._id);
        
        try {
            const orderUpdateResult = await apiService.updateOrderStatus(order._id, 'processing');
            console.log('✅ Order status update result:', orderUpdateResult);
            
            // Also update payment status
            await apiService.updateOrderPaymentStatus(order.orderNumber, {
                paymentStatus: 'paid',
                paymentVerified: true,
                verificationId: paymentVerification._id,
                paidAt: new Date()
            });
            
        } catch (updateError) {
            console.warn('⚠️ Order status update failed:', updateError.message);
        }

        // Store user verification state
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

        console.log(`🎉 Payment verification completed successfully for ${productNames}`);

    } catch (error) {
        console.error('Successful verification processing error:', error);
        
        // Still send success message to user
        await originalMessage.reply(
            '✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n' +
            'Your payment has been verified and your order is being processed.\n\n' +
            'If you have any questions, please contact support.'
        );
    }
}

/**
 * Send success messages to customer
 */
async function sendSuccessMessages(order, verificationResult, message, productNames) {
    const confidence = Math.round(verificationResult.confidence);
    const customerPhone = apiService.cleanPhoneNumber(message.from);
    
    // Get actual product details
    const actualProductNames = productNames || order.items?.map(item => item.productName).join(', ') || 'Your Product';
    
    // Build order items text
    let orderItemsText = '';
    if (order.items && order.items.length > 0) {
        orderItemsText = `📝 *Order Items:*\n`;
        order.items.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            const productName = item.productName || 'Product';
            orderItemsText += `• ${productName} x ${item.quantity || 1} - ₹${itemTotal}\n`;
        });
        orderItemsText += `\n`;
    }

    // Send confirmation
    let successMessage = 
        `✅ *PAYMENT VERIFIED SUCCESSFULLY!*\n\n` +
        `🧾 *Order Number:* ${order.orderNumber}\n` +
        `👤 *Customer:* ${order.customerName || 'Customer'}\n` +
        `📦 *Product:* ${actualProductNames}\n` +
        `💰 *Amount Paid:* ₹${order.totalPrice}\n` +
        `🎯 *Verification Score:* ${confidence}%\n` +
        `📊 *Status:* Order Confirmed & Processing\n\n` +
        `*Your order is now being processed.*\n\n` +
        orderItemsText +
        `🚚 *What Happens Next:*\n` +
        `• Order processing: 24-48 hours\n` +
        `• Quality check & packaging\n` +
        `• Shipping confirmation with tracking\n` +
        `• Delivery: 3-5 business days\n\n` +
        `📞 *Customer Support:*\n` +
        `For any queries, simply reply to this message.\n\n` +
        `🎉 *THANK YOU FOR YOUR PURCHASE!*\n\n` +
        `_To place a new order, send *!menu*_`;
    
    await message.reply(successMessage);

    // Clear verification state after 2 hours
    setTimeout(() => {
        if (verificationState.has(customerPhone)) {
            verificationState.delete(customerPhone);
            userOrderState.delete(customerPhone);
            console.log(`🔄 Cleared verification state for: ${customerPhone}`);
        }
    }, 2 * 60 * 60 * 1000);
}

/**
 * Send admin notification
 */
async function sendAdminNotification(order, customerPhone, confidence) {
    try {
        await notificationManager.sendNotification('PAYMENT_VERIFIED', {
            title: '✅ Payment Verified',
            body: `Payment of ₹${order.totalPrice} verified for order ${order.orderNumber}`,
            notificationData: {
                category: 'payment',
                priority: 'normal',
                referenceId: order.orderNumber,
                actionUrl: `/orders/${order.orderNumber}`,
                extraData: {
                    customerName: order.customerName,
                    customerPhone: customerPhone,
                    orderNumber: order.orderNumber,
                    amount: order.totalPrice,
                    product: order.items?.[0]?.productName,
                    confidence: confidence,
                    timestamp: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.warn('⚠️ Failed to send admin notification:', error.message);
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

    errorMessage += `*How to Fix This:*\n` +
        `1. ✅ Pay exactly ₹${order?.totalPrice || 'the order amount'}\n` +
        `2. ✅ Use our official UPI: ${VALID_UPI_IDS[0]}\n` +
        `3. ✅ Ensure payment shows "SUCCESSFUL" or "COMPLETED"\n` +
        `4. ✅ Take clear screenshot with all details visible\n` +
        `5. ✅ Send screenshot immediately after payment\n` +
        `6. ✅ Payment must be within last ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n\n` +
        `*Required in Screenshot:*\n` +
        `• Payment amount (₹${order?.totalPrice || 'XXX'})\n` +
        `• Our UPI ID (${VALID_UPI_IDS[0]})\n` +
        `• Transaction status: "SUCCESSFUL"\n` +
        `• Transaction/Reference ID\n` +
        `• Date and time (within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes)\n\n` +
        `Please try again with the correct payment details.`;

    await originalMessage.reply(errorMessage);
}

// ========== HELPER FUNCTIONS ==========

async function sendOldPaymentMessage(message, timeValidation) {
    await message.reply(
        `❌ *OLD PAYMENT SCREENSHOT*\n\n` +
        `This payment screenshot is too old.\n\n` +
        `*Details:*\n` +
        `• Detected time: ${timeValidation.detectedTime || 'Unknown'}\n` +
        `• Current time: ${timeValidation.currentTime || 'Unknown'}\n` +
        `• Time difference: ${timeValidation.reason}\n\n` +
        `*Please send a recent payment screenshot:*\n` +
        `✅ Make payment now\n` +
        `✅ Take screenshot immediately\n` +
        `✅ Send within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n\n` +
        `This ensures your order is processed quickly.`
    );
}

async function sendAlreadyVerifiedMessage(message, state) {
    const productName = state.productName || 'your product';
    
    await message.reply(
        `✅ *ORDER ALREADY VERIFIED!*\n\n` +
        `Your order *${state.orderNumber}* for *${productName}* is already verified and being processed.\n\n` +
        `💰 Amount Paid: ₹${state.amount}\n` +
        `📦 Status: Processing\n\n` +
        `_To place a new order, send *!menu*_\n` +
        `_For order status updates, contact support_`
    );
}

function validateImage(media) {
    const base64Length = media.data.length;
    const fileSizeInBytes = (base64Length * 3) / 4;
    
    if (fileSizeInBytes > VALIDATION_CONFIG.maxImageSize) {
        return {
            isValid: false,
            reason: `Image too large (${(fileSizeInBytes / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`
        };
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validMimeTypes.includes(media.mimetype)) {
        return {
            isValid: false,
            reason: `Invalid image format (${media.mimetype}). Please send JPEG, PNG, or WebP.`
        };
    }

    return { isValid: true };
}

async function sendNoPendingOrdersMessage(message) {
    await message.reply(
        '❌ *No Pending Orders Found*\n\n' +
        'You don\'t have any pending orders requiring payment.\n\n' +
        '*What to do:*\n' +
        '1. Place a new order first\n' +
        '2. Complete the order process\n' +
        '3. Then send payment screenshot\n\n' +
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
        `*Minimum required:* 50%\n\n` +
        `*Please send a proper payment screenshot from:*\n` +
        `• Google Pay (GPay)\n` +
        `• PhonePe\n` +
        `• PayTM\n` +
        `• BHIM UPI\n\n` +
        `Take a clear screenshot showing:\n` +
        `✅ Payment amount\n` +
        `✅ UPI ID\n` +
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
        `• Text found: ${ocrResult.text.length} characters\n` +
        `• Confidence: ${Math.round(ocrResult.confidence)}%\n` +
        `• Words detected: ${ocrResult.wordCount}\n\n` +
        `*Please ensure:*\n` +
        `✅ Screenshot is clear and high quality\n` +
        `✅ All transaction text is visible\n` +
        `✅ Text is not too small\n` +
        `✅ Screenshot is in English\n\n` +
        `Take a better screenshot and try again.`
    );
}

async function showPaymentInstructions(message, client) {
    await message.reply(
        `📋 *HOW TO MAKE PAYMENT & VERIFY*\n\n` +
        `*Step 1 - Make Payment:*\n` +
        `1. Open your UPI app (GPay, PhonePe, PayTM)\n` +
        `2. Send ₹[Your Order Amount] to: ${VALID_UPI_IDS[0]}\n` +
        `3. Ensure payment shows "SUCCESSFUL" or "COMPLETED"\n` +
        `4. Make payment now (don't use old screenshots)\n\n` +
        `*Step 2 - Send Screenshot:*\n` +
        `1. Take screenshot of successful payment\n` +
        `2. Ensure these are visible:\n` +
        `   • Amount: ₹[Your Order Amount]\n` +
        `   • Status: "SUCCESSFUL" or "COMPLETED"\n` +
        `   • To: ${VALID_UPI_IDS[0]}\n` +
        `   • Transaction/Reference ID\n` +
        `   • Date & Time (current)\n\n` +
        `*Step 3 - Automatic Verification:*\n` +
        `• We'll verify within seconds\n` +
        `• Payment must be within ${VALIDATION_CONFIG.recentPaymentThreshold} minutes\n` +
        `• You'll receive confirmation\n` +
        `• Order will be processed immediately`
    );
}

async function showVerificationHelp(message, client) {
    await message.reply(
        `🔒 *PAYMENT VERIFICATION SYSTEM*\n\n` +
        `*For Customers:*\n` +
        `Simply send UPI payment screenshot after payment\n` +
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
        try {
            await apiService.updateOrderStatus(verification.orderReference, 'processing');
            await apiService.updateOrderPaymentStatus(orderNumber, {
                paymentStatus: 'paid',
                paymentVerified: true
            });
        } catch (error) {
            console.warn('Order status update in manual verify failed:', error.message);
        }

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

        await apiService.markPaymentAsFraud(verification._id, [reasons], 'admin');

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

        let response = `📋 *PENDING PAYMENT VERIFICATIONS (${pendingVerifications.length})*\n\n`;
        
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
        const verification = await apiService.getPaymentVerificationByOrderNumber(orderNumber);
        
        if (!verification) {
            return await message.reply(`❌ No verified payment found for order: ${orderNumber}`);
        }

        // Send invoice notification
        await notificationManager.sendNotification('INVOICE_GENERATED', {
            orderNumber: orderNumber,
            customerPhone: verification.customerPhone,
            amount: verification.orderDetails?.totalAmount
        });

        await message.reply(`📄 Invoice generated for order: ${orderNumber}`);
        
    } catch (error) {
        console.error('Invoice command error:', error);
        await message.reply('❌ Failed to generate invoice.');
    }
}

async function showVerificationStats(message, client) {
    try {
        const stats = await apiService.getPaymentVerificationStats('week');
        
        const total = (stats.verified || 0) + (stats.pending || 0) + (stats.rejected || 0);
        const successRate = total > 0 ? Math.round(((stats.verified || 0) / total) * 100) : 0;
        
        const response = 
            `📊 *PAYMENT VERIFICATION STATISTICS*\n\n` +
            `✅ Verified: ${stats.verified || 0}\n` +
            `⏳ Pending: ${stats.pending || 0}\n` +
            `❌ Rejected: ${stats.rejected || 0}\n` +
            `🚨 Fraud: ${stats.fraud || 0}\n` +
            `🤖 Auto-Verified: ${stats.autoVerified || 0}\n` +
            `👤 Manual-Verified: ${stats.manualVerified || 0}\n` +
            `📈 Success Rate: ${successRate}%\n` +
            `📝 Total: ${total}`;

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
        response += `*Payment Indicators:*\n`;
        
        const indicatorAnalysis = analyzeTextForPaymentIndicators(ocrResult.text.toLowerCase());
        response += `Score: ${indicatorAnalysis.confidence}%\n`;
        response += `Found: ${indicatorAnalysis.foundIndicators.join(', ')}\n\n`;
        
        response += `*Time Detection Test:*\n`;
        const detectedTime = extractExactTime(ocrResult.text);
        if (detectedTime) {
            response += `Detected: ${detectedTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
            response += `Current: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
            response += `Difference: ${Math.round(Math.abs(new Date() - detectedTime) / (1000 * 60))} minutes\n`;
        } else {
            response += `No time detected\n`;
        }
        
        response += `\n*First 300 chars:*\n${ocrResult.text.substring(0, 300)}${ocrResult.text.length > 300 ? '...' : ''}`;

        await message.reply(response);
        
    } catch (error) {
        console.error('Test OCR error:', error);
        await message.reply('❌ OCR test failed.');
    }
}

// Export cleanup function
export function cleanupVerificationState() {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    
    for (const [phone, data] of verificationState.entries()) {
        if (now - data.timestamp > twoHours) {
            verificationState.delete(phone);
            userOrderState.delete(phone);
        }
    }
}

// Get user verification state (for other handlers)
export function getUserVerificationState(phone) {
    return verificationState.get(phone);
}

// Check if user is verified
export function isUserVerified(phone) {
    const state = verificationState.get(phone);
    return state ? state.verified : false;
}

export default handlePaymentVerification;