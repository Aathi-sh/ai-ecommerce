// // services/qrProcessor.js
// // PROFESSIONAL QR & PAYMENT PROCESSOR - Handles all payment formats with multi-tenant support
// // Industry standard: Supports UPI, QR codes, Phone numbers, and screenshots

// // ✅ FIXED: All require statements - CommonJS format
// import { spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs/promises';
// import os from 'os';
// import crypto from 'crypto';
// import sharp from 'sharp';
// import ocrEngine from './ocrEngine.js'

// // ✅ FIXED: Require the OCR engine (CommonJS style)
// //const ocrEngine = require('./ocrEngine');

// class QRProcessor {
//     constructor() {
//         this.tempDir = path.join(os.tmpdir(), 'qr-temp');
//         this.initializeTempDir();
        
//         // UPI validation patterns - Industry standard
//         this.upiPatterns = {
//             // VPA (Virtual Payment Address) pattern
//             vpa: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
            
//             // Bank account patterns
//             bankAccount: /^\d{9,18}$/,
//             ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            
//             // Phone number patterns
//             phone: /^(\+91|91)?[6-9]\d{9}$/,
            
//             // QR code prefixes
//             qrPrefixes: {
//                 upi: 'upi://',
//                 paytm: 'paytm://',
//                 phonepe: 'phonepe://',
//                 gpay: 'gpay://'
//             }
//         };

//         // Configuration
//         this.config = {
//             maxQRSize: 5 * 1024 * 1024, // 5MB
//             supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
//             validationTimeout: 10000, // 10 seconds
//             companyUpiCacheTime: 300000 // 5 minutes cache
//         };

//         // Company UPI cache (reduces database calls)
//         this.companyUpiCache = new Map();

//         console.log('🔧 [QRProcessor] Initialized with multi-format support');
//     }

//     async initializeTempDir() {
//         try {
//             await fs.mkdir(this.tempDir, { recursive: true });
//             console.log(`📁 [QRProcessor] Temp directory: ${this.tempDir}`);
//         } catch (error) {
//             console.error('❌ [QRProcessor] Failed to create temp dir:', error);
//         }
//     }

//     /**
//      * Main processor - Handles ALL payment types professionally
//      * @param {Object} paymentData - Payment data from customer
//      * @param {string} paymentData.companyId - Company ID for multi-tenancy
//      * @param {string} paymentData.customerPhone - Customer phone number
//      * @param {string} paymentData.message - Original message from customer
//      * @param {Buffer} paymentData.image - Image buffer (if screenshot/QR)
//      * @param {Object} paymentData.order - Order details if available
//      * @returns {Object} Professional payment verification result
//      */
//     async processPayment(paymentData) {
//         const requestId = crypto.randomBytes(8).toString('hex');
//         const startTime = Date.now();

//         console.log(`\n🔍 [QRProcessor:${requestId}] Processing payment for company: ${paymentData.companyId}`);

//         try {
//             // Step 1: Get company UPI IDs (multi-tenant critical)
//             const companyUpiIds = await this.getCompanyUpiIds(paymentData.companyId);
            
//             if (!companyUpiIds || companyUpiIds.length === 0) {
//                 return this.createErrorResult('Company has no UPI IDs configured', requestId);
//             }

//             // Step 2: Detect payment type
//             const paymentType = await this.detectPaymentType(paymentData);
//             console.log(`📱 [QRProcessor:${requestId}] Detected payment type: ${paymentType}`);

//             // Step 3: Process based on type
//             let extractionResult;

//             switch (paymentType) {
//                 case 'qr_code':
//                     extractionResult = await this.processQRCode(paymentData.image, companyUpiIds);
//                     break;
                    
//                 case 'screenshot':
//                     extractionResult = await this.processScreenshot(paymentData.image, paymentData.order, companyUpiIds);
//                     break;
                    
//                 case 'upi_text':
//                     extractionResult = await this.processUPIText(paymentData.message, companyUpiIds);
//                     break;
                    
//                 case 'phone_number':
//                     extractionResult = await this.processPhoneNumber(paymentData.message, companyUpiIds);
//                     break;
                    
//                 default:
//                     extractionResult = await this.processUnknown(paymentData, companyUpiIds);
//             }

//             // Step 4: Validate against order if available
//             if (paymentData.order) {
//                 extractionResult = await this.validateAgainstOrder(extractionResult, paymentData.order, companyUpiIds);
//             }

//             // Step 5: Make final decision
//             extractionResult.decision = this.makeDecision(extractionResult);
            
//             // Step 6: Add metadata
//             extractionResult.metadata = {
//                 ...extractionResult.metadata,
//                 requestId,
//                 processingTime: Date.now() - startTime,
//                 paymentType,
//                 companyId: paymentData.companyId,
//                 customerPhone: paymentData.customerPhone,
//                 timestamp: new Date().toISOString()
//             };

//             // Step 7: Log for audit
//             this.logPayment(requestId, extractionResult);

//             console.log(`✅ [QRProcessor:${requestId}] Completed in ${extractionResult.metadata.processingTime}ms`);
//             console.log(`   Type: ${paymentType}, Confidence: ${extractionResult.confidence}%, Decision: ${extractionResult.decision.action}`);

//             return extractionResult;

//         } catch (error) {
//             console.error(`❌ [QRProcessor:${requestId}] Fatal error:`, error);
//             return this.createErrorResult(error.message, requestId);
//         }
//     }

//     /**
//      * Get company UPI IDs from database/cache
//      */
//     async getCompanyUpiIds(companyId) {
//         try {
//             // Check cache first
//             const cached = this.companyUpiCache.get(companyId);
//             if (cached && Date.now() - cached.timestamp < this.config.companyUpiCacheTime) {
//                 return cached.upiIds;
//             }

//             // Fetch from database (you'll implement your DB call)
//             // This should query CompanySettings or similar
//             const upiIds = await this.fetchCompanyUpiIdsFromDB(companyId);
            
//             // Update cache
//             this.companyUpiCache.set(companyId, {
//                 upiIds,
//                 timestamp: Date.now()
//             });

//             return upiIds;

//         } catch (error) {
//             console.error(`❌ [QRProcessor] Failed to get UPI IDs for company ${companyId}:`, error);
//             return [];
//         }
//     }

//     /**
//      * Fetch company UPI IDs from database - IMPLEMENT WITH YOUR DB
//      */
//     async fetchCompanyUpiIdsFromDB(companyId) {
//         // TODO: Replace with your actual database call
//         // Example: return await CompanySettings.find({ companyId }).select('upiIds');
        
//         // Placeholder - Remove this and implement actual DB call
//         return [
//             'posterpro.store@okaxis',
//             'posterpro@paytm',
//             'posterpro@ybl'
//         ];
//     }

//     /**
//      * Detect what type of payment this is
//      */
//     async detectPaymentType(paymentData) {
//         // Check if it's an image
//         if (paymentData.image) {
//             // Check if it's a QR code
//             if (await this.isQRCode(paymentData.image)) {
//                 return 'qr_code';
//             }
//             // Otherwise it's a screenshot
//             return 'screenshot';
//         }

//         // Check if it's UPI text
//         if (paymentData.message) {
//             const message = paymentData.message.toLowerCase();
            
//             // Check for UPI ID pattern
//             if (this.upiPatterns.vpa.test(message)) {
//                 return 'upi_text';
//             }
            
//             // Check for phone number
//             if (this.upiPatterns.phone.test(message.replace(/\s/g, ''))) {
//                 return 'phone_number';
//             }
            
//             // Check for amount pattern
//             if (message.includes('rs') || message.includes('₹') || message.includes('rupees')) {
//                 return 'upi_text';
//             }
//         }

//         return 'unknown';
//     }

//     /**
//      * Check if image is a QR code
//      */
//     async isQRCode(imageBuffer) {
//         try {
//             // Use sharp to analyze image
//             const metadata = await sharp(imageBuffer).metadata();
            
//             // QR codes are usually square and high contrast
//             const isSquare = Math.abs(metadata.width - metadata.height) < 50;
//             const hasHighContrast = await this.checkHighContrast(imageBuffer);
            
//             // Quick QR code detection using Python
//             const isQR = await this.detectQRWithPython(imageBuffer);
            
//             return isQR || (isSquare && hasHighContrast);

//         } catch (error) {
//             console.error('❌ [QRProcessor] QR detection failed:', error);
//             return false;
//         }
//     }

//     /**
//      * Detect QR code using Python
//      */
//     async detectQRWithPython(imageBuffer) {
//         return new Promise((resolve, reject) => {
//             const scriptPath = path.join(__dirname, 'qr_detector.py');
            
//             // Create Python script if not exists
//             this.ensureQRDetectorScript(scriptPath);
            
//             // Save image to temp file
//             const tempFile = path.join(this.tempDir, `qr_${Date.now()}.jpg`);
            
//             fs.writeFile(tempFile, imageBuffer)
//                 .then(() => {
//                     const pythonProcess = spawn('python', [scriptPath, tempFile]);

//                     let outputData = '';

//                     pythonProcess.stdout.on('data', (data) => {
//                         outputData += data.toString();
//                     });

//                     pythonProcess.on('close', (code) => {
//                         // Cleanup
//                         fs.unlink(tempFile).catch(() => {});
                        
//                         if (code === 0 && outputData.trim() === 'true') {
//                             resolve(true);
//                         } else {
//                             resolve(false);
//                         }
//                     });

//                     pythonProcess.on('error', () => {
//                         resolve(false);
//                     });
//                 })
//                 .catch(() => resolve(false));
//         });
//     }

//     /**
//      * Check if image has high contrast (QR code characteristic)
//      */
//     async checkHighContrast(imageBuffer) {
//         try {
//             const stats = await sharp(imageBuffer)
//                 .grayscale()
//                 .stats();
            
//             const contrast = stats.channels[0].max - stats.channels[0].min;
//             return contrast > 150; // High contrast threshold

//         } catch (error) {
//             return false;
//         }
//     }

//     /**
//      * Process QR code image
//      */
//     async processQRCode(imageBuffer, companyUpiIds) {
//         try {
//             // Decode QR code using Python
//             const qrData = await this.decodeQR(imageBuffer);
            
//             if (!qrData) {
//                 return {
//                     success: false,
//                     error: 'Could not decode QR code',
//                     confidence: 0,
//                     requiresManual: true
//                 };
//             }

//             // Parse UPI QR data
//             const upiData = this.parseUPIQR(qrData);
            
//             // Validate against company UPI IDs
//             const upiValidation = this.validateUPI(upiData.upiId, companyUpiIds);
            
//             const result = {
//                 success: true,
//                 type: 'qr_code',
//                 extractedFields: {
//                     amount: upiData.amount,
//                     upiId: upiData.upiId,
//                     transactionId: upiData.transactionId || null,
//                     payeeName: upiData.payeeName,
//                     note: upiData.note
//                 },
//                 validation: {
//                     upiMatch: upiValidation.isValid,
//                     matchedUpiId: upiValidation.matchedId,
//                     amountPresent: !!upiData.amount
//                 },
//                 confidence: upiValidation.isValid ? 95 : 70,
//                 rawData: qrData
//             };

//             return result;

//         } catch (error) {
//             console.error('❌ [QRProcessor] QR processing failed:', error);
//             return {
//                 success: false,
//                 error: error.message,
//                 confidence: 0,
//                 requiresManual: true
//             };
//         }
//     }

//     /**
//      * Decode QR code using Python
//      */
//     async decodeQR(imageBuffer) {
//         return new Promise((resolve, reject) => {
//             const scriptPath = path.join(__dirname, 'qr_decoder.py');
            
//             // Create Python script if not exists
//             this.ensureQRDecoderScript(scriptPath);
            
//             const tempFile = path.join(this.tempDir, `qr_decode_${Date.now()}.jpg`);
            
//             fs.writeFile(tempFile, imageBuffer)
//                 .then(() => {
//                     const pythonProcess = spawn('python', [scriptPath, tempFile]);

//                     let outputData = '';

//                     pythonProcess.stdout.on('data', (data) => {
//                         outputData += data.toString();
//                     });

//                     pythonProcess.on('close', (code) => {
//                         // Cleanup
//                         fs.unlink(tempFile).catch(() => {});
                        
//                         if (code === 0 && outputData) {
//                             try {
//                                 const result = JSON.parse(outputData);
//                                 resolve(result);
//                             } catch {
//                                 resolve(outputData);
//                             }
//                         } else {
//                             resolve(null);
//                         }
//                     });

//                     pythonProcess.on('error', () => {
//                         resolve(null);
//                     });
//                 })
//                 .catch(() => resolve(null));
//         });
//     }

//     /**
//      * Parse UPI QR code data
//      */
//     parseUPIQR(qrData) {
//         const result = {
//             upiId: null,
//             amount: null,
//             payeeName: null,
//             note: null,
//             transactionId: null
//         };

//         // Handle different QR formats
//         if (typeof qrData === 'string') {
//             // Check if it's a UPI URL
//             if (qrData.startsWith('upi://')) {
//                 const url = new URL(qrData);
//                 const params = new URLSearchParams(url.search);
                
//                 result.upiId = params.get('pa'); // payee address
//                 result.amount = params.get('am') ? parseFloat(params.get('am')) : null;
//                 result.payeeName = params.get('pn'); // payee name
//                 result.note = params.get('tn'); // transaction note
//             }
//             // Check if it's a simple string
//             else if (qrData.includes('@')) {
//                 result.upiId = qrData;
//             }
//         }
//         // Handle object response
//         else if (typeof qrData === 'object') {
//             result.upiId = qrData.pa || qrData.upiId || qrData.vpa;
//             result.amount = qrData.am || qrData.amount;
//             result.payeeName = qrData.pn || qrData.name;
//             result.note = qrData.tn || qrData.note;
//         }

//         return result;
//     }

//     /**
//      * Process payment screenshot (uses OCR engine)
//      */
//     async processScreenshot(imageBuffer, order, companyUpiIds) {
//         // Use the OCR engine we already created
//         const ocrResult = await ocrEngine.processPaymentScreenshot(imageBuffer, order);
        
//         // Add company UPI validation
//         if (ocrResult.extractedFields?.upiId) {
//             const upiValidation = this.validateUPI(ocrResult.extractedFields.upiId, companyUpiIds);
//             ocrResult.validation.upiMatch = upiValidation.isValid;
//             ocrResult.validation.matchedUpiId = upiValidation.matchedId;
            
//             // Adjust confidence based on UPI match
//             if (upiValidation.isValid) {
//                 ocrResult.confidence = Math.min(100, ocrResult.confidence + 10);
//             } else {
//                 ocrResult.confidence = Math.max(0, ocrResult.confidence - 20);
//             }
//         }

//         return {
//             ...ocrResult,
//             type: 'screenshot'
//         };
//     }

//     /**
//      * Process UPI ID text message
//      */
//     async processUPIText(message, companyUpiIds) {
//         const extracted = this.extractFromText(message);
//         const upiValidation = this.validateUPI(extracted.upiId, companyUpiIds);
        
//         return {
//             success: true,
//             type: 'upi_text',
//             extractedFields: extracted,
//             validation: {
//                 upiMatch: upiValidation.isValid,
//                 matchedUpiId: upiValidation.matchedId,
//                 amountValid: !!extracted.amount
//             },
//             confidence: upiValidation.isValid ? 90 : 50,
//             decision: {
//                 action: upiValidation.isValid ? 'auto_verify' : 'manual_review',
//                 reason: upiValidation.isValid ? 'Valid UPI ID provided' : 'UPI ID not recognized'
//             }
//         };
//     }

//     /**
//      * Process phone number message
//      */
//     async processPhoneNumber(message, companyUpiIds) {
//         const phoneNumber = message.replace(/\D/g, '');
        
//         // Check if phone number matches any company UPI (some UPI IDs are phone numbers)
//         const phoneUpi = `${phoneNumber}@ybl`; // Common pattern
//         const upiValidation = this.validateUPI(phoneUpi, companyUpiIds);
        
//         return {
//             success: true,
//             type: 'phone_number',
//             extractedFields: {
//                 phoneNumber,
//                 upiId: phoneUpi
//             },
//             validation: {
//                 upiMatch: upiValidation.isValid,
//                 matchedUpiId: upiValidation.matchedId
//             },
//             confidence: upiValidation.isValid ? 85 : 40,
//             decision: {
//                 action: upiValidation.isValid ? 'auto_verify' : 'manual_review',
//                 reason: upiValidation.isValid ? 'Phone number matches company UPI' : 'Phone number not recognized'
//             }
//         };
//     }

//     /**
//      * Process unknown payment type
//      */
//     async processUnknown(paymentData, companyUpiIds) {
//         return {
//             success: false,
//             type: 'unknown',
//             extractedFields: {},
//             validation: {},
//             confidence: 0,
//             decision: {
//                 action: 'manual_review',
//                 reason: 'Could not determine payment type',
//                 autoVerifiable: false,
//                 requiresHuman: true
//             }
//         };
//     }

//     /**
//      * Extract payment information from text message
//      */
//     extractFromText(message) {
//         const result = {
//             upiId: null,
//             amount: null,
//             transactionId: null
//         };

//         const text = message.toLowerCase();

//         // Extract UPI ID
//         const upiMatch = text.match(this.upiPatterns.vpa);
//         if (upiMatch) {
//             result.upiId = upiMatch[0];
//         }

//         // Extract amount
//         const amountRegex = /(?:rs\.?|₹|inr)\s*(\d+(?:[.,]\d+)?)/i;
//         const amountMatch = text.match(amountRegex);
//         if (amountMatch) {
//             result.amount = parseFloat(amountMatch[1].replace(/[.,]/g, ''));
//         }

//         // Extract transaction ID
//         const txnRegex = /(?:txn|trn|ref|utr|id)[:\s]*([a-zA-Z0-9]{8,20})/i;
//         const txnMatch = text.match(txnRegex);
//         if (txnMatch) {
//             result.transactionId = txnMatch[1];
//         }

//         return result;
//     }

//     /**
//      * Validate UPI ID against company's UPI IDs
//      */
//     validateUPI(upiId, companyUpiIds) {
//         if (!upiId || !companyUpiIds || companyUpiIds.length === 0) {
//             return { isValid: false, matchedId: null };
//         }

//         const cleanUpi = upiId.toLowerCase().trim();

//         for (const validUpi of companyUpiIds) {
//             const cleanValid = validUpi.toLowerCase().trim();
            
//             // Exact match
//             if (cleanUpi === cleanValid) {
//                 return {
//                     isValid: true,
//                     matchedId: validUpi,
//                     matchType: 'exact'
//                 };
//             }
            
//             // Contains match
//             if (cleanUpi.includes(cleanValid) || cleanValid.includes(cleanUpi)) {
//                 return {
//                     isValid: true,
//                     matchedId: validUpi,
//                     matchType: 'partial'
//                 };
//             }
//         }

//         return { isValid: false, matchedId: null };
//     }

//     /**
//      * Validate against order details
//      */
//     async validateAgainstOrder(extractionResult, order, companyUpiIds) {
//         const result = { ...extractionResult };
        
//         if (!result.validation) {
//             result.validation = {};
//         }

//         // Amount validation
//         if (result.extractedFields?.amount && order.totalPrice) {
//             const diff = Math.abs(result.extractedFields.amount - order.totalPrice);
//             result.validation.amountMatch = diff <= 2;
//             result.validation.amountDifference = diff;
            
//             // Adjust confidence based on amount match
//             if (result.validation.amountMatch) {
//                 result.confidence += 10;
//             } else {
//                 result.confidence -= 20;
//             }
//         }

//         // UPI validation (already done, but ensure it's present)
//         if (result.extractedFields?.upiId) {
//             const upiValidation = this.validateUPI(result.extractedFields.upiId, companyUpiIds);
//             result.validation.upiMatch = upiValidation.isValid;
//             result.validation.matchedUpiId = upiValidation.matchedId;
//         }

//         // Ensure confidence is within bounds
//         result.confidence = Math.max(0, Math.min(100, result.confidence));

//         return result;
//     }

//     /**
//      * Make final decision
//      */
//     makeDecision(result) {
//         const decision = {
//             action: 'manual_review',
//             reason: '',
//             autoVerifiable: false,
//             requiresHuman: true,
//             priority: 'normal'
//         };

//         if (result.confidence >= 90) {
//             decision.action = 'auto_verify';
//             decision.reason = `High confidence (${result.confidence}%)`;
//             decision.autoVerifiable = true;
//             decision.requiresHuman = false;
//             decision.priority = 'low';
//         }
//         else if (result.confidence >= 70) {
//             decision.action = 'backup_verified';
//             decision.reason = `Medium confidence (${result.confidence}%) - Review recommended`;
//             decision.autoVerifiable = true;
//             decision.requiresHuman = false;
//             decision.priority = 'normal';
//         }
//         else if (result.confidence >= 40) {
//             decision.action = 'manual_review';
//             decision.reason = `Low confidence (${result.confidence}%) - Requires verification`;
//             decision.autoVerifiable = false;
//             decision.requiresHuman = true;
//             decision.priority = 'high';
//         }
//         else {
//             decision.action = 'fraud_alert';
//             decision.reason = `Very low confidence (${result.confidence}%) - Potential fraud`;
//             decision.autoVerifiable = false;
//             decision.requiresHuman = true;
//             decision.priority = 'critical';
//         }

//         return decision;
//     }

//     /**
//      * Create QR detector Python script
//      */
//     ensureQRDetectorScript(scriptPath) {
//         const script = `
// import sys
// import cv2
// import numpy as np

// def detect_qr(image_path):
//     try:
//         # Read image
//         img = cv2.imread(image_path)
//         if img is None:
//             return False
        
//         # Initialize QR detector
//         detector = cv2.QRCodeDetector()
        
//         # Detect QR code
//         retval, points, straight_qrcode = detector.detectAndDecode(img)
        
//         # Return True if QR code found
//         return bool(retval)
        
//     except Exception as e:
//         return False

// if __name__ == "__main__":
//     if len(sys.argv) < 2:
//         print("false")
//         sys.exit(1)
    
//     result = detect_qr(sys.argv[1])
//     print(str(result).lower())
// `;
        
//         try {
//             fs.accessSync(scriptPath);
//         } catch {
//             fs.writeFileSync(scriptPath, script);
//             console.log(`📝 Created QR detector script: ${scriptPath}`);
//         }
//     }

//     /**
//      * Create QR decoder Python script
//      */
//     ensureQRDecoderScript(scriptPath) {
//         const script = `
// import sys
// import cv2
// import json
// import numpy as np

// def decode_qr(image_path):
//     try:
//         # Read image
//         img = cv2.imread(image_path)
//         if img is None:
//             return None
        
//         # Initialize QR detector
//         detector = cv2.QRCodeDetector()
        
//         # Detect and decode QR code
//         data, points, straight_qrcode = detector.detectAndDecode(img)
        
//         if data:
//             # Try to parse as UPI QR
//             if data.startswith('upi://'):
//                 return json.dumps({"type": "upi", "data": data})
//             else:
//                 return json.dumps({"type": "text", "data": data})
//         else:
//             return None
            
//     except Exception as e:
//         return None

// if __name__ == "__main__":
//     if len(sys.argv) < 2:
//         print("null")
//         sys.exit(1)
    
//     result = decode_qr(sys.argv[1])
//     if result:
//         print(result)
//     else:
//         print("null")
// `;
        
//         try {
//             fs.accessSync(scriptPath);
//         } catch {
//             fs.writeFileSync(scriptPath, script);
//             console.log(`📝 Created QR decoder script: ${scriptPath}`);
//         }
//     }

//     /**
//      * Create error result
//      */
//     createErrorResult(error, requestId) {
//         return {
//             success: false,
//             error,
//             metadata: {
//                 requestId,
//                 timestamp: new Date().toISOString(),
//                 processingTime: 0
//             },
//             decision: {
//                 action: 'manual_review',
//                 reason: `Processing failed: ${error}`,
//                 autoVerifiable: false,
//                 requiresHuman: true,
//                 priority: 'high'
//             }
//         };
//     }

//     /**
//      * Log payment for audit
//      */
//     logPayment(requestId, result) {
//         // TODO: Implement your logging mechanism
//         // Could write to file, database, or monitoring system
//         console.log(`📝 [AUDIT:${requestId}]`, JSON.stringify({
//             timestamp: new Date().toISOString(),
//             type: result.type,
//             confidence: result.confidence,
//             decision: result.decision.action,
//             extracted: result.extractedFields
//         }));
//     }

//     /**
//      * Clear company UPI cache (call when UPI IDs are updated)
//      */
//     clearCompanyCache(companyId) {
//         if (companyId) {
//             this.companyUpiCache.delete(companyId);
//             console.log(`🗑️ [QRProcessor] Cleared cache for company: ${companyId}`);
//         } else {
//             this.companyUpiCache.clear();
//             console.log(`🗑️ [QRProcessor] Cleared all company caches`);
//         }
//     }

//     /**
//      * Get processor statistics
//      */
//     getStats() {
//         return {
//             cacheSize: this.companyUpiCache.size,
//             tempDir: this.tempDir,
//             supportedFormats: this.config.supportedFormats,
//             uptime: process.uptime()
//         };
//     }
// }

// // ✅ FIXED: Create and export singleton instance using CommonJS
// const qrProcessor = new QRProcessor();
// export default qrProcessor;




















// services/qrProcessor.js
// PROFESSIONAL QR & PAYMENT PROCESSOR - Handles all payment formats with multi-tenant support
// Industry standard: Supports UPI, QR codes, Phone numbers, and screenshots
// UPDATED: Full multi-tenant support with company context

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import crypto from 'crypto';
import sharp from 'sharp';
import ocrEngine from './ocrEngine.js';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QRProcessor {
    constructor() {
        this.tempDir = path.join(os.tmpdir(), 'qr-temp');
        this.initializeTempDir();
        
        // UPI validation patterns - Industry standard
        this.upiPatterns = {
            // VPA (Virtual Payment Address) pattern
            vpa: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
            
            // Bank account patterns
            bankAccount: /^\d{9,18}$/,
            ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            
            // Phone number patterns
            phone: /^(\+91|91)?[6-9]\d{9}$/,
            
            // QR code prefixes
            qrPrefixes: {
                upi: 'upi://',
                paytm: 'paytm://',
                phonepe: 'phonepe://',
                gpay: 'gpay://'
            }
        };

        // Configuration
        this.config = {
            maxQRSize: 5 * 1024 * 1024, // 5MB
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            validationTimeout: 10000, // 10 seconds
            companyUpiCacheTime: 300000 // 5 minutes cache
        };

        // Company UPI cache (reduces database calls)
        this.companyUpiCache = new Map();

        console.log('🔧 [QRProcessor] Initialized with multi-format support');
    }

    async initializeTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
            console.log(`📁 [QRProcessor] Temp directory: ${this.tempDir}`);
        } catch (error) {
            console.error('❌ [QRProcessor] Failed to create temp dir:', error);
        }
    }

    /**
     * Main processor - Handles ALL payment types professionally
     * @param {Object} paymentData - Payment data from customer
     * @param {string} paymentData.companyId - Company ID for multi-tenancy
     * @param {string} paymentData.customerPhone - Customer phone number
     * @param {string} paymentData.message - Original message from customer
     * @param {Buffer} paymentData.image - Image buffer (if screenshot/QR)
     * @param {Object} paymentData.order - Order details if available
     * @returns {Object} Professional payment verification result
     */
    async processPayment(paymentData) {
        const requestId = crypto.randomBytes(8).toString('hex');
        const startTime = Date.now();

        console.log(`\n🔍 [QRProcessor:${requestId}] Processing payment for company: ${paymentData.companyId}`);

        try {
            // ✅ Step 1: Validate company ID
            if (!paymentData.companyId) {
                console.error(`❌ [QRProcessor:${requestId}] No company ID provided`);
                return this.createErrorResult('Company ID is required', requestId);
            }

            // Step 2: Get company UPI IDs (multi-tenant critical)
            const companyUpiIds = await this.getCompanyUpiIds(paymentData.companyId);
            
            if (!companyUpiIds || companyUpiIds.length === 0) {
                console.warn(`⚠️ [QRProcessor:${requestId}] Company has no UPI IDs configured`);
                return this.createErrorResult('Company has no UPI IDs configured', requestId, paymentData.companyId);
            }

            console.log(`💰 [QRProcessor:${requestId}] Company UPI IDs:`, companyUpiIds);

            // Step 3: Detect payment type
            const paymentType = await this.detectPaymentType(paymentData);
            console.log(`📱 [QRProcessor:${requestId}] Detected payment type: ${paymentType}`);

            // Step 4: Process based on type
            let extractionResult;

            switch (paymentType) {
                case 'qr_code':
                    extractionResult = await this.processQRCode(paymentData.image, companyUpiIds, paymentData.companyId);
                    break;
                    
                case 'screenshot':
                    extractionResult = await this.processScreenshot(paymentData.image, paymentData.order, companyUpiIds, paymentData.companyId);
                    break;
                    
                case 'upi_text':
                    extractionResult = await this.processUPIText(paymentData.message, companyUpiIds, paymentData.companyId);
                    break;
                    
                case 'phone_number':
                    extractionResult = await this.processPhoneNumber(paymentData.message, companyUpiIds, paymentData.companyId);
                    break;
                    
                default:
                    extractionResult = await this.processUnknown(paymentData, companyUpiIds, paymentData.companyId);
            }

            // Step 5: Validate against order if available
            if (paymentData.order) {
                extractionResult = await this.validateAgainstOrder(extractionResult, paymentData.order, companyUpiIds, paymentData.companyId);
            }

            // Step 6: Make final decision
            extractionResult.decision = this.makeDecision(extractionResult);
            
            // Step 7: Add metadata with company context
            extractionResult.metadata = {
                ...extractionResult.metadata,
                requestId,
                processingTime: Date.now() - startTime,
                paymentType,
                companyId: paymentData.companyId,
                customerPhone: paymentData.customerPhone,
                timestamp: new Date().toISOString()
            };

            // Step 8: Log for audit with company context
            this.logPayment(requestId, extractionResult, paymentData.companyId);

            console.log(`✅ [QRProcessor:${requestId}] Completed in ${extractionResult.metadata.processingTime}ms`);
            console.log(`   Type: ${paymentType}, Confidence: ${extractionResult.confidence}%, Decision: ${extractionResult.decision.action}`);
            console.log(`   Company: ${paymentData.companyId}`);

            return extractionResult;

        } catch (error) {
            console.error(`❌ [QRProcessor:${requestId}] Fatal error:`, error);
            return this.createErrorResult(error.message, requestId, paymentData?.companyId);
        }
    }

    /**
     * Get company UPI IDs from database/cache
     * @param {string} companyId - Company ID
     * @returns {Promise<Array>} Array of UPI IDs
     */
    async getCompanyUpiIds(companyId) {
        try {
            if (!companyId) return [];
            
            // Check cache first
            const cached = this.companyUpiCache.get(companyId);
            if (cached && Date.now() - cached.timestamp < this.config.companyUpiCacheTime) {
                console.log(`📦 [QRProcessor] Cache hit for company ${companyId}:`, cached.upiIds);
                return cached.upiIds;
            }

            console.log(`🔍 [QRProcessor] Cache miss for company ${companyId}, fetching from DB...`);

            // Fetch from database (you'll implement your DB call)
            // This should query CompanySettings or similar
            const upiIds = await this.fetchCompanyUpiIdsFromDB(companyId);
            
            // Update cache
            this.companyUpiCache.set(companyId, {
                upiIds,
                timestamp: Date.now()
            });

            console.log(`✅ [QRProcessor] Fetched UPI IDs for company ${companyId}:`, upiIds);

            return upiIds;

        } catch (error) {
            console.error(`❌ [QRProcessor] Failed to get UPI IDs for company ${companyId}:`, error);
            return [];
        }
    }

    /**
     * Fetch company UPI IDs from database - IMPLEMENT WITH YOUR DB
     * @param {string} companyId - Company ID
     * @returns {Promise<Array>} Array of UPI IDs
     */
    async fetchCompanyUpiIdsFromDB(companyId) {
        // TODO: Replace with your actual database call
        // Example: 
        // const company = await Company.findById(companyId).select('whatsappRouting.phoneNumbers');
        // return company?.whatsappRouting?.phoneNumbers?.map(p => p.number) || [];
        
        // Placeholder - Return mock data based on company ID for testing
        // In production, this should query your database
        const mockUpiIds = {
            'company1': ['posterpro.store@okaxis', 'posterpro@paytm', 'posterpro@ybl'],
            'company2': ['business@okhdfcbank', 'business@paytm', 'business@ybl'],
            'default': ['merchant@okhdfcbank', 'merchant@paytm', 'merchant@ybl']
        };

        return mockUpiIds[companyId] || mockUpiIds['default'];
    }

    /**
     * Detect what type of payment this is
     * @param {Object} paymentData - Payment data
     * @returns {string} Payment type
     */
    async detectPaymentType(paymentData) {
        // Check if it's an image
        if (paymentData.image) {
            // Check if it's a QR code
            if (await this.isQRCode(paymentData.image)) {
                return 'qr_code';
            }
            // Otherwise it's a screenshot
            return 'screenshot';
        }

        // Check if it's UPI text
        if (paymentData.message) {
            const message = paymentData.message.toLowerCase().trim();
            
            // Check for UPI ID pattern
            if (this.upiPatterns.vpa.test(message)) {
                return 'upi_text';
            }
            
            // Check for phone number
            const phoneClean = message.replace(/\s/g, '');
            if (this.upiPatterns.phone.test(phoneClean)) {
                return 'phone_number';
            }
            
            // Check for amount pattern
            if (message.includes('rs') || message.includes('₹') || message.includes('rupees')) {
                return 'upi_text';
            }
        }

        return 'unknown';
    }

    /**
     * Check if image is a QR code
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<boolean>} True if QR code
     */
    async isQRCode(imageBuffer) {
        try {
            // Use sharp to analyze image
            const metadata = await sharp(imageBuffer).metadata();
            
            // QR codes are usually square and high contrast
            const isSquare = Math.abs(metadata.width - metadata.height) < 50;
            const hasHighContrast = await this.checkHighContrast(imageBuffer);
            
            // Quick QR code detection using Python
            const isQR = await this.detectQRWithPython(imageBuffer);
            
            return isQR || (isSquare && hasHighContrast);

        } catch (error) {
            console.error('❌ [QRProcessor] QR detection failed:', error);
            return false;
        }
    }

    /**
     * Detect QR code using Python
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<boolean>} True if QR code detected
     */
    async detectQRWithPython(imageBuffer) {
        return new Promise((resolve) => {
            const scriptPath = path.join(__dirname, 'qr_detector.py');
            
            // Create Python script if not exists
            this.ensureQRDetectorScript(scriptPath);
            
            // Save image to temp file
            const tempFile = path.join(this.tempDir, `qr_${Date.now()}.jpg`);
            
            fs.writeFile(tempFile, imageBuffer)
                .then(() => {
                    const pythonProcess = spawn('python', [scriptPath, tempFile]);

                    let outputData = '';

                    pythonProcess.stdout.on('data', (data) => {
                        outputData += data.toString();
                    });

                    pythonProcess.on('close', (code) => {
                        // Cleanup
                        fs.unlink(tempFile).catch(() => {});
                        
                        if (code === 0 && outputData.trim().toLowerCase() === 'true') {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });

                    pythonProcess.on('error', () => {
                        fs.unlink(tempFile).catch(() => {});
                        resolve(false);
                    });

                    // Timeout after 5 seconds
                    setTimeout(() => {
                        pythonProcess.kill();
                        fs.unlink(tempFile).catch(() => {});
                        resolve(false);
                    }, 5000);
                })
                .catch(() => resolve(false));
        });
    }

    /**
     * Check if image has high contrast (QR code characteristic)
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<boolean>} True if high contrast
     */
    async checkHighContrast(imageBuffer) {
        try {
            const stats = await sharp(imageBuffer)
                .grayscale()
                .stats();
            
            const contrast = stats.channels[0].max - stats.channels[0].min;
            return contrast > 150; // High contrast threshold

        } catch (error) {
            return false;
        }
    }

    /**
     * Process QR code image
     * @param {Buffer} imageBuffer - QR code image
     * @param {Array} companyUpiIds - Company UPI IDs
     * @param {string} companyId - Company ID
     * @returns {Object} Extraction result
     */
    async processQRCode(imageBuffer, companyUpiIds, companyId) {
        try {
            // Decode QR code using Python
            const qrData = await this.decodeQR(imageBuffer);
            
            if (!qrData) {
                return {
                    success: false,
                    error: 'Could not decode QR code',
                    confidence: 0,
                    requiresManual: true,
                    companyId
                };
            }

            // Parse UPI QR data
            const upiData = this.parseUPIQR(qrData);
            
            // Validate against company UPI IDs
            const upiValidation = this.validateUPI(upiData.upiId, companyUpiIds);
            
            const result = {
                success: true,
                type: 'qr_code',
                extractedFields: {
                    amount: upiData.amount ? parseFloat(upiData.amount) : null,
                    upiId: upiData.upiId,
                    transactionId: upiData.transactionId || null,
                    payeeName: upiData.payeeName,
                    note: upiData.note
                },
                validation: {
                    upiMatch: upiValidation.isValid,
                    matchedUpiId: upiValidation.matchedId,
                    matchType: upiValidation.matchType,
                    amountPresent: !!upiData.amount
                },
                confidence: upiValidation.isValid ? 95 : 70,
                rawData: qrData,
                companyId
            };

            return result;

        } catch (error) {
            console.error('❌ [QRProcessor] QR processing failed:', error);
            return {
                success: false,
                error: error.message,
                confidence: 0,
                requiresManual: true,
                companyId
            };
        }
    }

    /**
     * Decode QR code using Python
     * @param {Buffer} imageBuffer - QR code image
     * @returns {Promise<Object|null>} Decoded QR data
     */
    async decodeQR(imageBuffer) {
        return new Promise((resolve) => {
            const scriptPath = path.join(__dirname, 'qr_decoder.py');
            
            // Create Python script if not exists
            this.ensureQRDecoderScript(scriptPath);
            
            const tempFile = path.join(this.tempDir, `qr_decode_${Date.now()}.jpg`);
            
            fs.writeFile(tempFile, imageBuffer)
                .then(() => {
                    const pythonProcess = spawn('python', [scriptPath, tempFile]);

                    let outputData = '';

                    pythonProcess.stdout.on('data', (data) => {
                        outputData += data.toString();
                    });

                    pythonProcess.on('close', (code) => {
                        // Cleanup
                        fs.unlink(tempFile).catch(() => {});
                        
                        if (code === 0 && outputData && outputData.trim() !== 'null') {
                            try {
                                const result = JSON.parse(outputData);
                                resolve(result);
                            } catch {
                                // If not JSON, return as string
                                resolve({ type: 'text', data: outputData.trim() });
                            }
                        } else {
                            resolve(null);
                        }
                    });

                    pythonProcess.on('error', () => {
                        fs.unlink(tempFile).catch(() => {});
                        resolve(null);
                    });

                    // Timeout after 5 seconds
                    setTimeout(() => {
                        pythonProcess.kill();
                        fs.unlink(tempFile).catch(() => {});
                        resolve(null);
                    }, 5000);
                })
                .catch(() => resolve(null));
        });
    }

    /**
     * Parse UPI QR code data
     * @param {Object|string} qrData - QR code data
     * @returns {Object} Parsed UPI data
     */
    parseUPIQR(qrData) {
        const result = {
            upiId: null,
            amount: null,
            payeeName: null,
            note: null,
            transactionId: null
        };

        // Handle different QR formats
        if (typeof qrData === 'string') {
            // Check if it's a UPI URL
            if (qrData.startsWith('upi://')) {
                try {
                    const url = new URL(qrData);
                    const params = new URLSearchParams(url.search);
                    
                    result.upiId = params.get('pa'); // payee address
                    result.amount = params.get('am') ? parseFloat(params.get('am')) : null;
                    result.payeeName = params.get('pn'); // payee name
                    result.note = params.get('tn'); // transaction note
                } catch (e) {
                    // Ignore URL parsing errors
                }
            }
            // Check if it's a simple string
            else if (qrData.includes('@')) {
                result.upiId = qrData;
            }
        }
        // Handle object response
        else if (typeof qrData === 'object') {
            result.upiId = qrData.pa || qrData.upiId || qrData.vpa;
            result.amount = qrData.am || qrData.amount;
            result.payeeName = qrData.pn || qrData.name;
            result.note = qrData.tn || qrData.note;
            result.transactionId = qrData.txn || qrData.transactionId;
        }

        return result;
    }

    /**
     * Process payment screenshot (uses OCR engine)
     * @param {Buffer} imageBuffer - Screenshot image
     * @param {Object} order - Order details
     * @param {Array} companyUpiIds - Company UPI IDs
     * @param {string} companyId - Company ID
     * @returns {Object} Extraction result
     */
    async processScreenshot(imageBuffer, order, companyUpiIds, companyId) {
        // Use the OCR engine we already created
        const ocrResult = await ocrEngine.processPaymentScreenshot(imageBuffer, order);
        
        // Add company UPI validation
        if (ocrResult.extractedFields?.upiId) {
            const upiValidation = this.validateUPI(ocrResult.extractedFields.upiId, companyUpiIds);
            ocrResult.validation = ocrResult.validation || {};
            ocrResult.validation.upiMatch = upiValidation.isValid;
            ocrResult.validation.matchedUpiId = upiValidation.matchedId;
            ocrResult.validation.matchType = upiValidation.matchType;
            
            // Adjust confidence based on UPI match
            if (upiValidation.isValid) {
                ocrResult.confidence = Math.min(100, (ocrResult.confidence || 0) + 10);
            } else {
                ocrResult.confidence = Math.max(0, (ocrResult.confidence || 0) - 20);
            }
        }

        return {
            ...ocrResult,
            type: 'screenshot',
            companyId
        };
    }

    /**
     * Process UPI ID text message
     * @param {string} message - Text message
     * @param {Array} companyUpiIds - Company UPI IDs
     * @param {string} companyId - Company ID
     * @returns {Object} Extraction result
     */
    async processUPIText(message, companyUpiIds, companyId) {
        const extracted = this.extractFromText(message);
        const upiValidation = this.validateUPI(extracted.upiId, companyUpiIds);
        
        return {
            success: true,
            type: 'upi_text',
            extractedFields: extracted,
            validation: {
                upiMatch: upiValidation.isValid,
                matchedUpiId: upiValidation.matchedId,
                matchType: upiValidation.matchType,
                amountValid: !!extracted.amount
            },
            confidence: upiValidation.isValid ? 90 : 50,
            decision: {
                action: upiValidation.isValid ? 'auto_verify' : 'manual_review',
                reason: upiValidation.isValid ? 'Valid UPI ID provided' : 'UPI ID not recognized'
            },
            companyId
        };
    }

    /**
     * Process phone number message
     * @param {string} message - Phone number message
     * @param {Array} companyUpiIds - Company UPI IDs
     * @param {string} companyId - Company ID
     * @returns {Object} Extraction result
     */
    async processPhoneNumber(message, companyUpiIds, companyId) {
        const phoneNumber = message.replace(/\D/g, '');
        
        // Check if phone number matches any company UPI (some UPI IDs are phone numbers)
        const possibleUpiFormats = [
            `${phoneNumber}@ybl`,
            `${phoneNumber}@okhdfcbank`,
            `${phoneNumber}@okaxis`,
            `${phoneNumber}@paytm`
        ];
        
        let upiValidation = { isValid: false, matchedId: null, matchType: null };
        
        for (const upiFormat of possibleUpiFormats) {
            const validation = this.validateUPI(upiFormat, companyUpiIds);
            if (validation.isValid) {
                upiValidation = validation;
                break;
            }
        }
        
        return {
            success: true,
            type: 'phone_number',
            extractedFields: {
                phoneNumber,
                upiId: possibleUpiFormats[0] // Default to @ybl format
            },
            validation: {
                upiMatch: upiValidation.isValid,
                matchedUpiId: upiValidation.matchedId,
                matchType: upiValidation.matchType
            },
            confidence: upiValidation.isValid ? 85 : 40,
            decision: {
                action: upiValidation.isValid ? 'auto_verify' : 'manual_review',
                reason: upiValidation.isValid ? 'Phone number matches company UPI' : 'Phone number not recognized'
            },
            companyId
        };
    }

    /**
     * Process unknown payment type
     * @param {Object} paymentData - Payment data
     * @param {Array} companyUpiIds - Company UPI IDs
     * @param {string} companyId - Company ID
     * @returns {Object} Extraction result
     */
    async processUnknown(paymentData, companyUpiIds, companyId) {
        return {
            success: false,
            type: 'unknown',
            extractedFields: {},
            validation: {},
            confidence: 0,
            decision: {
                action: 'manual_review',
                reason: 'Could not determine payment type',
                autoVerifiable: false,
                requiresHuman: true
            },
            companyId
        };
    }

    /**
     * Extract payment information from text message
     * @param {string} message - Text message
     * @returns {Object} Extracted fields
     */
    extractFromText(message) {
        const result = {
            upiId: null,
            amount: null,
            transactionId: null,
            rawText: message
        };

        const text = message.toLowerCase();

        // Extract UPI ID
        const upiMatch = text.match(this.upiPatterns.vpa);
        if (upiMatch) {
            result.upiId = upiMatch[0];
        }

        // Extract amount (multiple formats)
        const amountRegexes = [
            /(?:rs\.?|₹|inr)\s*(\d+(?:[.,]\d+)?)/i,
            /(\d+(?:[.,]\d+)?)\s*(?:rs\.?|₹|inr)/i,
            /total[:\s]*(\d+(?:[.,]\d+)?)/i,
            /amount[:\s]*(\d+(?:[.,]\d+)?)/i
        ];

        for (const regex of amountRegexes) {
            const match = text.match(regex);
            if (match) {
                result.amount = parseFloat(match[1].replace(/,/g, ''));
                break;
            }
        }

        // Extract transaction ID
        const txnRegexes = [
            /(?:txn|trn|ref|utr|id|reference)[:\s]*([a-zA-Z0-9]{6,30})/i,
            /(?:transaction|payment)\s*(?:id|number|ref)[:\s]*([a-zA-Z0-9]{6,30})/i,
            /\b([A-Z0-9]{12,20})\b/
        ];

        for (const regex of txnRegexes) {
            const match = text.match(regex);
            if (match && match[1] && !match[1].match(/^(rs|inr|amount|total)$/i)) {
                result.transactionId = match[1];
                break;
            }
        }

        return result;
    }

    /**
     * Validate UPI ID against company's UPI IDs
     * @param {string} upiId - UPI ID to validate
     * @param {Array} companyUpiIds - Company UPI IDs
     * @returns {Object} Validation result
     */
    validateUPI(upiId, companyUpiIds) {
        if (!upiId || !companyUpiIds || companyUpiIds.length === 0) {
            return { isValid: false, matchedId: null, matchType: null };
        }

        const cleanUpi = upiId.toLowerCase().trim();

        for (const validUpi of companyUpiIds) {
            const cleanValid = validUpi.toLowerCase().trim();
            
            // Exact match
            if (cleanUpi === cleanValid) {
                return {
                    isValid: true,
                    matchedId: validUpi,
                    matchType: 'exact'
                };
            }
            
            // Contains match
            if (cleanUpi.includes(cleanValid) || cleanValid.includes(cleanUpi)) {
                return {
                    isValid: true,
                    matchedId: validUpi,
                    matchType: 'partial'
                };
            }
            
            // Domain match (e.g., different handles @okhdfcbank vs @okaxis)
            const upiParts = cleanUpi.split('@');
            const validParts = cleanValid.split('@');
            
            if (upiParts.length === 2 && validParts.length === 2) {
                if (upiParts[0] === validParts[0] || upiParts[1] === validParts[1]) {
                    return {
                        isValid: true,
                        matchedId: validUpi,
                        matchType: 'domain'
                    };
                }
            }
        }

        return { isValid: false, matchedId: null, matchType: null };
    }

    /**
     * Validate against order details
     * @param {Object} extractionResult - Current extraction result
     * @param {Object} order - Order details
     * @param {Array} companyUpiIds - Company UPI IDs
     * @param {string} companyId - Company ID
     * @returns {Object} Enhanced extraction result
     */
    async validateAgainstOrder(extractionResult, order, companyUpiIds, companyId) {
        const result = { ...extractionResult };
        
        if (!result.validation) {
            result.validation = {};
        }

        // Amount validation
        if (result.extractedFields?.amount && order.totalPrice) {
            const diff = Math.abs(result.extractedFields.amount - order.totalPrice);
            result.validation.amountMatch = diff <= 2;
            result.validation.amountDifference = diff;
            result.validation.expectedAmount = order.totalPrice;
            result.validation.foundAmount = result.extractedFields.amount;
            
            // Adjust confidence based on amount match
            if (result.validation.amountMatch) {
                result.confidence = Math.min(100, (result.confidence || 0) + 10);
                result.validation.matchQuality = 'exact';
            } else if (diff <= 10) {
                result.confidence = Math.min(100, (result.confidence || 0) + 5);
                result.validation.matchQuality = 'close';
                result.validation.amountWarning = `Amount differs by ₹${diff.toFixed(2)}`;
            } else {
                result.confidence = Math.max(0, (result.confidence || 0) - 15);
                result.validation.matchQuality = 'far';
            }
        }

        // UPI validation (already done, but ensure it's present)
        if (result.extractedFields?.upiId) {
            const upiValidation = this.validateUPI(result.extractedFields.upiId, companyUpiIds);
            result.validation.upiMatch = upiValidation.isValid;
            result.validation.matchedUpiId = upiValidation.matchedId;
            result.validation.matchType = upiValidation.matchType;
        }

        // Ensure confidence is within bounds
        result.confidence = Math.max(0, Math.min(100, result.confidence || 0));

        return result;
    }

    /**
     * Make final decision
     * @param {Object} result - Extraction result
     * @returns {Object} Decision object
     */
    makeDecision(result) {
        const decision = {
            action: 'manual_review',
            reason: '',
            autoVerifiable: false,
            requiresHuman: true,
            priority: 'normal'
        };

        const confidence = result.confidence || 0;

        if (confidence >= 90) {
            decision.action = 'auto_verify';
            decision.reason = `High confidence (${confidence}%) - Payment verified automatically`;
            decision.autoVerifiable = true;
            decision.requiresHuman = false;
            decision.priority = 'low';
        }
        else if (confidence >= 70) {
            decision.action = 'backup_verified';
            decision.reason = `Medium confidence (${confidence}%) - Verified with backup checks`;
            decision.autoVerifiable = true;
            decision.requiresHuman = false;
            decision.priority = 'normal';
        }
        else if (confidence >= 40) {
            decision.action = 'manual_review';
            decision.reason = `Low confidence (${confidence}%) - Requires manual verification`;
            decision.autoVerifiable = false;
            decision.requiresHuman = true;
            decision.priority = 'high';
        }
        else {
            decision.action = 'fraud_alert';
            decision.reason = `Very low confidence (${confidence}%) - Potential fraud detected`;
            decision.autoVerifiable = false;
            decision.requiresHuman = true;
            decision.priority = 'critical';
        }

        return decision;
    }

    /**
     * Create QR detector Python script
     * @param {string} scriptPath - Path to script
     */
    ensureQRDetectorScript(scriptPath) {
        const script = `
import sys
import cv2
import numpy as np

def detect_qr(image_path):
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return False
        
        # Initialize QR detector
        detector = cv2.QRCodeDetector()
        
        # Detect QR code
        retval, points, straight_qrcode = detector.detectAndDecode(img)
        
        # Return True if QR code found
        return bool(retval)
        
    except Exception as e:
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("false")
        sys.exit(1)
    
    result = detect_qr(sys.argv[1])
    print(str(result).lower())
`;
        
        try {
            fs.accessSync(scriptPath);
        } catch {
            fs.writeFileSync(scriptPath, script);
            console.log(`📝 Created QR detector script: ${scriptPath}`);
        }
    }

    /**
     * Create QR decoder Python script
     * @param {string} scriptPath - Path to script
     */
    ensureQRDecoderScript(scriptPath) {
        const script = `
import sys
import cv2
import json
import numpy as np

def decode_qr(image_path):
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Initialize QR detector
        detector = cv2.QRCodeDetector()
        
        # Detect and decode QR code
        data, points, straight_qrcode = detector.detectAndDecode(img)
        
        if data:
            # Try to parse as UPI QR
            if data.startswith('upi://'):
                return json.dumps({"type": "upi", "data": data})
            else:
                return json.dumps({"type": "text", "data": data})
        else:
            return None
            
    except Exception as e:
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("null")
        sys.exit(1)
    
    result = decode_qr(sys.argv[1])
    if result:
        print(result)
    else:
        print("null")
`;
        
        try {
            fs.accessSync(scriptPath);
        } catch {
            fs.writeFileSync(scriptPath, script);
            console.log(`📝 Created QR decoder script: ${scriptPath}`);
        }
    }

    /**
     * Create error result
     * @param {string} error - Error message
     * @param {string} requestId - Request ID
     * @param {string} companyId - Company ID
     * @returns {Object} Error result
     */
    createErrorResult(error, requestId, companyId = null) {
        return {
            success: false,
            error,
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTime: 0,
                companyId
            },
            decision: {
                action: 'manual_review',
                reason: `Processing failed: ${error}`,
                autoVerifiable: false,
                requiresHuman: true,
                priority: 'high'
            }
        };
    }

    /**
     * Log payment for audit
     * @param {string} requestId - Request ID
     * @param {Object} result - Processing result
     * @param {string} companyId - Company ID
     */
    logPayment(requestId, result, companyId) {
        // TODO: Implement your logging mechanism
        // Could write to file, database, or monitoring system
        console.log(`📝 [AUDIT:${requestId}]`, JSON.stringify({
            timestamp: new Date().toISOString(),
            type: result.type,
            confidence: result.confidence,
            decision: result.decision.action,
            extracted: result.extractedFields,
            companyId: companyId || result.companyId
        }));
    }

    /**
     * Clear company UPI cache (call when UPI IDs are updated)
     * @param {string} companyId - Company ID (optional)
     */
    clearCompanyCache(companyId) {
        if (companyId) {
            this.companyUpiCache.delete(companyId);
            console.log(`🗑️ [QRProcessor] Cleared cache for company: ${companyId}`);
        } else {
            this.companyUpiCache.clear();
            console.log(`🗑️ [QRProcessor] Cleared all company caches`);
        }
    }

    /**
     * Get processor statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            cacheSize: this.companyUpiCache.size,
            tempDir: this.tempDir,
            supportedFormats: this.config.supportedFormats,
            uptime: process.uptime(),
            companies: Array.from(this.companyUpiCache.keys())
        };
    }

    /**
     * Warm up cache for multiple companies
     * @param {Array} companyIds - Array of company IDs
     */
    async warmUpCache(companyIds) {
        console.log(`🔥 [QRProcessor] Warming up cache for ${companyIds.length} companies`);
        
        for (const companyId of companyIds) {
            try {
                await this.getCompanyUpiIds(companyId);
            } catch (error) {
                console.error(`❌ [QRProcessor] Failed to warm up cache for ${companyId}:`, error);
            }
        }
        
        console.log(`✅ [QRProcessor] Cache warmed up with ${this.companyUpiCache.size} companies`);
    }
}

// Create and export singleton instance
const qrProcessor = new QRProcessor();
export default qrProcessor;
