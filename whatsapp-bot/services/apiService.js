

// // // services/apiService.js - COMPLETE UPDATED VERSION FOR ENHANCED SCHEMAS

// // import axios from 'axios';

// // class ApiService {
// //     constructor() {
// //         this.baseURL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
// //         this.client = axios.create({
// //             baseURL: this.baseURL,
// //             timeout: 30000,
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             }
// //         });

// //         // Add request interceptor for logging
// //         this.client.interceptors.request.use(
// //             (config) => {
// //                 console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
// //                 if (config.data && config.method === 'POST') {
// //                     console.log('📦 Request Data:', {
// //                         orderNumber: config.data.orderNumber,
// //                         customerPhone: config.data.customerPhone,
// //                         dataSize: JSON.stringify(config.data).length
// //                     });
// //                 }
// //                 return config;
// //             },
// //             (error) => {
// //                 console.error('❌ API Request Error:', error);
// //                 return Promise.reject(error);
// //             }
// //         );

// //         // Add response interceptor for logging
// //         this.client.interceptors.response.use(
// //             (response) => {
// //                 console.log(`✅ API Response: ${response.status} ${response.config.url}`);
// //                 return response;
// //             },
// //             (error) => {
// //                 const errorDetails = {
// //                     url: error.config?.url,
// //                     method: error.config?.method,
// //                     status: error.response?.status,
// //                     statusText: error.response?.statusText,
// //                     data: error.response?.data
// //                 };
// //                 console.error(`❌ API Response Error:`, errorDetails);
// //                 return Promise.reject(error);
// //             }
// //         );

// //         console.log(`🔗 API Service initialized: ${this.baseURL}`);
// //     }

// //     // ========== UTILITY METHODS ==========

// //     handleApiError(operation, error) {
// //         const errorDetails = {
// //             operation,
// //             message: error.message,
// //             status: error.response?.status,
// //             statusText: error.response?.statusText,
// //             url: error.config?.url,
// //             data: error.response?.data
// //         };

// //         console.error(`❌ API Error - ${operation}:`, errorDetails);
// //     }

// //     extractData(responseData) {
// //         if (!responseData) return null;
        
// //         if (responseData.success && responseData.data !== undefined) {
// //             return responseData.data;
// //         }
        
// //         return responseData;
// //     }

// //     ensureArray(responseData) {
// //         if (!responseData) return [];
        
// //         if (responseData.success && Array.isArray(responseData.data)) {
// //             return responseData.data;
// //         }
        
// //         if (Array.isArray(responseData)) {
// //             return responseData;
// //         }
        
// //         if (responseData.success && responseData.data && typeof responseData.data === 'object') {
// //             return [responseData.data];
// //         }
        
// //         if (responseData && typeof responseData === 'object') {
// //             return [responseData];
// //         }
        
// //         return [];
// //     }

// //  cleanPhoneNumber(phoneNumber) {
// //     if (!phoneNumber) return '';
    
// //     // Case 1: Handle WhatsApp ID format (number@lid)
// //     if (phoneNumber.includes('@')) {
// //         // Extract the part before @
// //         const numberPart = phoneNumber.split('@')[0];
// //         // Remove any non-digits from that part
// //         const numberDigits = numberPart.replace(/\D/g, '');
        
// //         // Check if it's an Indian number with country code (91)
// //         if (numberDigits.length === 12 && numberDigits.startsWith('91')) {
// //             // Remove 91 and return 10-digit number
// //             return numberDigits.substring(2);
// //         }
// //         // If it's exactly 10 digits, return as is
// //         else if (numberDigits.length === 10) {
// //             return numberDigits;
// //         }
// //         // If it's longer than 10 digits (like your example 265347508764757)
// //         else if (numberDigits.length > 10) {
// //             // Check if it starts with 91 (Indian country code)
// //             if (numberDigits.startsWith('91')) {
// //                 return numberDigits.substring(2, 12); // Extract 10 digits after 91
// //             }
// //             // Otherwise take last 10 digits
// //             return numberDigits.slice(-10);
// //         }
// //         // If none of the above, recursively clean the number part
// //         else {
// //             return this.cleanPhoneNumber(numberPart);
// //         }
// //     }
    
// //     // Case 2: Handle raw number strings
// //     const cleaned = phoneNumber.replace(/\D/g, '');
    
// //     // Indian number with country code (12 digits starting with 91)
// //     if (cleaned.length === 12 && cleaned.startsWith('91')) {
// //         return cleaned.substring(2);
// //     }
// //     // Indian number without country code (10 digits)
// //     else if (cleaned.length === 10) {
// //         return cleaned;
// //     }
// //     // US number with country code (11 digits starting with 1)
// //     else if (cleaned.length === 11 && cleaned.startsWith('1')) {
// //         return cleaned.substring(1);
// //     }
// //     // Any number longer than 10 digits - take last 10
// //     else if (cleaned.length > 10) {
// //         // Check if it starts with 91 (Indian format)
// //         if (cleaned.startsWith('91')) {
// //             return cleaned.substring(2, 12);
// //         }
// //         return cleaned.slice(-10);
// //     }
    
// //     // Return whatever we have (might be invalid)
// //     return cleaned;
// // }

// //     // Safe number formatter
// //     safeNumber(value, defaultValue = 0) {
// //         if (value === null || value === undefined) return defaultValue;
// //         if (typeof value === 'number') return value;
// //         const parsed = parseFloat(value);
// //         return isNaN(parsed) ? defaultValue : parsed;
// //     }

// //     safeToFixed(value, digits = 2) {
// //         const num = this.safeNumber(value);
// //         return num.toFixed(digits);
// //     }

// //     // ========== PAYMENT VERIFICATION APIS ==========

// //   async createPaymentVerification(verificationData) {
// //     try {
// //         console.log('🔍 Creating payment verification:', {
// //             orderNumber: verificationData.orderNumber,
// //             customerPhone: verificationData.customerPhone,
// //             hasOcrData: !!verificationData.ocrAnalysis,
// //             hasValidation: !!verificationData.validationResults,
// //             engineUsed: verificationData.metadata?.ocrEngine
// //         });

// //         if (!verificationData.orderNumber || !verificationData.customerPhone) {
// //             throw new Error('Order number and customer phone are required');
// //         }

// //         // Format payment verification data with ALL professional OCR fields
// //         const formattedData = {
// //             // Core identifiers
// //             orderNumber: verificationData.orderNumber,
// //             customerPhone: verificationData.customerPhone,
// //             customerName: verificationData.customerName || '',
// //             orderReference: verificationData.orderReference || verificationData.orderNumber,
            
// //             // Company context for multi-tenancy
// //             companyId: verificationData.companyId,
            
// //             // Complete order details
// //             orderDetails: {
// //                 totalAmount: this.safeNumber(verificationData.orderDetails?.totalAmount || verificationData.amount),
// //                 subtotal: this.safeNumber(verificationData.orderDetails?.subtotal),
// //                 totalGst: this.safeNumber(verificationData.orderDetails?.totalGst),
// //                 customerName: verificationData.orderDetails?.customerName || verificationData.customerName,
// //                 customerEmail: verificationData.orderDetails?.customerEmail,
// //                 shippingAddress: verificationData.orderDetails?.shippingAddress,
// //                 pincode: verificationData.orderDetails?.pincode,
// //                 items: (verificationData.orderDetails?.items || []).map(item => ({
// //                     productId: item.productId,
// //                     productName: item.productName,
// //                     quantity: this.safeNumber(item.quantity),
// //                     price: this.safeNumber(item.price),
// //                     mrp: this.safeNumber(item.mrp),
// //                     gstRate: this.safeNumber(item.gstRate, 18),
// //                     gstIncluded: item.gstIncluded !== false,
// //                     gstAmount: this.safeNumber(item.gstAmount),
// //                     totalAmount: this.safeNumber(item.totalAmount)
// //                 }))
// //             },

// //             // Payment proof (screenshot/QR)
// //             paymentProof: {
// //                 imageData: verificationData.paymentProof?.imageData ? 
// //                     verificationData.paymentProof.imageData.substring(0, 10000) : null, // Truncate for storage
// //                 mimeType: verificationData.paymentProof?.mimeType || 'image/jpeg',
// //                 fileName: verificationData.paymentProof?.fileName || 'payment_screenshot.jpg',
// //                 fileSize: verificationData.paymentProof?.fileSize,
// //                 uploadedAt: verificationData.paymentProof?.uploadedAt || new Date().toISOString(),
// //                 imageHash: verificationData.paymentProof?.imageHash
// //             },

// //             // Detected payment information (from QR/OCR)
// //             detectedPayment: {
// //                 amount: this.safeNumber(verificationData.detectedPayment?.amount || verificationData.amount),
// //                 upiId: verificationData.detectedPayment?.upiId || verificationData.upiId,
// //                 upiTransactionId: verificationData.detectedPayment?.upiTransactionId || verificationData.upiTransactionId,
// //                 transactionId: verificationData.detectedPayment?.transactionId || verificationData.transactionId,
// //                 bankReference: verificationData.detectedPayment?.bankReference,
// //                 paymentMethod: verificationData.detectedPayment?.paymentMethod || verificationData.paymentMethod || 'upi',
// //                 timestamp: verificationData.detectedPayment?.timestamp || new Date().toISOString(),
// //                 status: verificationData.detectedPayment?.status || 'success',
// //                 confidence: this.safeNumber(verificationData.detectedPayment?.confidence, 1),
// //                 appName: verificationData.detectedPayment?.appName,
// //                 bankName: verificationData.detectedPayment?.bankName,
// //                 senderName: verificationData.detectedPayment?.senderName,
// //                 senderUpi: verificationData.detectedPayment?.senderUpi,
// //                 payeeVPA: verificationData.detectedPayment?.payeeVPA,
// //                 reference: verificationData.detectedPayment?.reference,
// //                 remarks: verificationData.detectedPayment?.remarks
// //             },

// //             // ========== CRITICAL: OCR ANALYSIS RESULTS ==========
// //             ocrAnalysis: {
// //                 // Raw extracted text from screenshot (MOST IMPORTANT FOR AUDIT)
// //                 extractedText: verificationData.ocrAnalysis?.extractedText || '',
                
// //                 // Overall confidence scores
// //                 confidenceScore: this.safeNumber(verificationData.ocrAnalysis?.confidenceScore, 0),
                
// //                 // Extracted fields with their individual confidences
// //                 extractedAmount: this.safeNumber(verificationData.ocrAnalysis?.extractedAmount),
// //                 extractedAmountConfidence: this.safeNumber(verificationData.ocrAnalysis?.extractedAmountConfidence, 0),
                
// //                 extractedUPI: verificationData.ocrAnalysis?.extractedUPI || '',
// //                 extractedUPIConfidence: this.safeNumber(verificationData.ocrAnalysis?.extractedUPIConfidence, 0),
                
// //                 transactionId: verificationData.ocrAnalysis?.transactionId || '',
// //                 transactionIdConfidence: this.safeNumber(verificationData.ocrAnalysis?.transactionIdConfidence, 0),
                
// //                 // Payment status detection
// //                 status: verificationData.ocrAnalysis?.status || 'unknown',
// //                 statusConfidence: this.safeNumber(verificationData.ocrAnalysis?.statusConfidence, 0),
                
// //                 // Timestamp extraction
// //                 timestamp: verificationData.ocrAnalysis?.timestamp || '',
// //                 timestampConfidence: this.safeNumber(verificationData.ocrAnalysis?.timestampConfidence, 0),
                
// //                 // App/Bank detection
// //                 appName: verificationData.ocrAnalysis?.appName || '',
// //                 appNameConfidence: this.safeNumber(verificationData.ocrAnalysis?.appNameConfidence, 0),
                
// //                 bankName: verificationData.ocrAnalysis?.bankName || '',
// //                 bankNameConfidence: this.safeNumber(verificationData.ocrAnalysis?.bankNameConfidence, 0),
                
// //                 // OCR metadata
// //                 wordCount: this.safeNumber(verificationData.ocrAnalysis?.wordCount, 0),
// //                 processingTime: this.safeNumber(verificationData.ocrAnalysis?.processingTime, 0),
// //                 ocrEngine: verificationData.ocrAnalysis?.ocrEngine || 'paddle',
// //                 backupUsed: verificationData.ocrAnalysis?.backupUsed || false,
                
// //                 // Full raw text for debugging (truncated for performance)
// //                 rawText: verificationData.ocrAnalysis?.rawText ? 
// //                     verificationData.ocrAnalysis.rawText.substring(0, 5000) : '',
                
// //                 // Word-level data for UI highlighting
// //                 words: verificationData.ocrAnalysis?.words || []
// //             },

// //             // ========== VALIDATION RESULTS ==========
// //             validationResults: {
// //                 // Amount validation
// //                 amountMatch: verificationData.validationResults?.amountMatch || false,
// //                 expectedAmount: this.safeNumber(verificationData.validationResults?.expectedAmount),
// //                 foundAmount: this.safeNumber(verificationData.validationResults?.foundAmount),
// //                 amountDifference: this.safeNumber(verificationData.validationResults?.amountDifference, 0),
// //                 matchQuality: verificationData.validationResults?.matchQuality || 'none', // exact/close/near/far
                
// //                 // UPI validation
// //                 upiMatch: verificationData.validationResults?.upiMatch || false,
// //                 matchedUpiId: verificationData.validationResults?.matchedUpiId,
// //                 upiMatchType: verificationData.validationResults?.upiMatchType, // exact/contains/partial
                
// //                 // Time validation
// //                 timeValid: verificationData.validationResults?.timeValid || false,
// //                 detectedTime: verificationData.validationResults?.detectedTime,
// //                 timeDifferenceMinutes: this.safeNumber(verificationData.validationResults?.timeDifferenceMinutes, 0),
                
// //                 // Success indicators
// //                 successIndicators: verificationData.validationResults?.successIndicators || false,
                
// //                 // Overall confidence
// //                 confidenceScore: this.safeNumber(verificationData.validationResults?.confidenceScore, 0),
                
// //                 // Errors and warnings
// //                 validationErrors: verificationData.validationResults?.validationErrors || [],
// //                 validationWarnings: verificationData.validationResults?.validationWarnings || [],
                
// //                 // Validation timestamp
// //                 validatedAt: verificationData.validationResults?.validatedAt || new Date().toISOString()
// //             },

// //             // ========== FRAUD ANALYSIS ==========
// //             fraudAnalysis: {
// //                 isSuspicious: verificationData.fraudAnalysis?.isSuspicious || false,
// //                 fraudScore: this.safeNumber(verificationData.fraudAnalysis?.fraudScore, 0),
// //                 riskLevel: verificationData.fraudAnalysis?.riskLevel || 'low', // low/medium/high/critical
// //                 reasons: verificationData.fraudAnalysis?.reasons || [],
// //                 flags: verificationData.fraudAnalysis?.flags || [],
// //                 analysisPerformedAt: verificationData.fraudAnalysis?.analysisPerformedAt || new Date().toISOString()
// //             },

// //             // ========== METADATA ==========
// //             metadata: {
// //                 // Source information
// //                 source: verificationData.metadata?.source || 'whatsapp',
// //                 ipAddress: verificationData.metadata?.ipAddress,
// //                 userAgent: verificationData.metadata?.userAgent,
                
// //                 // OCR engine information
// //                 ocrEngine: verificationData.metadata?.ocrEngine || 'paddle',
// //                 backupEngine: verificationData.metadata?.backupEngine,
// //                 backupUsed: verificationData.metadata?.backupUsed || false,
                
// //                 // Payment type detection
// //                 paymentType: verificationData.metadata?.paymentType || 'screenshot', // qr_code/screenshot/upi_text/phone_number
                
// //                 // Performance metrics
// //                 processingTime: this.safeNumber(verificationData.metadata?.processingTime, 0),
                
// //                 // Request tracking
// //                 requestId: verificationData.metadata?.requestId,
                
// //                 // Any additional metadata
// //                 ...verificationData.metadata
// //             },

// //             // Status
// //             status: verificationData.status || 'pending',
            
// //             // Timestamps
// //             createdAt: new Date().toISOString(),
// //             updatedAt: new Date().toISOString()
// //         };

// //         console.log('📤 Sending to /api/payments/verify with complete OCR data:', {
// //             orderNumber: formattedData.orderNumber,
// //             customerPhone: formattedData.customerPhone,
// //             ocrConfidence: formattedData.ocrAnalysis.confidenceScore,
// //             extractedAmount: formattedData.ocrAnalysis.extractedAmount,
// //             validationMatch: formattedData.validationResults.matchQuality,
// //             fraudRisk: formattedData.fraudAnalysis.riskLevel,
// //             engineUsed: formattedData.metadata.ocrEngine,
// //             dataSize: JSON.stringify(formattedData).length
// //         });

// //         const response = await this.client.post('/api/payments/verify', formattedData);
        
// //         console.log('✅ Payment verification created successfully:', {
// //             id: response.data?.data?._id,
// //             status: response.data?.data?.status,
// //             confidence: response.data?.data?.ocrAnalysis?.confidenceScore
// //         });
        
// //         return this.extractData(response.data);

// //     } catch (error) {
// //         console.error('❌ Create payment verification error:', {
// //             status: error.response?.status,
// //             data: error.response?.data,
// //             message: error.message,
// //             orderNumber: verificationData?.orderNumber,
// //             customerPhone: verificationData?.customerPhone
// //         });
        
// //         if (error.response?.status === 400) {
// //             throw new Error(`Invalid request: ${error.response.data?.message || 'Bad request'}`);
// //         }
        
// //         if (error.response?.status === 409) {
// //             throw new Error(`Duplicate verification: ${error.response.data?.message || 'Already exists'}`);
// //         }
        
// //         throw new Error('Failed to create payment verification: ' + (error.message || 'Unknown error'));
// //     }
// // }

// //     async verifyPaymentAutomatically(verificationId, verificationResult) {
// //         try {
// //             if (!verificationId) {
// //                 throw new Error('Verification ID is required');
// //             }

// //             console.log('🤖 Auto-verifying payment:', verificationId);
            
// //             const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=verify`, {
// //                 verificationResult,
// //                 confidenceScore: this.safeNumber(verificationResult?.confidence),
// //                 verifiedBy: 'auto-verification',
// //                 verificationMethod: verificationResult?.method || 'ocr',
// //                 matchedFields: verificationResult?.matchedFields || []
// //             });

// //             console.log('✅ Payment auto-verified successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Auto-verify error:', error.response?.data || error.message);
// //             throw new Error('Failed to auto-verify payment: ' + (error.message || 'Unknown error'));
// //         }
// //     }

// //     async getPaymentVerificationById(verificationId) {
// //         try {
// //             if (!verificationId) {
// //                 throw new Error('Verification ID is required');
// //             }

// //             const response = await this.client.get(`/api/payments/verify?id=${verificationId}`);
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Get payment verification error:', error.message);
// //             return null;
// //         }
// //     }

// //     async getPaymentVerificationByOrderNumber(orderNumber) {
// //         try {
// //             if (!orderNumber) {
// //                 throw new Error('Order number is required');
// //             }

// //             const response = await this.client.get(`/api/payments/verify?orderNumber=${orderNumber}`);
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Get verification by order error:', error.message);
// //             return null;
// //         }
// //     }

// //     async updatePaymentVerificationStatus(verificationId, updateData) {
// //         try {
// //             if (!verificationId || !updateData) {
// //                 throw new Error('Verification ID and update data are required');
// //             }

// //             const response = await this.client.patch(`/api/payments/verify?id=${verificationId}`, updateData);
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Update verification status error:', error.message);
// //             throw new Error('Failed to update payment verification status');
// //         }
// //     }

// //     async rejectPaymentVerification(verificationId, reason, rejectedBy = 'admin') {
// //         try {
// //             if (!verificationId || !reason) {
// //                 throw new Error('Verification ID and reason are required');
// //             }

// //             const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=reject`, {
// //                 reason,
// //                 rejectedBy,
// //                 timestamp: new Date().toISOString()
// //             });

// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Reject payment verification error:', error.message);
// //             throw new Error('Failed to reject payment verification');
// //         }
// //     }

// //     async markPaymentAsFraud(verificationId, reasons, markedBy = 'admin') {
// //         try {
// //             if (!verificationId || !reasons) {
// //                 throw new Error('Verification ID and reasons are required');
// //             }

// //             const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=mark-fraud`, {
// //                 reasons: Array.isArray(reasons) ? reasons : [reasons],
// //                 markedBy,
// //                 timestamp: new Date().toISOString()
// //             });

// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Mark payment as fraud error:', error.message);
// //             throw new Error('Failed to mark payment as fraud');
// //         }
// //     }

// //     async getPendingPaymentVerifications() {
// //         try {
// //             const response = await this.client.get('/api/payments/verify?status=pending');
// //             return this.ensureArray(response.data);

// //         } catch (error) {
// //             console.error('❌ Get pending verifications error:', error.message);
// //             return [];
// //         }
// //     }

// //     async getPaymentVerificationsByStatus(status = 'pending') {
// //         try {
// //             const response = await this.client.get(`/api/payments/verify?status=${status}`);
// //             return this.ensureArray(response.data);

// //         } catch (error) {
// //             console.error('❌ Get verifications by status error:', error.message);
// //             return [];
// //         }
// //     }

// //     // ========== ORDER APIS (UPDATED FOR ENHANCED SCHEMA) ==========

// //     async createOrder(orderData) {
// //         try {
// //             if (!orderData.orderNumber || !orderData.phoneNumber || !orderData.items) {
// //                 throw new Error('Missing required order fields');
// //             }

// //             // Format order data with enhanced schema fields
// //            // Format order data with enhanced schema fields
// // const formattedOrderData = {
// //     orderNumber: orderData.orderNumber,
// //     customerName: orderData.customerName || '',
// //     customerEmail: orderData.customerEmail || '',
// //     phoneNumber: this.cleanPhoneNumber(orderData.phoneNumber),
// //     secondaryPhoneNumber: orderData.secondaryPhoneNumber ? this.cleanPhoneNumber(orderData.secondaryPhoneNumber) : null,
// //     // ✅ ADD THIS LINE - WhatsApp number for customer identification
// //     whatsappNumber: orderData.whatsappNumber ? this.cleanPhoneNumber(orderData.whatsappNumber) : null,
// //     shippingAddress: orderData.shippingAddress || {
// //         street: orderData.shippingAddress || orderData.address || '',
// //         city: orderData.city || '',
// //         state: orderData.state || '',
// //         pincode: orderData.pincode || '',
// //         country: 'India'
// //     },
// //     billingAddress: orderData.billingAddress || orderData.shippingAddress,
// //     sameAsShipping: orderData.sameAsShipping !== false,
// //     paymentMethod: orderData.paymentMethod || 'upi',
// //     gstType: orderData.gstType || 'intra-state',
// //     items: (orderData.items || []).map(item => ({
// //         productId: item.productId,
// //         productName: item.productName,
// //         quantity: this.safeNumber(item.quantity, 1),
// //         mrp: this.safeNumber(item.mrp),
// //         discountPrice: this.safeNumber(item.discountPrice),
// //         price: this.safeNumber(item.price),
// //         gstRate: this.safeNumber(item.gstRate, 18),
// //         gstIncluded: item.gstIncluded !== false,
// //         gstAmount: this.safeNumber(item.gstAmount),
// //         totalAmount: this.safeNumber(item.quantity) * this.safeNumber(item.price),
// //         sku: item.sku || '',
// //         hsnCode: item.hsnCode || ''
// //     })),
// //     subtotal: this.safeNumber(orderData.subtotal),
// //     totalDiscount: this.safeNumber(orderData.totalDiscount),
// //     totalGst: this.safeNumber(orderData.totalGst),
// //     shippingCharge: this.safeNumber(orderData.shippingCharge),
// //     totalPrice: this.safeNumber(orderData.totalPrice),
// //     paidAmount: this.safeNumber(orderData.paidAmount, 0),
// //     balanceAmount: this.safeNumber(orderData.totalPrice) - this.safeNumber(orderData.paidAmount, 0),
// //     paymentStatus: orderData.paymentStatus || 'pending',
// //     status: orderData.status || 'pending',
// //     orderNotes: orderData.orderNotes || '',
// //     deliveryDate: orderData.deliveryDate || null,
// //     deliverySlot: orderData.deliverySlot || null,
// //     createdBy: orderData.createdBy || 'whatsapp'
// // };

// //             const response = await this.client.post('/api/orders', formattedOrderData);
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Create Order', error);
// //             throw new Error('Failed to create order: ' + (error.response?.data?.message || error.message));
// //         }
// //     }

// //    async getCustomerOrders(identifier) {
// //     try {
// //         if (!identifier) {
// //             return [];
// //         }

// //         const cleanIdentifier = this.cleanPhoneNumber(identifier);
// //         if (cleanIdentifier.length < 10) {
// //             return [];
// //         }

// //         console.log(`📞 Fetching orders for identifier: ${cleanIdentifier}`);
        
// //         // ✅ Search by BOTH phoneNumber and whatsappNumber
// //         // Using the 'search' parameter which will be handled by the API
// //         const response = await this.client.get(`/api/orders?search=${cleanIdentifier}`);
        
// //         // Log the response for debugging
// //         console.log(`📊 Found ${response.data?.data?.length || 0} orders`);
        
// //         return this.ensureArray(response.data);
// //     } catch (error) {
// //         this.handleApiError('Get Customer Orders', error);
// //         return [];
// //     }
// // }

// //     async getPendingOrdersByPhone(phoneNumber) {
// //         try {
// //             if (!phoneNumber) {
// //                 return [];
// //             }

// //             const cleanPhone = this.cleanPhoneNumber(phoneNumber);
// //             if (cleanPhone.length < 10) {
// //                 return [];
// //             }

// //             console.log(`📞 Fetching pending orders for: ${cleanPhone}`);
            
// //             const allOrders = await this.getCustomerOrders(cleanPhone);
            
// //             const pendingOrders = allOrders.filter(order => 
// //                 order.paymentStatus === 'pending' || 
// //                 order.paymentStatus === 'partial' ||
// //                 (order.status === 'pending' && order.paymentStatus !== 'paid')
// //             );

// //             console.log(`📦 Found ${pendingOrders.length} pending orders for ${cleanPhone}`);
// //             return pendingOrders;
// //         } catch (error) {
// //             this.handleApiError('Get Pending Orders By Phone', error);
// //             return [];
// //         }
// //     }

// //     async getOrderById(orderId) {
// //         try {
// //             if (!orderId) {
// //                 throw new Error('Order ID is required');
// //             }

// //             const response = await this.client.get(`/api/orders?id=${orderId}`);
// //             const order = this.extractData(response.data);
            
// //             if (!order) {
// //                 throw new Error('Order not found in response');
// //             }

// //             return order;
// //         } catch (error) {
// //             this.handleApiError('Get Order', error);
            
// //             if (error.response?.status === 404) {
// //                 return null;
// //             }
// //             throw new Error('Failed to fetch order');
// //         }
// //     }

// //     async getOrderByNumber(orderNumber) {
// //         try {
// //             if (!orderNumber) {
// //                 throw new Error('Order number is required');
// //             }

// //             const response = await this.client.get(`/api/orders?orderNumber=${orderNumber}`);
// //             const order = this.extractData(response.data);
            
// //             return order || null;
// //         } catch (error) {
// //             this.handleApiError('Get Order By Number', error);
// //             return null;
// //         }
// //     }

// //     async updateOrderStatus(orderId, status, comment = '') {
// //         try {
// //             if (!orderId || !status) {
// //                 throw new Error('Order ID and status are required');
// //             }

// //             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
// //                 status,
// //                 statusComment: comment,
// //                 statusHistory: [{
// //                     status,
// //                     timestamp: new Date().toISOString(),
// //                     comment
// //                 }]
// //             });
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Update Order Status', error);
// //             throw new Error('Failed to update order status');
// //         }
// //     }

// //     /**
// //      * CRITICAL METHOD: Update order payment status
// //      * Used when payment verification succeeds
// //      */
// //     async updateOrderPaymentStatus(orderNumber, paymentData) {
// //         try {
// //             if (!orderNumber) {
// //                 throw new Error('Order number is required');
// //             }

// //             console.log(`💰 Updating payment status for order: ${orderNumber}`, paymentData);

// //             // First get the order by order number to get its ID
// //             const order = await this.getOrderByNumber(orderNumber);
            
// //             if (!order) {
// //                 throw new Error(`Order ${orderNumber} not found`);
// //             }

// //             // Prepare update data
// //             const updatePayload = {
// //                 paymentStatus: paymentData.paymentStatus || 'paid',
// //                 paidAmount: this.safeNumber(paymentData.paidAmount) || this.safeNumber(paymentData.amount) || order.totalPrice,
// //                 balanceAmount: 0,
// //                 transactionId: paymentData.transactionId || order.transactionId,
// //                 paymentMethod: paymentData.paymentMethod || order.paymentMethod || 'upi',
// //                 statusHistory: [{
// //                     status: 'confirmed',
// //                     timestamp: new Date().toISOString(),
// //                     comment: `Payment verified automatically. Transaction: ${paymentData.transactionId || 'N/A'}`,
// //                     updatedBy: paymentData.verifiedBy || 'auto_ocr'
// //                 }]
// //             };

// //             // Use the PUT endpoint with payment-verified action
// //             const response = await this.client.put(`/api/orders?id=${order._id}&action=payment-verified`, updatePayload);
            
// //             console.log(`✅ Order ${orderNumber} payment status updated to PAID`);
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             this.handleApiError('Update Order Payment Status', error);
// //             throw new Error('Failed to update order payment status: ' + (error.message || 'Unknown error'));
// //         }
// //     }

// //     // ========== PRODUCT APIS (UPDATED FOR ENHANCED SCHEMA) ==========

// // async getProducts() {
// //     try {
// //         const response = await this.client.get('/api/products?isActive=true');
// //         const products = this.ensureArray(response.data);
        
// //         // Format products with computed fields and ensure category consistency
// //         return products.map(product => {
// //             // ✅ SAFELY extract category information
// //             let categoryName = '';
// //             let categoryId = null;
            
// //             if (product.category) {
// //                 if (typeof product.category === 'string') {
// //                     categoryName = product.category;
// //                     categoryId = product.category;
// //                 } else if (typeof product.category === 'object') {
// //                     categoryName = product.category.name || '';
// //                     categoryId = product.category._id || null;
// //                 }
// //             }
            
// //             // ✅ SAFELY extract subCategory information
// //             let subCategoryName = '';
// //             let subCategoryId = null;
            
// //             if (product.subCategory) {
// //                 if (typeof product.subCategory === 'string') {
// //                     subCategoryName = product.subCategory;
// //                     subCategoryId = product.subCategory;
// //                 } else if (typeof product.subCategory === 'object') {
// //                     subCategoryName = product.subCategory.name || '';
// //                     subCategoryId = product.subCategory._id || null;
// //                 }
// //             }
            
// //             return {
// //                 ...product,
// //                 // ✅ Computed fields
// //                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
// //                 inStock: this.safeNumber(product.stock) > 0,
// //                 discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
// //                     ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
// //                     : 0,
                
// //                 // ✅ Category in multiple formats for maximum compatibility
// //                 category: product.category, // Keep original
// //                 categoryName: categoryName, // String version for search
// //                 categoryId: categoryId,     // ID version for reference
                
// //                 // ✅ SubCategory in multiple formats
// //                 subCategory: product.subCategory, // Keep original
// //                 subCategoryName: subCategoryName, // String version
// //                 subCategoryId: subCategoryId,     // ID version
                
// //                 // ✅ Ensure all string fields are actually strings
// //                 productName: String(product.productName || ''),
// //                 description: String(product.description || ''),
// //                 shortDescription: String(product.shortDescription || ''),
// //                 sku: String(product.sku || ''),
// //                 hsnCode: String(product.hsnCode || ''),
// //                 brand: String(product.brand || '')
// //             };
// //         });
// //     } catch (error) {
// //         this.handleApiError('Get Products', error);
// //         return [];
// //     }
// // }

// //     async getProductById(productId) {
// //         try {
// //             if (!productId || productId.length !== 24) {
// //                 throw new Error('Invalid product ID format');
// //             }

// //             const response = await this.client.get(`/api/products?id=${productId}`);
// //             console.log('🔍 Product by ID response:', response.data);
            
// //             const product = this.extractData(response.data);
            
// //             if (!product) {
// //                 throw new Error('Product not found in response');
// //             }

// //             // Format with computed fields
// //             return {
// //                 ...product,
// //                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
// //                 inStock: this.safeNumber(product.stock) > 0,
// //                 discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
// //                     ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
// //                     : 0
// //             };
// //         } catch (error) {
// //             this.handleApiError('Get Product', error);
            
// //             if (error.response?.status === 404) {
// //                 return null;
// //             }
// //             throw new Error('Failed to fetch product');
// //         }
// //     }

// //     async searchProducts(query) {
// //         try {
// //             if (!query || query.trim().length < 2) {
// //                 return [];
// //             }

// //             const response = await this.client.get(`/api/products?search=${encodeURIComponent(query.trim())}`);
// //             const products = this.ensureArray(response.data);
            
// //             return products.map(product => ({
// //                 ...product,
// //                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
// //                 inStock: this.safeNumber(product.stock) > 0
// //             }));
// //         } catch (error) {
// //             this.handleApiError('Search Products', error);
// //             return [];
// //         }
// //     }

// //     async getAllActiveProducts() {
// //         try {
// //             const response = await this.client.get('/api/products?isActive=true');
// //             const products = this.ensureArray(response.data);
            
// //             return products.filter(p => p.isActive).map(product => ({
// //                 ...product,
// //                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
// //                 inStock: this.safeNumber(product.stock) > 0
// //             }));
// //         } catch (error) {
// //             this.handleApiError('Get All Active Products', error);
// //             return [];
// //         }
// //     }

// //     async getProductsByCategory(category) {
// //         try {
// //             if (!category) {
// //                 return [];
// //             }

// //             const response = await this.client.get(`/api/products?category=${encodeURIComponent(category)}&isActive=true`);
// //             const products = this.ensureArray(response.data);
            
// //             return products.map(product => ({
// //                 ...product,
// //                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
// //                 inStock: this.safeNumber(product.stock) > 0
// //             }));
// //         } catch (error) {
// //             this.handleApiError('Get Products By Category', error);
// //             return [];
// //         }
// //     }

// //     // ========== IMAGE URL HANDLING ==========

// //     getProductImageUrl(imagePath) {
// //         if (!imagePath) {
// //             return null;
// //         }

// //         const baseUrl = process.env.NEXTJS_BASE_URL || 'http://localhost:3000';
        
// //         if (imagePath.startsWith('http')) {
// //             return imagePath;
// //         }
        
// //         if (imagePath.startsWith('/uploads/')) {
// //             return `${baseUrl}${imagePath}`;
// //         }
        
// //         if (imagePath.startsWith('/')) {
// //             return `${baseUrl}${imagePath}`;
// //         }
        
// //         return `${baseUrl}/uploads/${imagePath}`;
// //     }

// //     async validateImageUrl(imageUrl) {
// //         try {
// //             if (!imageUrl) return false;
            
// //             const fullUrl = this.getProductImageUrl(imageUrl);
// //             const response = await axios.head(fullUrl, { timeout: 5000 });
            
// //             return response.status === 200;
// //         } catch (error) {
// //             console.error('❌ Image URL validation failed:', imageUrl, error.message);
// //             return false;
// //         }
// //     }

// //     // ========== PRODUCT MANAGEMENT ==========

// //     async updateProductStock(productId, newStock) {
// //         try {
// //             if (!productId || newStock === undefined) {
// //                 throw new Error('Product ID and stock are required');
// //             }

// //             const response = await this.client.patch(`/api/products?id=${productId}`, { 
// //                 stock: this.safeNumber(newStock) 
// //             });
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Update Product Stock', error);
// //             throw new Error('Failed to update product stock');
// //         }
// //     }

// //     // ========== ORDER MANAGEMENT ==========

// //     async getOrdersByStatus(status = 'all') {
// //         try {
// //             const response = await this.client.get(`/api/orders?status=${status}`);
// //             return this.ensureArray(response.data);
// //         } catch (error) {
// //             this.handleApiError('Get Orders by Status', error);
// //             return [];
// //         }
// //     }

// //     async getPendingOrderByPhone(phoneNumber) {
// //         try {
// //             const pendingOrders = await this.getPendingOrdersByPhone(phoneNumber);
// //             return pendingOrders.length > 0 ? pendingOrders[0] : null;
// //         } catch (error) {
// //             this.handleApiError('Get Pending Order By Phone', error);
// //             return null;
// //         }
// //     }

// //     async cancelOrder(orderId, reason = 'Customer request') {
// //         try {
// //             if (!orderId) {
// //                 throw new Error('Order ID is required');
// //             }

// //             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
// //                 status: 'cancelled',
// //                 cancellationReason: reason,
// //                 statusComment: `Order cancelled: ${reason}`
// //             });
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Cancel Order', error);
// //             throw new Error('Failed to cancel order');
// //         }
// //     }

// //     async shipOrder(orderId, trackingNumber = '') {
// //         try {
// //             if (!orderId) {
// //                 throw new Error('Order ID is required');
// //             }

// //             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
// //                 status: 'shipped',
// //                 trackingNumber: trackingNumber,
// //                 statusComment: `Order shipped with tracking: ${trackingNumber || 'N/A'}`
// //             });
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Ship Order', error);
// //             throw new Error('Failed to update order as shipped');
// //         }
// //     }

// //     async deliverOrder(orderId) {
// //         try {
// //             if (!orderId) {
// //                 throw new Error('Order ID is required');
// //             }

// //             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
// //                 status: 'delivered',
// //                 statusComment: 'Order delivered successfully'
// //             });
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Deliver Order', error);
// //             throw new Error('Failed to update order as delivered');
// //         }
// //     }

// //     // ========== PAYMENT APIS ==========

// //     async rejectPayment(rejectionData) {
// //         try {
// //             if (!rejectionData.orderNumber) {
// //                 throw new Error('Order number is required for payment rejection');
// //             }

// //             const response = await this.client.post('/api/payments/reject', {
// //                 orderNumber: rejectionData.orderNumber,
// //                 reason: rejectionData.reason || 'Payment verification failed',
// //                 rejectedBy: rejectionData.rejectedBy || 'system',
// //                 timestamp: new Date().toISOString()
// //             });
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Reject Payment', error);
// //             throw new Error('Payment rejection failed');
// //         }
// //     }

// //     async getPendingPayments() {
// //         try {
// //             const response = await this.client.get('/api/payments/verify?status=pending');
// //             return this.ensureArray(response.data);
// //         } catch (error) {
// //             this.handleApiError('Get Pending Payments', error);
// //             return [];
// //         }
// //     }

// //     // ========== ANALYTICS AND REPORTING ==========

// //     async getOrderStats(timeframe = 'month') {
// //         try {
// //             const response = await this.client.get(`/api/analytics/orders?timeframe=${timeframe}`);
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Get Order Stats', error);
// //             return {
// //                 totalOrders: 0,
// //                 totalRevenue: 0,
// //                 totalPaid: 0,
// //                 totalPending: 0,
// //                 pendingOrders: 0,
// //                 completedOrders: 0
// //             };
// //         }
// //     }

// //     async getProductStats() {
// //         try {
// //             const response = await this.client.get('/api/analytics/products');
// //             return this.extractData(response.data);
// //         } catch (error) {
// //             this.handleApiError('Get Product Stats', error);
// //             return {
// //                 totalProducts: 0,
// //                 activeProducts: 0,
// //                 lowStockProducts: 0,
// //                 outOfStockProducts: 0,
// //                 totalInventoryValue: 0
// //             };
// //         }
// //     }

// //     async getPaymentVerificationStats(timeframe = 'week') {
// //         try {
// //             const response = await this.client.get(`/api/analytics/payments?timeframe=${timeframe}`);
// //             return this.extractData(response.data) || {
// //                 total: 0,
// //                 verified: 0,
// //                 pending: 0,
// //                 rejected: 0,
// //                 fraud: 0,
// //                 autoVerified: 0,
// //                 manualVerified: 0
// //             };
// //         } catch (error) {
// //             this.handleApiError('Get Payment Verification Stats', error);
// //             return {
// //                 total: 0,
// //                 verified: 0,
// //                 pending: 0,
// //                 rejected: 0,
// //                 fraud: 0,
// //                 autoVerified: 0,
// //                 manualVerified: 0
// //             };
// //         }
// //     }

// //     // Health check
// //     async healthCheck() {
// //         try {
// //             const response = await this.client.get('/api/health');
// //             return {
// //                 status: 'healthy',
// //                 data: response.data
// //             };
// //         } catch (error) {
// //             return {
// //                 status: 'unhealthy',
// //                 error: error.message
// //             };
// //         }
// //     }

// //     async testConnection() {
// //         try {
// //             const response = await this.client.get('/api/health');
// //             console.log('🔗 API Connection Test:', {
// //                 status: response.status,
// //                 data: response.data
// //             });
// //             return true;
// //         } catch (error) {
// //             console.error('🔗 API Connection Failed:', error.message);
// //             return false;
// //         }
// //     }

// //     // ========== FCM TOKEN MANAGEMENT APIS ==========

// //     async saveFCMToken(tokenData) {
// //         try {
// //             console.log('📱 Saving FCM token for admin device:', {
// //                 deviceType: tokenData.deviceInfo?.deviceType,
// //                 tokenPreview: tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token'
// //             });

// //             if (!tokenData.token) {
// //                 throw new Error('FCM token is required');
// //             }

// //             const response = await this.client.post('/api/auth/fcm-token', tokenData);
            
// //             console.log('✅ FCM token saved successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Save FCM token error:', {
// //                 status: error.response?.status,
// //                 data: error.response?.data,
// //                 message: error.message
// //             });
            
// //             if (error.response?.status === 401) {
// //                 throw new Error('Unauthorized: Admin login required');
// //             }
// //             throw new Error('Failed to save FCM token: ' + (error.message || 'Unknown error'));
// //         }
// //     }

// //     async deleteFCMToken(token) {
// //         try {
// //             console.log('🗑️ Deleting FCM token:', token ? token.substring(0, 20) + '...' : 'No token');

// //             if (!token) {
// //                 throw new Error('FCM token is required');
// //             }

// //             const response = await this.client.delete('/api/auth/fcm-token', {
// //                 data: { token }
// //             });
            
// //             console.log('✅ FCM token deleted successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Delete FCM token error:', error.message);
// //             return { success: false, error: error.message };
// //         }
// //     }

// //     async getAdminFCMTokens() {
// //         try {
// //             console.log('📱 Fetching admin FCM tokens');
            
// //             const response = await this.client.get('/api/auth/fcm-token?adminOnly=true');
// //             const result = this.extractData(response.data);
            
// //             console.log(`✅ Found ${result.tokens?.length || 0} FCM tokens`);
// //             return result;

// //         } catch (error) {
// //             console.error('❌ Get FCM tokens error:', error.message);
// //             return { tokens: [], count: 0 };
// //         }
// //     }

// //     async sendTestNotificationToAdmin(notificationData = {}) {
// //         try {
// //             console.log('🧪 Sending test notification to admin devices');
            
// //             const response = await this.client.post('/api/admin/notifications/test', {
// //                 title: notificationData.title || 'Test Notification',
// //                 body: notificationData.body || 'This is a test notification',
// //                 type: notificationData.type || 'test',
// //                 priority: notificationData.priority || 'normal',
// //                 data: notificationData.data || {},
// //                 timestamp: new Date().toISOString()
// //             });
            
// //             console.log('✅ Test notification sent successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Send test notification error:', error.message);
// //             return { success: false, error: error.message };
// //         }
// //     }

// //     async getAdminNotificationStats(timeframe = 'day') {
// //         try {
// //             console.log('📊 Fetching admin notification statistics');
            
// //             const response = await this.client.get(`/api/admin/notifications/stats?timeframe=${timeframe}`);
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Get notification stats error:', error.message);
// //             return {
// //                 totalSent: 0,
// //                 successful: 0,
// //                 failed: 0,
// //                 timeframe
// //             };
// //         }
// //     }

// //     async updateNotificationSettings(settings) {
// //         try {
// //             console.log('⚙️ Updating admin notification settings');
            
// //             const response = await this.client.patch('/api/admin/notifications/settings', settings);
            
// //             console.log('✅ Notification settings updated successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Update notification settings error:', error.message);
// //             throw new Error('Failed to update notification settings: ' + error.message);
// //         }
// //     }

// //     async getNotificationSettings() {
// //         try {
// //             console.log('⚙️ Fetching admin notification settings');
            
// //             const response = await this.client.get('/api/admin/notifications/settings');
// //             const result = this.extractData(response.data);
            
// //             return result || {
// //                 pushNotifications: { enabled: true },
// //                 notificationTypes: {
// //                     newOrders: { enabled: true, priority: 'high' },
// //                     payments: { enabled: true, priority: 'high' },
// //                     lowStock: { enabled: true, priority: 'normal' },
// //                     systemAlerts: { enabled: true, priority: 'high' }
// //                 },
// //                 quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
// //             };

// //         } catch (error) {
// //             console.error('❌ Get notification settings error:', error.message);
// //             return {
// //                 pushNotifications: { enabled: true },
// //                 notificationTypes: {
// //                     newOrders: { enabled: true, priority: 'high' },
// //                     payments: { enabled: true, priority: 'high' },
// //                     lowStock: { enabled: true, priority: 'normal' },
// //                     systemAlerts: { enabled: true, priority: 'high' }
// //                 },
// //                 quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
// //             };
// //         }
// //     }

// //     // ========== NOTIFICATION TRIGGER APIS ==========

// //     async sendNotificationToDashboard(notificationData) {
// //         try {
// //             console.log('📤 Sending notification to dashboard:', {
// //                 type: notificationData.type,
// //                 orderNumber: notificationData.data?.orderNumber
// //             });

// //             const response = await this.client.post('/api/notifications', {
// //                 type: notificationData.type || 'INFO',
// //                 priority: notificationData.priority || 'normal',
// //                 title: notificationData.title || '',
// //                 message: notificationData.message || '',
// //                 data: {
// //                     ...notificationData.data,
// //                     timestamp: new Date().toISOString()
// //                 },
// //                 forAdmin: notificationData.forAdmin !== false
// //             }, {
// //                 headers: {
// //                     'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024',
// //                     'Content-Type': 'application/json'
// //                 }
// //             });
            
// //             console.log('✅ Dashboard notification sent successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Dashboard notification error:', {
// //                 message: error.message,
// //                 status: error.response?.status,
// //                 url: error.config?.url
// //             });
            
// //             if (error.response?.status === 404) {
// //                 console.warn('⚠️ /api/notifications endpoint returned 404, using fallback');
                
// //                 return {
// //                     success: true,
// //                     message: 'Notification processed (fallback mode)',
// //                     notification: notificationData,
// //                     fallback: true,
// //                     timestamp: new Date().toISOString()
// //                 };
// //             }
            
// //             return { 
// //                 success: false, 
// //                 error: error.message,
// //                 statusCode: error.response?.status 
// //             };
// //         }
// //     }

// //     async sendPaymentNotification(paymentData) {
// //         try {
// //             console.log('💰 Sending payment notification via API:', {
// //                 orderNumber: paymentData.orderNumber,
// //                 amount: paymentData.amount
// //             });

// //             const response = await this.client.post('/api/notifications', {
// //                 type: 'PAYMENT_RECEIVED',
// //                 priority: 'high',
// //                 title: 'Payment Received',
// //                 message: `Payment of ₹${this.safeToFixed(paymentData.amount)} received for order #${paymentData.orderNumber}`,
// //                 data: {
// //                     orderNumber: paymentData.orderNumber || '',
// //                     amount: this.safeNumber(paymentData.amount),
// //                     customerName: paymentData.customerName || '',
// //                     customerPhone: this.cleanPhoneNumber(paymentData.customerPhone || ''),
// //                     paymentMethod: paymentData.paymentMethod || 'upi',
// //                     transactionId: paymentData.transactionId || '',
// //                     confidence: this.safeNumber(paymentData.confidence, 1),
// //                     verifiedBy: paymentData.verifiedBy || 'auto_ocr',
// //                     timestamp: new Date().toISOString()
// //                 },
// //                 forAdmin: true
// //             }, {
// //                 headers: {
// //                     'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
// //                 }
// //             });
            
// //             console.log('✅ Payment notification sent successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Send payment notification API error:', error.message);
// //             return { 
// //                 success: false, 
// //                 error: error.message,
// //                 statusCode: error.response?.status 
// //             };
// //         }
// //     }

// //     async sendInvoiceNotification(invoiceData) {
// //         try {
// //             console.log('📄 Sending invoice notification via API:', {
// //                 orderNumber: invoiceData.orderNumber
// //             });

// //             const response = await this.client.post('/api/notifications', {
// //                 type: 'INVOICE_GENERATED',
// //                 priority: 'normal',
// //                 title: 'Invoice Generated',
// //                 message: `Invoice generated for order #${invoiceData.orderNumber}`,
// //                 data: {
// //                     orderNumber: invoiceData.orderNumber || '',
// //                     customerPhone: this.cleanPhoneNumber(invoiceData.customerPhone || ''),
// //                     amount: this.safeNumber(invoiceData.amount),
// //                     invoiceUrl: invoiceData.invoiceUrl || '',
// //                     invoiceGeneratedAt: invoiceData.invoiceGeneratedAt || new Date().toISOString(),
// //                     timestamp: new Date().toISOString()
// //                 },
// //                 forAdmin: true
// //             }, {
// //                 headers: {
// //                     'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
// //                 }
// //             });
            
// //             console.log('✅ Invoice notification sent successfully');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Send invoice notification API error:', error.message);
// //             return { success: false, error: error.message };
// //         }
// //     }

// //     async triggerNewOrderNotification(orderData) {
// //         try {
// //             console.log('🛍️ Triggering new order notification:', {
// //                 orderNumber: orderData.orderNumber
// //             });
            
// //             const response = await this.client.post('/api/admin/notifications/trigger/new-order', {
// //                 ...orderData,
// //                 timestamp: new Date().toISOString()
// //             });
            
// //             console.log('✅ New order notification triggered');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Trigger new order notification error:', error.message);
// //             return { success: false, error: error.message };
// //         }
// //     }

// //     async triggerPaymentNotification(paymentData) {
// //         try {
// //             console.log('💰 Triggering payment notification:', {
// //                 orderNumber: paymentData.orderNumber
// //             });
            
// //             const response = await this.client.post('/api/admin/notifications/trigger/payment', {
// //                 ...paymentData,
// //                 amount: this.safeNumber(paymentData.amount),
// //                 timestamp: new Date().toISOString()
// //             });
            
// //             console.log('✅ Payment notification triggered');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Trigger payment notification error:', error.message);
// //             return { success: false, error: error.message };
// //         }
// //     }

// //     async triggerLowStockNotification(stockData) {
// //         try {
// //             console.log('📉 Triggering low stock notification:', {
// //                 productName: stockData.productName
// //             });
            
// //             const response = await this.client.post('/api/admin/notifications/trigger/low-stock', {
// //                 ...stockData,
// //                 currentStock: this.safeNumber(stockData.currentStock),
// //                 threshold: this.safeNumber(stockData.threshold),
// //                 timestamp: new Date().toISOString()
// //             });
            
// //             console.log('✅ Low stock notification triggered');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ Trigger low stock notification error:', error.message);
// //             return { success: false, error: error.message };
// //         }
// //     }

// //     async checkFCMConnectivity() {
// //         try {
// //             console.log('🔗 Checking FCM connectivity');
            
// //             const response = await this.client.get('/api/admin/notifications/health');
// //             return this.extractData(response.data);

// //         } catch (error) {
// //             console.error('❌ FCM connectivity check failed:', error.message);
// //             return {
// //                 success: false,
// //                 message: 'FCM connectivity check failed',
// //                 error: error.message
// //             };
// //         }
// //     }

// //     async getActiveAdminDevices() {
// //         try {
// //             console.log('📱 Fetching active admin devices');
            
// //             const response = await this.client.get('/api/admin/devices/active');
// //             const result = this.extractData(response.data);
            
// //             console.log(`✅ Found ${result.devices?.length || 0} active devices`);
// //             return result;

// //         } catch (error) {
// //             console.error('❌ Get active devices error:', error.message);
// //             return { devices: [], count: 0 };
// //         }
// //     }

// //     // ========== COMPATIBILITY METHODS ==========

// //     async verifyPayment(paymentData) {
// //         console.log('⚠️ DEPRECATED: verifyPayment called, using createPaymentVerification instead');
// //         try {
// //             const verificationData = {
// //                 orderNumber: paymentData.orderNumber,
// //                 customerPhone: paymentData.customerPhone || paymentData.phoneNumber,
// //                 orderReference: paymentData.orderId || paymentData.orderReference,
// //                 orderDetails: {
// //                     totalAmount: paymentData.amount,
// //                     items: paymentData.items || []
// //                 },
// //                 paymentProof: paymentData.paymentProof || {},
// //                 detectedPayment: {
// //                     amount: paymentData.amount,
// //                     status: 'success',
// //                     confidence: 1
// //                 }
// //             };

// //             return await this.createPaymentVerification(verificationData);
            
// //         } catch (error) {
// //             console.error('❌ verifyPayment (compat) error:', error.message);
// //             throw new Error('Payment verification failed: ' + error.message);
// //         }
// //     }

// //     async saveTokenToBackend(token, deviceInfo = {}) {
// //         return await this.saveFCMToken({
// //             token,
// //             deviceInfo: {
// //                 userAgent: deviceInfo.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
// //                 platform: deviceInfo.platform || (typeof navigator !== 'undefined' ? navigator.platform : ''),
// //                 deviceName: deviceInfo.deviceName || this.getDeviceName(),
// //                 deviceType: deviceInfo.deviceType || this.getDeviceType(),
// //                 os: deviceInfo.os || this.getOS(),
// //                 browser: deviceInfo.browser || this.getBrowser(),
// //                 screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
// //                 ipAddress: deviceInfo.ipAddress || '',
// //                 timestamp: new Date().toISOString(),
// //                 ...deviceInfo
// //             }
// //         });
// //     }

// //     // Helper methods for device detection
// //     getDeviceName() {
// //         if (typeof navigator === 'undefined') return 'Server';
// //         const ua = navigator.userAgent;
// //         if (/mobile/i.test(ua)) return 'Mobile Device';
// //         if (/tablet/i.test(ua)) return 'Tablet';
// //         if (/mac/i.test(ua)) return 'Mac';
// //         if (/windows/i.test(ua)) return 'Windows PC';
// //         if (/linux/i.test(ua)) return 'Linux PC';
// //         return 'Unknown Device';
// //     }

// //     getDeviceType() {
// //         if (typeof navigator === 'undefined') return 'server';
// //         const ua = navigator.userAgent;
// //         if (/mobile/i.test(ua)) return 'mobile';
// //         if (/tablet/i.test(ua)) return 'tablet';
// //         return 'desktop';
// //     }

// //     getOS() {
// //         if (typeof navigator === 'undefined') return 'Server';
// //         const ua = navigator.userAgent;
// //         if (/windows/i.test(ua)) return 'Windows';
// //         if (/mac/i.test(ua)) return 'macOS';
// //         if (/linux/i.test(ua)) return 'Linux';
// //         if (/android/i.test(ua)) return 'Android';
// //         if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
// //         return 'Unknown OS';
// //     }

// //     getBrowser() {
// //         if (typeof navigator === 'undefined') return 'Server';
// //         const ua = navigator.userAgent;
// //         if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
// //         if (/firefox/i.test(ua)) return 'Firefox';
// //         if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
// //         if (/edg/i.test(ua)) return 'Edge';
// //         if (/opera|opr/i.test(ua)) return 'Opera';
// //         return 'Unknown Browser';
// //     }
// // }

// // // Create and export singleton instance
// // const apiService = new ApiService();
// // export default apiService;

















// // services/apiService.js - COMPLETE MULTI-TENANT VERSION WITH COMPANY CONTEXT
// // Updated to support companyId in all API calls for tenant isolation

// import axios from 'axios';

// class ApiService {
//     constructor() {
//         this.baseURL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
//         this.client = axios.create({
//             baseURL: this.baseURL,
//             timeout: 30000,
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });

//         // Add request interceptor for logging with company context
//         this.client.interceptors.request.use(
//             (config) => {
//                 console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                
//                 // Log company context if present
//                 if (config.data?.companyId) {
//                     console.log(`🏢 Company: ${config.data.companyId}`);
//                 }
                
//                 if (config.data && config.method === 'POST') {
//                     console.log('📦 Request Data:', {
//                         orderNumber: config.data.orderNumber,
//                         customerPhone: config.data.customerPhone,
//                         companyId: config.data.companyId,
//                         dataSize: JSON.stringify(config.data).length
//                     });
//                 }
//                 return config;
//             },
//             (error) => {
//                 console.error('❌ API Request Error:', error);
//                 return Promise.reject(error);
//             }
//         );

//         // Add response interceptor for logging
//         this.client.interceptors.response.use(
//             (response) => {
//                 console.log(`✅ API Response: ${response.status} ${response.config.url}`);
//                 return response;
//             },
//             (error) => {
//                 const errorDetails = {
//                     url: error.config?.url,
//                     method: error.config?.method,
//                     status: error.response?.status,
//                     statusText: error.response?.statusText,
//                     data: error.response?.data
//                 };
//                 console.error(`❌ API Response Error:`, errorDetails);
//                 return Promise.reject(error);
//             }
//         );

//         console.log(`🔗 API Service initialized: ${this.baseURL}`);
//     }

//     // ========== UTILITY METHODS ==========

//     handleApiError(operation, error) {
//         const errorDetails = {
//             operation,
//             message: error.message,
//             status: error.response?.status,
//             statusText: error.response?.statusText,
//             url: error.config?.url,
//             data: error.response?.data
//         };

//         console.error(`❌ API Error - ${operation}:`, errorDetails);
//     }

//     extractData(responseData) {
//         if (!responseData) return null;
        
//         if (responseData.success && responseData.data !== undefined) {
//             return responseData.data;
//         }
        
//         return responseData;
//     }

//     ensureArray(responseData) {
//         if (!responseData) return [];
        
//         if (responseData.success && Array.isArray(responseData.data)) {
//             return responseData.data;
//         }
        
//         if (Array.isArray(responseData)) {
//             return responseData;
//         }
        
//         if (responseData.success && responseData.data && typeof responseData.data === 'object') {
//             return [responseData.data];
//         }
        
//         if (responseData && typeof responseData === 'object') {
//             return [responseData];
//         }
        
//         return [];
//     }

//     cleanPhoneNumber(phoneNumber) {
//         if (!phoneNumber) return '';
        
//         // Case 1: Handle WhatsApp ID format (number@lid)
//         if (phoneNumber.includes('@')) {
//             // Extract the part before @
//             const numberPart = phoneNumber.split('@')[0];
//             // Remove any non-digits from that part
//             const numberDigits = numberPart.replace(/\D/g, '');
            
//             // Check if it's an Indian number with country code (91)
//             if (numberDigits.length === 12 && numberDigits.startsWith('91')) {
//                 // Remove 91 and return 10-digit number
//                 return numberDigits.substring(2);
//             }
//             // If it's exactly 10 digits, return as is
//             else if (numberDigits.length === 10) {
//                 return numberDigits;
//             }
//             // If it's longer than 10 digits (like your example 265347508764757)
//             else if (numberDigits.length > 10) {
//                 // Check if it starts with 91 (Indian country code)
//                 if (numberDigits.startsWith('91')) {
//                     return numberDigits.substring(2, 12); // Extract 10 digits after 91
//                 }
//                 // Otherwise take last 10 digits
//                 return numberDigits.slice(-10);
//             }
//             // If none of the above, recursively clean the number part
//             else {
//                 return this.cleanPhoneNumber(numberPart);
//             }
//         }
        
//         // Case 2: Handle raw number strings
//         const cleaned = phoneNumber.replace(/\D/g, '');
        
//         // Indian number with country code (12 digits starting with 91)
//         if (cleaned.length === 12 && cleaned.startsWith('91')) {
//             return cleaned.substring(2);
//         }
//         // Indian number without country code (10 digits)
//         else if (cleaned.length === 10) {
//             return cleaned;
//         }
//         // US number with country code (11 digits starting with 1)
//         else if (cleaned.length === 11 && cleaned.startsWith('1')) {
//             return cleaned.substring(1);
//         }
//         // Any number longer than 10 digits - take last 10
//         else if (cleaned.length > 10) {
//             // Check if it starts with 91 (Indian format)
//             if (cleaned.startsWith('91')) {
//                 return cleaned.substring(2, 12);
//             }
//             return cleaned.slice(-10);
//         }
        
//         // Return whatever we have (might be invalid)
//         return cleaned;
//     }

//     // Safe number formatter
//     safeNumber(value, defaultValue = 0) {
//         if (value === null || value === undefined) return defaultValue;
//         if (typeof value === 'number') return value;
//         const parsed = parseFloat(value);
//         return isNaN(parsed) ? defaultValue : parsed;
//     }

//     safeToFixed(value, digits = 2) {
//         const num = this.safeNumber(value);
//         return num.toFixed(digits);
//     }

//     // ========== PAYMENT VERIFICATION APIS WITH COMPANY CONTEXT ==========

//     async createPaymentVerification(verificationData) {
//         try {
//             console.log('🔍 Creating payment verification:', {
//                 orderNumber: verificationData.orderNumber,
//                 customerPhone: verificationData.customerPhone,
//                 companyId: verificationData.companyId,
//                 hasOcrData: !!verificationData.ocrAnalysis,
//                 hasValidation: !!verificationData.validationResults,
//                 engineUsed: verificationData.metadata?.ocrEngine
//             });

//             if (!verificationData.orderNumber || !verificationData.customerPhone) {
//                 throw new Error('Order number and customer phone are required');
//             }

//             // Format payment verification data with ALL professional OCR fields
//             const formattedData = {
//                 // Core identifiers
//                 orderNumber: verificationData.orderNumber,
//                 customerPhone: verificationData.customerPhone,
//                 customerName: verificationData.customerName || '',
//                 orderReference: verificationData.orderReference || verificationData.orderNumber,
                
//                 // ✅ CRITICAL: Company context for multi-tenancy
//                 companyId: verificationData.companyId || 'default',
                
//                 // Complete order details
//                 orderDetails: {
//                     totalAmount: this.safeNumber(verificationData.orderDetails?.totalAmount || verificationData.amount),
//                     subtotal: this.safeNumber(verificationData.orderDetails?.subtotal),
//                     totalGst: this.safeNumber(verificationData.orderDetails?.totalGst),
//                     customerName: verificationData.orderDetails?.customerName || verificationData.customerName,
//                     customerEmail: verificationData.orderDetails?.customerEmail,
//                     shippingAddress: verificationData.orderDetails?.shippingAddress,
//                     pincode: verificationData.orderDetails?.pincode,
//                     items: (verificationData.orderDetails?.items || []).map(item => ({
//                         productId: item.productId,
//                         productName: item.productName,
//                         quantity: this.safeNumber(item.quantity),
//                         price: this.safeNumber(item.price),
//                         mrp: this.safeNumber(item.mrp),
//                         gstRate: this.safeNumber(item.gstRate, 18),
//                         gstIncluded: item.gstIncluded !== false,
//                         gstAmount: this.safeNumber(item.gstAmount),
//                         totalAmount: this.safeNumber(item.totalAmount)
//                     }))
//                 },

//                 // Payment proof (screenshot/QR)
//                 paymentProof: {
//                     imageData: verificationData.paymentProof?.imageData ? 
//                         verificationData.paymentProof.imageData.substring(0, 10000) : null, // Truncate for storage
//                     mimeType: verificationData.paymentProof?.mimeType || 'image/jpeg',
//                     fileName: verificationData.paymentProof?.fileName || 'payment_screenshot.jpg',
//                     fileSize: verificationData.paymentProof?.fileSize,
//                     uploadedAt: verificationData.paymentProof?.uploadedAt || new Date().toISOString(),
//                     imageHash: verificationData.paymentProof?.imageHash
//                 },

//                 // Detected payment information (from QR/OCR)
//                 detectedPayment: {
//                     amount: this.safeNumber(verificationData.detectedPayment?.amount || verificationData.amount),
//                     upiId: verificationData.detectedPayment?.upiId || verificationData.upiId,
//                     upiTransactionId: verificationData.detectedPayment?.upiTransactionId || verificationData.upiTransactionId,
//                     transactionId: verificationData.detectedPayment?.transactionId || verificationData.transactionId,
//                     bankReference: verificationData.detectedPayment?.bankReference,
//                     paymentMethod: verificationData.detectedPayment?.paymentMethod || verificationData.paymentMethod || 'upi',
//                     timestamp: verificationData.detectedPayment?.timestamp || new Date().toISOString(),
//                     status: verificationData.detectedPayment?.status || 'success',
//                     confidence: this.safeNumber(verificationData.detectedPayment?.confidence, 1),
//                     appName: verificationData.detectedPayment?.appName,
//                     bankName: verificationData.detectedPayment?.bankName,
//                     senderName: verificationData.detectedPayment?.senderName,
//                     senderUpi: verificationData.detectedPayment?.senderUpi,
//                     payeeVPA: verificationData.detectedPayment?.payeeVPA,
//                     reference: verificationData.detectedPayment?.reference,
//                     remarks: verificationData.detectedPayment?.remarks
//                 },

//                 // ========== CRITICAL: OCR ANALYSIS RESULTS ==========
//                 ocrAnalysis: {
//                     // Raw extracted text from screenshot (MOST IMPORTANT FOR AUDIT)
//                     extractedText: verificationData.ocrAnalysis?.extractedText || '',
                    
//                     // Overall confidence scores
//                     confidenceScore: this.safeNumber(verificationData.ocrAnalysis?.confidenceScore, 0),
                    
//                     // Extracted fields with their individual confidences
//                     extractedAmount: this.safeNumber(verificationData.ocrAnalysis?.extractedAmount),
//                     extractedAmountConfidence: this.safeNumber(verificationData.ocrAnalysis?.extractedAmountConfidence, 0),
                    
//                     extractedUPI: verificationData.ocrAnalysis?.extractedUPI || '',
//                     extractedUPIConfidence: this.safeNumber(verificationData.ocrAnalysis?.extractedUPIConfidence, 0),
                    
//                     transactionId: verificationData.ocrAnalysis?.transactionId || '',
//                     transactionIdConfidence: this.safeNumber(verificationData.ocrAnalysis?.transactionIdConfidence, 0),
                    
//                     // Payment status detection
//                     status: verificationData.ocrAnalysis?.status || 'unknown',
//                     statusConfidence: this.safeNumber(verificationData.ocrAnalysis?.statusConfidence, 0),
                    
//                     // Timestamp extraction
//                     timestamp: verificationData.ocrAnalysis?.timestamp || '',
//                     timestampConfidence: this.safeNumber(verificationData.ocrAnalysis?.timestampConfidence, 0),
                    
//                     // App/Bank detection
//                     appName: verificationData.ocrAnalysis?.appName || '',
//                     appNameConfidence: this.safeNumber(verificationData.ocrAnalysis?.appNameConfidence, 0),
                    
//                     bankName: verificationData.ocrAnalysis?.bankName || '',
//                     bankNameConfidence: this.safeNumber(verificationData.ocrAnalysis?.bankNameConfidence, 0),
                    
//                     // OCR metadata
//                     wordCount: this.safeNumber(verificationData.ocrAnalysis?.wordCount, 0),
//                     processingTime: this.safeNumber(verificationData.ocrAnalysis?.processingTime, 0),
//                     ocrEngine: verificationData.ocrAnalysis?.ocrEngine || 'paddle',
//                     backupUsed: verificationData.ocrAnalysis?.backupUsed || false,
                    
//                     // Full raw text for debugging (truncated for performance)
//                     rawText: verificationData.ocrAnalysis?.rawText ? 
//                         verificationData.ocrAnalysis.rawText.substring(0, 5000) : '',
                    
//                     // Word-level data for UI highlighting
//                     words: verificationData.ocrAnalysis?.words || []
//                 },

//                 // ========== VALIDATION RESULTS ==========
//                 validationResults: {
//                     // Amount validation
//                     amountMatch: verificationData.validationResults?.amountMatch || false,
//                     expectedAmount: this.safeNumber(verificationData.validationResults?.expectedAmount),
//                     foundAmount: this.safeNumber(verificationData.validationResults?.foundAmount),
//                     amountDifference: this.safeNumber(verificationData.validationResults?.amountDifference, 0),
//                     matchQuality: verificationData.validationResults?.matchQuality || 'none', // exact/close/near/far
                    
//                     // UPI validation
//                     upiMatch: verificationData.validationResults?.upiMatch || false,
//                     matchedUpiId: verificationData.validationResults?.matchedUpiId,
//                     upiMatchType: verificationData.validationResults?.upiMatchType, // exact/contains/partial
                    
//                     // Time validation
//                     timeValid: verificationData.validationResults?.timeValid || false,
//                     detectedTime: verificationData.validationResults?.detectedTime,
//                     timeDifferenceMinutes: this.safeNumber(verificationData.validationResults?.timeDifferenceMinutes, 0),
                    
//                     // Success indicators
//                     successIndicators: verificationData.validationResults?.successIndicators || false,
                    
//                     // Overall confidence
//                     confidenceScore: this.safeNumber(verificationData.validationResults?.confidenceScore, 0),
                    
//                     // Errors and warnings
//                     validationErrors: verificationData.validationResults?.validationErrors || [],
//                     validationWarnings: verificationData.validationResults?.validationWarnings || [],
                    
//                     // Validation timestamp
//                     validatedAt: verificationData.validationResults?.validatedAt || new Date().toISOString()
//                 },

//                 // ========== FRAUD ANALYSIS ==========
//                 fraudAnalysis: {
//                     isSuspicious: verificationData.fraudAnalysis?.isSuspicious || false,
//                     fraudScore: this.safeNumber(verificationData.fraudAnalysis?.fraudScore, 0),
//                     riskLevel: verificationData.fraudAnalysis?.riskLevel || 'low', // low/medium/high/critical
//                     reasons: verificationData.fraudAnalysis?.reasons || [],
//                     flags: verificationData.fraudAnalysis?.flags || [],
//                     analysisPerformedAt: verificationData.fraudAnalysis?.analysisPerformedAt || new Date().toISOString()
//                 },

//                 // ========== METADATA ==========
//                 metadata: {
//                     // Source information
//                     source: verificationData.metadata?.source || 'whatsapp',
//                     ipAddress: verificationData.metadata?.ipAddress,
//                     userAgent: verificationData.metadata?.userAgent,
                    
//                     // OCR engine information
//                     ocrEngine: verificationData.metadata?.ocrEngine || 'paddle',
//                     backupEngine: verificationData.metadata?.backupEngine,
//                     backupUsed: verificationData.metadata?.backupUsed || false,
                    
//                     // Payment type detection
//                     paymentType: verificationData.metadata?.paymentType || 'screenshot', // qr_code/screenshot/upi_text/phone_number
                    
//                     // Performance metrics
//                     processingTime: this.safeNumber(verificationData.metadata?.processingTime, 0),
                    
//                     // Request tracking
//                     requestId: verificationData.metadata?.requestId,
                    
//                     // Company context
//                     companyId: verificationData.companyId || 'default',
                    
//                     // Any additional metadata
//                     ...verificationData.metadata
//                 },

//                 // Status
//                 status: verificationData.status || 'pending',
                
//                 // Timestamps
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString()
//             };

//             console.log('📤 Sending to /api/payments/verify with complete OCR data:', {
//                 orderNumber: formattedData.orderNumber,
//                 customerPhone: formattedData.customerPhone,
//                 companyId: formattedData.companyId,
//                 ocrConfidence: formattedData.ocrAnalysis.confidenceScore,
//                 extractedAmount: formattedData.ocrAnalysis.extractedAmount,
//                 validationMatch: formattedData.validationResults.matchQuality,
//                 fraudRisk: formattedData.fraudAnalysis.riskLevel,
//                 engineUsed: formattedData.metadata.ocrEngine,
//                 dataSize: JSON.stringify(formattedData).length
//             });

//             const response = await this.client.post('/api/payments/verify', formattedData);
            
//             console.log('✅ Payment verification created successfully:', {
//                 id: response.data?.data?._id,
//                 status: response.data?.data?.status,
//                 companyId: response.data?.data?.companyId,
//                 confidence: response.data?.data?.ocrAnalysis?.confidenceScore
//             });
            
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Create payment verification error:', {
//                 status: error.response?.status,
//                 data: error.response?.data,
//                 message: error.message,
//                 orderNumber: verificationData?.orderNumber,
//                 customerPhone: verificationData?.customerPhone,
//                 companyId: verificationData?.companyId
//             });
            
//             if (error.response?.status === 400) {
//                 throw new Error(`Invalid request: ${error.response.data?.message || 'Bad request'}`);
//             }
            
//             if (error.response?.status === 409) {
//                 throw new Error(`Duplicate verification: ${error.response.data?.message || 'Already exists'}`);
//             }
            
//             throw new Error('Failed to create payment verification: ' + (error.message || 'Unknown error'));
//         }
//     }

//     async verifyPaymentAutomatically(verificationId, verificationResult) {
//         try {
//             if (!verificationId) {
//                 throw new Error('Verification ID is required');
//             }

//             console.log('🤖 Auto-verifying payment:', verificationId);
            
//             const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=verify`, {
//                 verificationResult,
//                 confidenceScore: this.safeNumber(verificationResult?.confidence),
//                 verifiedBy: 'auto-verification',
//                 verificationMethod: verificationResult?.method || 'ocr',
//                 matchedFields: verificationResult?.matchedFields || []
//             });

//             console.log('✅ Payment auto-verified successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Auto-verify error:', error.response?.data || error.message);
//             throw new Error('Failed to auto-verify payment: ' + (error.message || 'Unknown error'));
//         }
//     }
//     // ========== COMPANY IDENTIFICATION METHODS FOR WHATSAPP BOT ==========
// // CRITICAL: These methods allow the WhatsApp bot to identify which company
// // a customer is messaging based on the WhatsApp number they contacted

// /**
//  * Identify company from WhatsApp number that customer messaged
//  * This is the CORE of multi-tenant isolation for WhatsApp
//  * @param {string} whatsappNumber - The WhatsApp number the customer messaged (e.g., "919876543210")
//  * @returns {Promise<string|null>} Company ID or null
//  */
// async identifyCompanyFromWhatsApp(whatsappNumber) {
//     try {
//         if (!whatsappNumber) {
//             console.log('⚠️ No WhatsApp number provided for company identification');
//             return null;
//         }

//         const cleanNumber = this.cleanPhoneNumber(whatsappNumber);
//         console.log(`🔍 Identifying company for WhatsApp number: ${cleanNumber}`);

//         // Call your API endpoint that finds company by WhatsApp number
//         // This endpoint should query the Company model's whatsappRouting.phoneNumbers
//         const response = await this.client.get(`/api/companies/by-whatsapp?phone=${cleanNumber}`);
        
//         if (response.data?.success && response.data?.companyId) {
//             const companyId = response.data.companyId;
//             console.log(`✅ Company identified: ${companyId} for WhatsApp number: ${cleanNumber}`);
            
//             // Store the company ID for subsequent requests
//             this.companyId = companyId;
            
//             // Set default header for all future requests
//             // This ensures ALL subsequent API calls include the company context
//             this.client.defaults.headers.common['x-company-id'] = companyId;
            
//             // Also store in instance for quick access
//             this.currentCompanyId = companyId;
            
//             // Emit event if you have event emitter (optional)
//             if (this.eventEmitter) {
//                 this.eventEmitter.emit('company:identified', { companyId, whatsappNumber: cleanNumber });
//             }
            
//             return companyId;
//         }
        
//         console.log('⚠️ No company found for WhatsApp number: ${cleanNumber}');
//         return null;
        
//     } catch (error) {
//         console.error('❌ Failed to identify company from WhatsApp number:', {
//             whatsappNumber,
//             error: error.message,
//             status: error.response?.status,
//             data: error.response?.data
//         });
        
//         // Return null but don't throw - let the calling code handle it
//         return null;
//     }
// }

// /**
//  * Get current company ID
//  * @returns {string|null} Current company ID
//  */
// getCompanyId() {
//     return this.companyId || this.currentCompanyId || null;
// }

// /**
//  * Set company ID manually (for testing or admin override)
//  * @param {string} companyId - Company ID to set
//  * @param {boolean} persistHeaders - Whether to set default headers
//  */
// setCompanyId(companyId, persistHeaders = true) {
//     if (!companyId) {
//         console.warn('⚠️ Attempted to set null/undefined company ID');
//         return false;
//     }
    
//     this.companyId = companyId;
//     this.currentCompanyId = companyId;
    
//     if (persistHeaders) {
//         this.client.defaults.headers.common['x-company-id'] = companyId;
//         console.log(`✅ Company ID set manually and headers configured: ${companyId}`);
//     } else {
//         console.log(`✅ Company ID set manually (headers not persisted): ${companyId}`);
//     }
    
//     return true;
// }

// /**
//  * Clear company context (e.g., when switching WhatsApp numbers or logging out)
//  */
// clearCompanyContext() {
//     this.companyId = null;
//     this.currentCompanyId = null;
//     delete this.client.defaults.headers.common['x-company-id'];
//     console.log('🧹 Company context cleared from API service');
// }

// /**
//  * Validate that current company context matches expected company
//  * @param {string} expectedCompanyId - Expected company ID
//  * @returns {boolean} True if matches or no context set
//  */
// validateCompanyContext(expectedCompanyId) {
//     if (!expectedCompanyId) {
//         console.warn('⚠️ No expected company ID provided for validation');
//         return true; // Can't validate, assume OK
//     }
    
//     const currentId = this.getCompanyId();
    
//     if (!currentId) {
//         console.warn('⚠️ No company context set, but expected:', expectedCompanyId);
//         return false;
//     }
    
//     const isValid = currentId.toString() === expectedCompanyId.toString();
    
//     if (!isValid) {
//         console.error('❌ Company context mismatch!', {
//             current: currentId,
//             expected: expectedCompanyId
//         });
//     }
    
//     return isValid;
// }

// /**
//  * Ensure company context for API call
//  * @param {Object} options - Request options
//  * @param {string} companyId - Optional company ID to override
//  * @returns {Object} Updated headers
//  */
// ensureCompanyContext(options = {}, companyId = null) {
//     const targetCompanyId = companyId || this.getCompanyId();
    
//     if (!targetCompanyId) {
//         console.warn('⚠️ No company context available for API call');
//         return options;
//     }
    
//     return {
//         ...options,
//         headers: {
//             ...options.headers,
//             'x-company-id': targetCompanyId
//         }
//     };
// }

// /**
//  * Make API call with automatic company context
//  * @param {string} method - HTTP method
//  * @param {string} url - API endpoint
//  * @param {Object} data - Request data
//  * @param {string} companyId - Optional company ID override
//  * @returns {Promise} API response
//  */
// async callWithCompanyContext(method, url, data = null, companyId = null) {
//     const targetCompanyId = companyId || this.getCompanyId();
    
//     const config = {
//         method,
//         url,
//         headers: {}
//     };
    
//     if (targetCompanyId) {
//         config.headers['x-company-id'] = targetCompanyId;
//     }
    
//     if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put' || method.toLowerCase() === 'patch')) {
//         config.data = data;
//     }
    
//     try {
//         const response = await this.client(config);
//         return response;
//     } catch (error) {
//         console.error(`❌ API call failed with company context:`, {
//             method,
//             url,
//             companyId: targetCompanyId,
//             error: error.message
//         });
//         throw error;
//     }
// }

//     async getPaymentVerificationById(verificationId, companyId = null) {
//         try {
//             if (!verificationId) {
//                 throw new Error('Verification ID is required');
//             }

//             let url = `/api/payments/verify?id=${verificationId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Get payment verification error:', error.message);
//             return null;
//         }
//     }

//     async getPaymentVerificationByOrderNumber(orderNumber, companyId = null) {
//         try {
//             if (!orderNumber) {
//                 throw new Error('Order number is required');
//             }

//             let url = `/api/payments/verify?orderNumber=${orderNumber}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Get verification by order error:', error.message);
//             return null;
//         }
//     }

//     async updatePaymentVerificationStatus(verificationId, updateData) {
//         try {
//             if (!verificationId || !updateData) {
//                 throw new Error('Verification ID and update data are required');
//             }

//             const response = await this.client.patch(`/api/payments/verify?id=${verificationId}`, updateData);
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Update verification status error:', error.message);
//             throw new Error('Failed to update payment verification status');
//         }
//     }

//     async rejectPaymentVerification(verificationId, reason, rejectedBy = 'admin', companyId = null) {
//         try {
//             if (!verificationId || !reason) {
//                 throw new Error('Verification ID and reason are required');
//             }

//             let url = `/api/payments/verify?id=${verificationId}&action=reject`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.put(url, {
//                 reason,
//                 rejectedBy,
//                 timestamp: new Date().toISOString()
//             });

//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Reject payment verification error:', error.message);
//             throw new Error('Failed to reject payment verification');
//         }
//     }

//     async markPaymentAsFraud(verificationId, reasons, markedBy = 'admin', companyId = null) {
//         try {
//             if (!verificationId || !reasons) {
//                 throw new Error('Verification ID and reasons are required');
//             }

//             let url = `/api/payments/verify?id=${verificationId}&action=mark-fraud`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.put(url, {
//                 reasons: Array.isArray(reasons) ? reasons : [reasons],
//                 markedBy,
//                 timestamp: new Date().toISOString()
//             });

//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Mark payment as fraud error:', error.message);
//             throw new Error('Failed to mark payment as fraud');
//         }
//     }

//     async getPendingPaymentVerifications(companyId = null) {
//         try {
//             let url = '/api/payments/verify?status=pending';
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.ensureArray(response.data);

//         } catch (error) {
//             console.error('❌ Get pending verifications error:', error.message);
//             return [];
//         }
//     }

//     async getPaymentVerificationsByStatus(status = 'pending', companyId = null) {
//         try {
//             let url = `/api/payments/verify?status=${status}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.ensureArray(response.data);

//         } catch (error) {
//             console.error('❌ Get verifications by status error:', error.message);
//             return [];
//         }
//     }

//     // ========== ORDER APIS WITH COMPANY CONTEXT ==========

//     async createOrder(orderData) {
//         try {
//             if (!orderData.orderNumber || !orderData.phoneNumber || !orderData.items) {
//                 throw new Error('Missing required order fields');
//             }

//             // Format order data with enhanced schema fields and company context
//             const formattedOrderData = {
//                 // ✅ CRITICAL: Company context for multi-tenancy
//                 companyId: orderData.companyId || 'default',
                
//                 orderNumber: orderData.orderNumber,
//                 customerName: orderData.customerName || '',
//                 customerEmail: orderData.customerEmail || '',
//                 phoneNumber: this.cleanPhoneNumber(orderData.phoneNumber),
//                 secondaryPhoneNumber: orderData.secondaryPhoneNumber ? this.cleanPhoneNumber(orderData.secondaryPhoneNumber) : null,
//                 // ✅ WhatsApp number for customer identification
//                 whatsappNumber: orderData.whatsappNumber ? this.cleanPhoneNumber(orderData.whatsappNumber) : null,
//                 shippingAddress: orderData.shippingAddress || {
//                     street: orderData.shippingAddress || orderData.address || '',
//                     city: orderData.city || '',
//                     state: orderData.state || '',
//                     pincode: orderData.pincode || '',
//                     country: 'India'
//                 },
//                 billingAddress: orderData.billingAddress || orderData.shippingAddress,
//                 sameAsShipping: orderData.sameAsShipping !== false,
//                 paymentMethod: orderData.paymentMethod || 'upi',
//                 gstType: orderData.gstType || 'intra-state',
//                 items: (orderData.items || []).map(item => ({
//                     productId: item.productId,
//                     productName: item.productName,
//                     quantity: this.safeNumber(item.quantity, 1),
//                     mrp: this.safeNumber(item.mrp),
//                     discountPrice: this.safeNumber(item.discountPrice),
//                     price: this.safeNumber(item.price),
//                     gstRate: this.safeNumber(item.gstRate, 18),
//                     gstIncluded: item.gstIncluded !== false,
//                     gstAmount: this.safeNumber(item.gstAmount),
//                     totalAmount: this.safeNumber(item.quantity) * this.safeNumber(item.price),
//                     sku: item.sku || '',
//                     hsnCode: item.hsnCode || ''
//                 })),
//                 subtotal: this.safeNumber(orderData.subtotal),
//                 totalDiscount: this.safeNumber(orderData.totalDiscount),
//                 totalGst: this.safeNumber(orderData.totalGst),
//                 shippingCharge: this.safeNumber(orderData.shippingCharge),
//                 totalPrice: this.safeNumber(orderData.totalPrice),
//                 paidAmount: this.safeNumber(orderData.paidAmount, 0),
//                 balanceAmount: this.safeNumber(orderData.totalPrice) - this.safeNumber(orderData.paidAmount, 0),
//                 paymentStatus: orderData.paymentStatus || 'pending',
//                 status: orderData.status || 'pending',
//                 orderNotes: orderData.orderNotes || '',
//                 deliveryDate: orderData.deliveryDate || null,
//                 deliverySlot: orderData.deliverySlot || null,
//                 createdBy: orderData.createdBy || 'whatsapp'
//             };

//             console.log('📦 Creating order with company context:', {
//                 orderNumber: formattedOrderData.orderNumber,
//                 companyId: formattedOrderData.companyId,
//                 customerName: formattedOrderData.customerName,
//                 whatsappNumber: formattedOrderData.whatsappNumber,
//                 totalPrice: formattedOrderData.totalPrice
//             });

//             const response = await this.client.post('/api/orders', formattedOrderData);
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Create Order', error);
//             throw new Error('Failed to create order: ' + (error.response?.data?.message || error.message));
//         }
//     }

//     async getCustomerOrders(identifier, companyId = null) {
//         try {
//             if (!identifier) {
//                 return [];
//             }

//             const cleanIdentifier = this.cleanPhoneNumber(identifier);
//             if (cleanIdentifier.length < 10) {
//                 return [];
//             }

//             console.log(`📞 Fetching orders for identifier: ${cleanIdentifier} company: ${companyId || 'any'}`);
            
//             // ✅ Search by BOTH phoneNumber and whatsappNumber with company filter
//             let url = `/api/orders?search=${cleanIdentifier}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }
            
//             const response = await this.client.get(url);
            
//             // Log the response for debugging
//             console.log(`📊 Found ${response.data?.data?.length || 0} orders`);
            
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Customer Orders', error);
//             return [];
//         }
//     }

//     async getPendingOrdersByPhone(phoneNumber, companyId = null) {
//         try {
//             if (!phoneNumber) {
//                 return [];
//             }

//             const cleanPhone = this.cleanPhoneNumber(phoneNumber);
//             if (cleanPhone.length < 10) {
//                 return [];
//             }

//             console.log(`📞 Fetching pending orders for: ${cleanPhone} company: ${companyId || 'any'}`);
            
//             const allOrders = await this.getCustomerOrders(cleanPhone, companyId);
            
//             const pendingOrders = allOrders.filter(order => 
//                 order.paymentStatus === 'pending' || 
//                 order.paymentStatus === 'partial' ||
//                 (order.status === 'pending' && order.paymentStatus !== 'paid')
//             );

//             console.log(`📦 Found ${pendingOrders.length} pending orders for ${cleanPhone}`);
//             return pendingOrders;
//         } catch (error) {
//             this.handleApiError('Get Pending Orders By Phone', error);
//             return [];
//         }
//     }

//     async getOrderById(orderId, companyId = null) {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             let url = `/api/orders?id=${orderId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             const order = this.extractData(response.data);
            
//             if (!order) {
//                 throw new Error('Order not found in response');
//             }

//             return order;
//         } catch (error) {
//             this.handleApiError('Get Order', error);
            
//             if (error.response?.status === 404) {
//                 return null;
//             }
//             throw new Error('Failed to fetch order');
//         }
//     }

//     async getOrderByNumber(orderNumber, companyId = null) {
//         try {
//             if (!orderNumber) {
//                 throw new Error('Order number is required');
//             }

//             let url = `/api/orders?orderNumber=${orderNumber}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             const order = this.extractData(response.data);
            
//             return order || null;
//         } catch (error) {
//             this.handleApiError('Get Order By Number', error);
//             return null;
//         }
//     }

//     async updateOrderStatus(orderId, status, comment = '', companyId = null) {
//         try {
//             if (!orderId || !status) {
//                 throw new Error('Order ID and status are required');
//             }

//             let url = `/api/orders?id=${orderId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.patch(url, { 
//                 status,
//                 statusComment: comment,
//                 statusHistory: [{
//                     status,
//                     timestamp: new Date().toISOString(),
//                     comment,
//                     updatedBy: 'system'
//                 }]
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Update Order Status', error);
//             throw new Error('Failed to update order status');
//         }
//     }

//     /**
//      * CRITICAL METHOD: Update order payment status with company validation
//      * Used when payment verification succeeds
//      */
//     async updateOrderPaymentStatus(orderNumber, paymentData, companyId = null) {
//         try {
//             if (!orderNumber) {
//                 throw new Error('Order number is required');
//             }

//             console.log(`💰 Updating payment status for order: ${orderNumber} company: ${companyId || 'any'}`, paymentData);

//             // First get the order by order number to get its ID
//             const order = await this.getOrderByNumber(orderNumber, companyId);
            
//             if (!order) {
//                 throw new Error(`Order ${orderNumber} not found`);
//             }

//             // Verify order belongs to the correct company
//             if (companyId && order.companyId && order.companyId.toString() !== companyId.toString()) {
//                 throw new Error(`Order ${orderNumber} does not belong to company ${companyId}`);
//             }

//             // Prepare update data
//             const updatePayload = {
//                 paymentStatus: paymentData.paymentStatus || 'paid',
//                 paidAmount: this.safeNumber(paymentData.paidAmount) || this.safeNumber(paymentData.amount) || order.totalPrice,
//                 balanceAmount: 0,
//                 transactionId: paymentData.transactionId || order.transactionId,
//                 paymentMethod: paymentData.paymentMethod || order.paymentMethod || 'upi',
//                 statusHistory: [{
//                     status: 'confirmed',
//                     timestamp: new Date().toISOString(),
//                     comment: `Payment verified automatically. Transaction: ${paymentData.transactionId || 'N/A'}`,
//                     updatedBy: paymentData.verifiedBy || 'auto_ocr'
//                 }]
//             };

//             // Use the PUT endpoint with payment-verified action
//             let url = `/api/orders?id=${order._id}&action=payment-verified`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.put(url, updatePayload);
            
//             console.log(`✅ Order ${orderNumber} payment status updated to PAID for company ${companyId || order.companyId}`);
//             return this.extractData(response.data);

//         } catch (error) {
//             this.handleApiError('Update Order Payment Status', error);
//             throw new Error('Failed to update order payment status: ' + (error.message || 'Unknown error'));
//         }
//     }

//     // ========== PRODUCT APIS WITH COMPANY CONTEXT ==========

//     async getProducts(companyId = null) {
//         try {
//             let url = '/api/products?isActive=true';
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//                 console.log(`🔍 Fetching products for company: ${companyId}`);
//             }

//             const response = await this.client.get(url);
//             const products = this.ensureArray(response.data);
            
//             // Format products with computed fields and ensure category consistency
//             return products.map(product => {
//                 // ✅ SAFELY extract category information
//                 let categoryName = '';
//                 let categoryId = null;
                
//                 if (product.category) {
//                     if (typeof product.category === 'string') {
//                         categoryName = product.category;
//                         categoryId = product.category;
//                     } else if (typeof product.category === 'object') {
//                         categoryName = product.category.name || '';
//                         categoryId = product.category._id || null;
//                     }
//                 }
                
//                 // ✅ SAFELY extract subCategory information
//                 let subCategoryName = '';
//                 let subCategoryId = null;
                
//                 if (product.subCategory) {
//                     if (typeof product.subCategory === 'string') {
//                         subCategoryName = product.subCategory;
//                         subCategoryId = product.subCategory;
//                     } else if (typeof product.subCategory === 'object') {
//                         subCategoryName = product.subCategory.name || '';
//                         subCategoryId = product.subCategory._id || null;
//                     }
//                 }
                
//                 return {
//                     ...product,
//                     // ✅ Computed fields
//                     displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
//                     inStock: this.safeNumber(product.stock) > 0,
//                     discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
//                         ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
//                         : 0,
                    
//                     // ✅ Category in multiple formats for maximum compatibility
//                     category: product.category, // Keep original
//                     categoryName: categoryName, // String version for search
//                     categoryId: categoryId,     // ID version for reference
                    
//                     // ✅ SubCategory in multiple formats
//                     subCategory: product.subCategory, // Keep original
//                     subCategoryName: subCategoryName, // String version
//                     subCategoryId: subCategoryId,     // ID version
                    
//                     // ✅ Ensure all string fields are actually strings
//                     productName: String(product.productName || ''),
//                     description: String(product.description || ''),
//                     shortDescription: String(product.shortDescription || ''),
//                     sku: String(product.sku || ''),
//                     hsnCode: String(product.hsnCode || ''),
//                     brand: String(product.brand || '')
//                 };
//             });
//         } catch (error) {
//             this.handleApiError('Get Products', error);
//             return [];
//         }
//     }

//     async getProductById(productId, companyId = null) {
//         try {
//             if (!productId || productId.length !== 24) {
//                 throw new Error('Invalid product ID format');
//             }

//             let url = `/api/products?id=${productId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             console.log('🔍 Product by ID response:', response.data);
            
//             const product = this.extractData(response.data);
            
//             if (!product) {
//                 throw new Error('Product not found in response');
//             }

//             // Format with computed fields
//             return {
//                 ...product,
//                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
//                 inStock: this.safeNumber(product.stock) > 0,
//                 discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
//                     ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
//                     : 0
//             };
//         } catch (error) {
//             this.handleApiError('Get Product', error);
            
//             if (error.response?.status === 404) {
//                 return null;
//             }
//             throw new Error('Failed to fetch product');
//         }
//     }

//     async searchProducts(query, companyId = null) {
//         try {
//             if (!query || query.trim().length < 2) {
//                 return [];
//             }

//             let url = `/api/products?search=${encodeURIComponent(query.trim())}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             const products = this.ensureArray(response.data);
            
//             return products.map(product => ({
//                 ...product,
//                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
//                 inStock: this.safeNumber(product.stock) > 0
//             }));
//         } catch (error) {
//             this.handleApiError('Search Products', error);
//             return [];
//         }
//     }

//     async getAllActiveProducts(companyId = null) {
//         try {
//             let url = '/api/products?isActive=true';
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             const products = this.ensureArray(response.data);
            
//             return products.filter(p => p.isActive).map(product => ({
//                 ...product,
//                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
//                 inStock: this.safeNumber(product.stock) > 0
//             }));
//         } catch (error) {
//             this.handleApiError('Get All Active Products', error);
//             return [];
//         }
//     }

//     async getProductsByCategory(category, companyId = null) {
//         try {
//             if (!category) {
//                 return [];
//             }

//             let url = `/api/products?category=${encodeURIComponent(category)}&isActive=true`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             const products = this.ensureArray(response.data);
            
//             return products.map(product => ({
//                 ...product,
//                 displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
//                 inStock: this.safeNumber(product.stock) > 0
//             }));
//         } catch (error) {
//             this.handleApiError('Get Products By Category', error);
//             return [];
//         }
//     }

//     // ========== IMAGE URL HANDLING ==========

//     getProductImageUrl(imagePath) {
//         if (!imagePath) {
//             return null;
//         }

//         const baseUrl = process.env.NEXTJS_BASE_URL || 'http://localhost:3000';
        
//         if (imagePath.startsWith('http')) {
//             return imagePath;
//         }
        
//         if (imagePath.startsWith('/uploads/')) {
//             return `${baseUrl}${imagePath}`;
//         }
        
//         if (imagePath.startsWith('/')) {
//             return `${baseUrl}${imagePath}`;
//         }
        
//         return `${baseUrl}/uploads/${imagePath}`;
//     }

//     async validateImageUrl(imageUrl) {
//         try {
//             if (!imageUrl) return false;
            
//             const fullUrl = this.getProductImageUrl(imageUrl);
//             const response = await axios.head(fullUrl, { timeout: 5000 });
            
//             return response.status === 200;
//         } catch (error) {
//             console.error('❌ Image URL validation failed:', imageUrl, error.message);
//             return false;
//         }
//     }

//     // ========== PRODUCT MANAGEMENT ==========

//     async updateProductStock(productId, newStock, companyId = null) {
//         try {
//             if (!productId || newStock === undefined) {
//                 throw new Error('Product ID and stock are required');
//             }

//             let url = `/api/products?id=${productId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.patch(url, { 
//                 stock: this.safeNumber(newStock) 
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Update Product Stock', error);
//             throw new Error('Failed to update product stock');
//         }
//     }

//     // ========== ORDER MANAGEMENT WITH COMPANY CONTEXT ==========

//     async getOrdersByStatus(status = 'all', companyId = null) {
//         try {
//             let url = `/api/orders?status=${status}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Orders by Status', error);
//             return [];
//         }
//     }

//     async getPendingOrderByPhone(phoneNumber, companyId = null) {
//         try {
//             const pendingOrders = await this.getPendingOrdersByPhone(phoneNumber, companyId);
//             return pendingOrders.length > 0 ? pendingOrders[0] : null;
//         } catch (error) {
//             this.handleApiError('Get Pending Order By Phone', error);
//             return null;
//         }
//     }

//     async cancelOrder(orderId, reason = 'Customer request', companyId = null) {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             let url = `/api/orders?id=${orderId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.patch(url, { 
//                 status: 'cancelled',
//                 cancellationReason: reason,
//                 statusComment: `Order cancelled: ${reason}`
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Cancel Order', error);
//             throw new Error('Failed to cancel order');
//         }
//     }

//     async shipOrder(orderId, trackingNumber = '', companyId = null) {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             let url = `/api/orders?id=${orderId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.patch(url, { 
//                 status: 'shipped',
//                 trackingNumber: trackingNumber,
//                 statusComment: `Order shipped with tracking: ${trackingNumber || 'N/A'}`
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Ship Order', error);
//             throw new Error('Failed to update order as shipped');
//         }
//     }

//     async deliverOrder(orderId, companyId = null) {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             let url = `/api/orders?id=${orderId}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.patch(url, { 
//                 status: 'delivered',
//                 statusComment: 'Order delivered successfully'
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Deliver Order', error);
//             throw new Error('Failed to update order as delivered');
//         }
//     }

//     // ========== PAYMENT APIS WITH COMPANY CONTEXT ==========

//     async rejectPayment(rejectionData) {
//         try {
//             if (!rejectionData.orderNumber) {
//                 throw new Error('Order number is required for payment rejection');
//             }

//             const response = await this.client.post('/api/payments/reject', {
//                 orderNumber: rejectionData.orderNumber,
//                 reason: rejectionData.reason || 'Payment verification failed',
//                 rejectedBy: rejectionData.rejectedBy || 'system',
//                 companyId: rejectionData.companyId || 'default',
//                 timestamp: new Date().toISOString()
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Reject Payment', error);
//             throw new Error('Payment rejection failed');
//         }
//     }

//     async getPendingPayments(companyId = null) {
//         try {
//             let url = '/api/payments/verify?status=pending';
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Pending Payments', error);
//             return [];
//         }
//     }

//     // ========== ANALYTICS AND REPORTING WITH COMPANY CONTEXT ==========

//     async getOrderStats(timeframe = 'month', companyId = null) {
//         try {
//             let url = `/api/analytics/orders?timeframe=${timeframe}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Get Order Stats', error);
//             return {
//                 totalOrders: 0,
//                 totalRevenue: 0,
//                 totalPaid: 0,
//                 totalPending: 0,
//                 pendingOrders: 0,
//                 completedOrders: 0
//             };
//         }
//     }

//     async getProductStats(companyId = null) {
//         try {
//             let url = '/api/analytics/products';
//             if (companyId) {
//                 url += `?companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Get Product Stats', error);
//             return {
//                 totalProducts: 0,
//                 activeProducts: 0,
//                 lowStockProducts: 0,
//                 outOfStockProducts: 0,
//                 totalInventoryValue: 0
//             };
//         }
//     }

//     async getPaymentVerificationStats(timeframe = 'week', companyId = null) {
//         try {
//             let url = `/api/analytics/payments?timeframe=${timeframe}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }

//             const response = await this.client.get(url);
//             return this.extractData(response.data) || {
//                 total: 0,
//                 verified: 0,
//                 pending: 0,
//                 rejected: 0,
//                 fraud: 0,
//                 autoVerified: 0,
//                 manualVerified: 0
//             };
//         } catch (error) {
//             this.handleApiError('Get Payment Verification Stats', error);
//             return {
//                 total: 0,
//                 verified: 0,
//                 pending: 0,
//                 rejected: 0,
//                 fraud: 0,
//                 autoVerified: 0,
//                 manualVerified: 0
//             };
//         }
//     }

//     // Health check
//     async healthCheck() {
//         try {
//             const response = await this.client.get('/api/health');
//             return {
//                 status: 'healthy',
//                 data: response.data
//             };
//         } catch (error) {
//             return {
//                 status: 'unhealthy',
//                 error: error.message
//             };
//         }
//     }

//     async testConnection() {
//         try {
//             const response = await this.client.get('/api/health');
//             console.log('🔗 API Connection Test:', {
//                 status: response.status,
//                 data: response.data
//             });
//             return true;
//         } catch (error) {
//             console.error('🔗 API Connection Failed:', error.message);
//             return false;
//         }
//     }

//     // ========== FCM TOKEN MANAGEMENT APIS WITH COMPANY CONTEXT ==========

//     async saveFCMToken(tokenData) {
//         try {
//             console.log('📱 Saving FCM token for admin device:', {
//                 deviceType: tokenData.deviceInfo?.deviceType,
//                 companyId: tokenData.companyId,
//                 tokenPreview: tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token'
//             });

//             if (!tokenData.token) {
//                 throw new Error('FCM token is required');
//             }

//             const response = await this.client.post('/api/auth/fcm-token', tokenData);
            
//             console.log('✅ FCM token saved successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Save FCM token error:', {
//                 status: error.response?.status,
//                 data: error.response?.data,
//                 message: error.message
//             });
            
//             if (error.response?.status === 401) {
//                 throw new Error('Unauthorized: Admin login required');
//             }
//             throw new Error('Failed to save FCM token: ' + (error.message || 'Unknown error'));
//         }
//     }

//     async deleteFCMToken(token, companyId = null) {
//         try {
//             console.log('🗑️ Deleting FCM token:', token ? token.substring(0, 20) + '...' : 'No token');

//             if (!token) {
//                 throw new Error('FCM token is required');
//             }

//             const data = { token };
//             if (companyId) {
//                 data.companyId = companyId;
//             }

//             const response = await this.client.delete('/api/auth/fcm-token', {
//                 data
//             });
            
//             console.log('✅ FCM token deleted successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Delete FCM token error:', error.message);
//             return { success: false, error: error.message };
//         }
//     }

//     async getAdminFCMTokens(companyId = null) {
//         try {
//             console.log(`📱 Fetching admin FCM tokens for company: ${companyId || 'all'}`);
            
//             let url = '/api/auth/fcm-token?adminOnly=true';
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }
            
//             const response = await this.client.get(url);
//             const result = this.extractData(response.data);
            
//             console.log(`✅ Found ${result.tokens?.length || 0} FCM tokens for company ${companyId || 'all'}`);
//             return result;

//         } catch (error) {
//             console.error('❌ Get FCM tokens error:', error.message);
//             return { tokens: [], count: 0 };
//         }
//     }

//     async sendTestNotificationToAdmin(notificationData = {}, companyId = null) {
//         try {
//             console.log(`🧪 Sending test notification to admin devices for company: ${companyId || 'all'}`);
            
//             const payload = {
//                 title: notificationData.title || 'Test Notification',
//                 body: notificationData.body || 'This is a test notification',
//                 type: notificationData.type || 'test',
//                 priority: notificationData.priority || 'normal',
//                 data: {
//                     ...notificationData.data,
//                     companyId: companyId
//                 },
//                 timestamp: new Date().toISOString()
//             };

//             if (companyId) {
//                 payload.companyId = companyId;
//             }
            
//             const response = await this.client.post('/api/admin/notifications/test', payload);
            
//             console.log('✅ Test notification sent successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Send test notification error:', error.message);
//             return { success: false, error: error.message };
//         }
//     }

//     async getAdminNotificationStats(timeframe = 'day', companyId = null) {
//         try {
//             console.log('📊 Fetching admin notification statistics');
            
//             let url = `/api/admin/notifications/stats?timeframe=${timeframe}`;
//             if (companyId) {
//                 url += `&companyId=${companyId}`;
//             }
            
//             const response = await this.client.get(url);
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Get notification stats error:', error.message);
//             return {
//                 totalSent: 0,
//                 successful: 0,
//                 failed: 0,
//                 timeframe
//             };
//         }
//     }

//     async updateNotificationSettings(settings, companyId = null) {
//         try {
//             console.log(`⚙️ Updating admin notification settings for company: ${companyId || 'all'}`);
            
//             const payload = { ...settings };
//             if (companyId) {
//                 payload.companyId = companyId;
//             }
            
//             const response = await this.client.patch('/api/admin/notifications/settings', payload);
            
//             console.log('✅ Notification settings updated successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Update notification settings error:', error.message);
//             throw new Error('Failed to update notification settings: ' + error.message);
//         }
//     }

//     async getNotificationSettings(companyId = null) {
//         try {
//             console.log(`⚙️ Fetching admin notification settings for company: ${companyId || 'all'}`);
            
//             let url = '/api/admin/notifications/settings';
//             if (companyId) {
//                 url += `?companyId=${companyId}`;
//             }
            
//             const response = await this.client.get(url);
//             const result = this.extractData(response.data);
            
//             return result || {
//                 pushNotifications: { enabled: true },
//                 notificationTypes: {
//                     newOrders: { enabled: true, priority: 'high' },
//                     payments: { enabled: true, priority: 'high' },
//                     lowStock: { enabled: true, priority: 'normal' },
//                     systemAlerts: { enabled: true, priority: 'high' }
//                 },
//                 quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
//             };

//         } catch (error) {
//             console.error('❌ Get notification settings error:', error.message);
//             return {
//                 pushNotifications: { enabled: true },
//                 notificationTypes: {
//                     newOrders: { enabled: true, priority: 'high' },
//                     payments: { enabled: true, priority: 'high' },
//                     lowStock: { enabled: true, priority: 'normal' },
//                     systemAlerts: { enabled: true, priority: 'high' }
//                 },
//                 quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
//             };
//         }
//     }

//     // ========== NOTIFICATION TRIGGER APIS WITH COMPANY CONTEXT ==========

//     async sendNotificationToDashboard(notificationData) {
//         try {
//             console.log('📤 Sending notification to dashboard:', {
//                 type: notificationData.type,
//                 companyId: notificationData.companyId,
//                 orderNumber: notificationData.data?.orderNumber
//             });

//             const payload = {
//                 type: notificationData.type || 'INFO',
//                 priority: notificationData.priority || 'normal',
//                 title: notificationData.title || '',
//                 message: notificationData.message || '',
//                 data: {
//                     ...notificationData.data,
//                     timestamp: new Date().toISOString()
//                 },
//                 forAdmin: notificationData.forAdmin !== false
//             };

//             if (notificationData.companyId) {
//                 payload.companyId = notificationData.companyId;
//             }

//             const response = await this.client.post('/api/notifications', payload, {
//                 headers: {
//                     'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024',
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             console.log('✅ Dashboard notification sent successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Dashboard notification error:', {
//                 message: error.message,
//                 status: error.response?.status,
//                 url: error.config?.url
//             });
            
//             if (error.response?.status === 404) {
//                 console.warn('⚠️ /api/notifications endpoint returned 404, using fallback');
                
//                 return {
//                     success: true,
//                     message: 'Notification processed (fallback mode)',
//                     notification: notificationData,
//                     fallback: true,
//                     timestamp: new Date().toISOString()
//                 };
//             }
            
//             return { 
//                 success: false, 
//                 error: error.message,
//                 statusCode: error.response?.status 
//             };
//         }
//     }

//     async sendPaymentNotification(paymentData) {
//         try {
//             console.log('💰 Sending payment notification via API:', {
//                 orderNumber: paymentData.orderNumber,
//                 amount: paymentData.amount,
//                 companyId: paymentData.companyId
//             });

//             const payload = {
//                 type: 'PAYMENT_RECEIVED',
//                 priority: 'high',
//                 title: 'Payment Received',
//                 message: `Payment of ₹${this.safeToFixed(paymentData.amount)} received for order #${paymentData.orderNumber}`,
//                 data: {
//                     orderNumber: paymentData.orderNumber || '',
//                     amount: this.safeNumber(paymentData.amount),
//                     customerName: paymentData.customerName || '',
//                     customerPhone: this.cleanPhoneNumber(paymentData.customerPhone || ''),
//                     paymentMethod: paymentData.paymentMethod || 'upi',
//                     transactionId: paymentData.transactionId || '',
//                     confidence: this.safeNumber(paymentData.confidence, 1),
//                     verifiedBy: paymentData.verifiedBy || 'auto_ocr',
//                     companyId: paymentData.companyId || 'default',
//                     timestamp: new Date().toISOString()
//                 },
//                 forAdmin: true
//             };

//             if (paymentData.companyId) {
//                 payload.companyId = paymentData.companyId;
//             }

//             const response = await this.client.post('/api/notifications', payload, {
//                 headers: {
//                     'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
//                 }
//             });
            
//             console.log('✅ Payment notification sent successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Send payment notification API error:', error.message);
//             return { 
//                 success: false, 
//                 error: error.message,
//                 statusCode: error.response?.status 
//             };
//         }
//     }

//     async sendInvoiceNotification(invoiceData) {
//         try {
//             console.log('📄 Sending invoice notification via API:', {
//                 orderNumber: invoiceData.orderNumber,
//                 companyId: invoiceData.companyId
//             });

//             const payload = {
//                 type: 'INVOICE_GENERATED',
//                 priority: 'normal',
//                 title: 'Invoice Generated',
//                 message: `Invoice generated for order #${invoiceData.orderNumber}`,
//                 data: {
//                     orderNumber: invoiceData.orderNumber || '',
//                     customerPhone: this.cleanPhoneNumber(invoiceData.customerPhone || ''),
//                     amount: this.safeNumber(invoiceData.amount),
//                     invoiceUrl: invoiceData.invoiceUrl || '',
//                     invoiceGeneratedAt: invoiceData.invoiceGeneratedAt || new Date().toISOString(),
//                     companyId: invoiceData.companyId || 'default',
//                     timestamp: new Date().toISOString()
//                 },
//                 forAdmin: true
//             };

//             if (invoiceData.companyId) {
//                 payload.companyId = invoiceData.companyId;
//             }

//             const response = await this.client.post('/api/notifications', payload, {
//                 headers: {
//                     'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
//                 }
//             });
            
//             console.log('✅ Invoice notification sent successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Send invoice notification API error:', error.message);
//             return { success: false, error: error.message };
//         }
//     }

//     async triggerNewOrderNotification(orderData) {
//         try {
//             console.log('🛍️ Triggering new order notification:', {
//                 orderNumber: orderData.orderNumber,
//                 companyId: orderData.companyId
//             });
            
//             const payload = {
//                 ...orderData,
//                 companyId: orderData.companyId || 'default',
//                 timestamp: new Date().toISOString()
//             };
            
//             const response = await this.client.post('/api/admin/notifications/trigger/new-order', payload);
            
//             console.log('✅ New order notification triggered');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Trigger new order notification error:', error.message);
//             return { success: false, error: error.message };
//         }
//     }

//     async triggerPaymentNotification(paymentData) {
//         try {
//             console.log('💰 Triggering payment notification:', {
//                 orderNumber: paymentData.orderNumber,
//                 companyId: paymentData.companyId
//             });
            
//             const payload = {
//                 ...paymentData,
//                 amount: this.safeNumber(paymentData.amount),
//                 companyId: paymentData.companyId || 'default',
//                 timestamp: new Date().toISOString()
//             };
            
//             const response = await this.client.post('/api/admin/notifications/trigger/payment', payload);
            
//             console.log('✅ Payment notification triggered');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Trigger payment notification error:', error.message);
//             return { success: false, error: error.message };
//         }
//     }

//     async triggerLowStockNotification(stockData) {
//         try {
//             console.log('📉 Triggering low stock notification:', {
//                 productName: stockData.productName,
//                 companyId: stockData.companyId
//             });
            
//             const payload = {
//                 ...stockData,
//                 currentStock: this.safeNumber(stockData.currentStock),
//                 threshold: this.safeNumber(stockData.threshold),
//                 companyId: stockData.companyId || 'default',
//                 timestamp: new Date().toISOString()
//             };
            
//             const response = await this.client.post('/api/admin/notifications/trigger/low-stock', payload);
            
//             console.log('✅ Low stock notification triggered');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Trigger low stock notification error:', error.message);
//             return { success: false, error: error.message };
//         }
//     }

//     async checkFCMConnectivity(companyId = null) {
//         try {
//             console.log(`🔗 Checking FCM connectivity for company: ${companyId || 'all'}`);
            
//             let url = '/api/admin/notifications/health';
//             if (companyId) {
//                 url += `?companyId=${companyId}`;
//             }
            
//             const response = await this.client.get(url);
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ FCM connectivity check failed:', error.message);
//             return {
//                 success: false,
//                 message: 'FCM connectivity check failed',
//                 error: error.message
//             };
//         }
//     }

//     async getActiveAdminDevices(companyId = null) {
//         try {
//             console.log(`📱 Fetching active admin devices for company: ${companyId || 'all'}`);
            
//             let url = '/api/admin/devices/active';
//             if (companyId) {
//                 url += `?companyId=${companyId}`;
//             }
            
//             const response = await this.client.get(url);
//             const result = this.extractData(response.data);
            
//             console.log(`✅ Found ${result.devices?.length || 0} active devices`);
//             return result;

//         } catch (error) {
//             console.error('❌ Get active devices error:', error.message);
//             return { devices: [], count: 0 };
//         }
//     }

//     // ========== COMPATIBILITY METHODS ==========

//     async verifyPayment(paymentData) {
//         console.log('⚠️ DEPRECATED: verifyPayment called, using createPaymentVerification instead');
//         try {
//             const verificationData = {
//                 orderNumber: paymentData.orderNumber,
//                 customerPhone: paymentData.customerPhone || paymentData.phoneNumber,
//                 orderReference: paymentData.orderId || paymentData.orderReference,
//                 companyId: paymentData.companyId || 'default',
//                 orderDetails: {
//                     totalAmount: paymentData.amount,
//                     items: paymentData.items || []
//                 },
//                 paymentProof: paymentData.paymentProof || {},
//                 detectedPayment: {
//                     amount: paymentData.amount,
//                     status: 'success',
//                     confidence: 1
//                 }
//             };

//             return await this.createPaymentVerification(verificationData);
            
//         } catch (error) {
//             console.error('❌ verifyPayment (compat) error:', error.message);
//             throw new Error('Payment verification failed: ' + error.message);
//         }
//     }

//     async saveTokenToBackend(token, deviceInfo = {}, companyId = null) {
//         return await this.saveFCMToken({
//             token,
//             companyId: companyId || 'default',
//             deviceInfo: {
//                 userAgent: deviceInfo.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
//                 platform: deviceInfo.platform || (typeof navigator !== 'undefined' ? navigator.platform : ''),
//                 deviceName: deviceInfo.deviceName || this.getDeviceName(),
//                 deviceType: deviceInfo.deviceType || this.getDeviceType(),
//                 os: deviceInfo.os || this.getOS(),
//                 browser: deviceInfo.browser || this.getBrowser(),
//                 screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
//                 ipAddress: deviceInfo.ipAddress || '',
//                 timestamp: new Date().toISOString(),
//                 ...deviceInfo
//             }
//         });
//     }

//     // Helper methods for device detection
//     getDeviceName() {
//         if (typeof navigator === 'undefined') return 'Server';
//         const ua = navigator.userAgent;
//         if (/mobile/i.test(ua)) return 'Mobile Device';
//         if (/tablet/i.test(ua)) return 'Tablet';
//         if (/mac/i.test(ua)) return 'Mac';
//         if (/windows/i.test(ua)) return 'Windows PC';
//         if (/linux/i.test(ua)) return 'Linux PC';
//         return 'Unknown Device';
//     }

//     getDeviceType() {
//         if (typeof navigator === 'undefined') return 'server';
//         const ua = navigator.userAgent;
//         if (/mobile/i.test(ua)) return 'mobile';
//         if (/tablet/i.test(ua)) return 'tablet';
//         return 'desktop';
//     }

//     getOS() {
//         if (typeof navigator === 'undefined') return 'Server';
//         const ua = navigator.userAgent;
//         if (/windows/i.test(ua)) return 'Windows';
//         if (/mac/i.test(ua)) return 'macOS';
//         if (/linux/i.test(ua)) return 'Linux';
//         if (/android/i.test(ua)) return 'Android';
//         if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
//         return 'Unknown OS';
//     }

//     getBrowser() {
//         if (typeof navigator === 'undefined') return 'Server';
//         const ua = navigator.userAgent;
//         if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
//         if (/firefox/i.test(ua)) return 'Firefox';
//         if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
//         if (/edg/i.test(ua)) return 'Edge';
//         if (/opera|opr/i.test(ua)) return 'Opera';
//         return 'Unknown Browser';
//     }
// }


// // Create and export singleton instance
// const apiService = new ApiService();
// export default apiService;





























// services/apiService.js - COMPLETE MULTI-TENANT VERSION WITH COMPANY CONTEXT
// Updated to support companyId in all API calls for tenant isolation

import axios from 'axios';

class ApiService {
    constructor() {
        this.baseURL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Add request interceptor for logging with company context
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                
                // Log company context if present
                if (config.data?.companyId) {
                    console.log(`🏢 Company: ${config.data.companyId}`);
                }
                
                if (config.data && config.method === 'POST') {
                    console.log('📦 Request Data:', {
                        orderNumber: config.data.orderNumber,
                        customerPhone: config.data.customerPhone,
                        companyId: config.data.companyId,
                        dataSize: JSON.stringify(config.data).length
                    });
                }
                return config;
            },
            (error) => {
                console.error('❌ API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.client.interceptors.response.use(
            (response) => {
                console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                const errorDetails = {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                };
                console.error(`❌ API Response Error:`, errorDetails);
                return Promise.reject(error);
            }
        );

        console.log(`🔗 API Service initialized: ${this.baseURL}`);
    }

    // ========== UTILITY METHODS ==========

    handleApiError(operation, error) {
        const errorDetails = {
            operation,
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data
        };

        console.error(`❌ API Error - ${operation}:`, errorDetails);
    }

    extractData(responseData) {
        if (!responseData) return null;
        
        if (responseData.success && responseData.data !== undefined) {
            return responseData.data;
        }
        
        return responseData;
    }

    ensureArray(responseData) {
        if (!responseData) return [];
        
        if (responseData.success && Array.isArray(responseData.data)) {
            return responseData.data;
        }
        
        if (Array.isArray(responseData)) {
            return responseData;
        }
        
        if (responseData.success && responseData.data && typeof responseData.data === 'object') {
            return [responseData.data];
        }
        
        if (responseData && typeof responseData === 'object') {
            return [responseData];
        }
        
        return [];
    }

    cleanPhoneNumber(phoneNumber) {
        if (!phoneNumber) return '';
        
        // Case 1: Handle WhatsApp ID format (number@lid)
        if (phoneNumber.includes('@')) {
            // Extract the part before @
            const numberPart = phoneNumber.split('@')[0];
            // Remove any non-digits from that part
            const numberDigits = numberPart.replace(/\D/g, '');
            
            // Check if it's an Indian number with country code (91)
            if (numberDigits.length === 12 && numberDigits.startsWith('91')) {
                // Remove 91 and return 10-digit number
                return numberDigits.substring(2);
            }
            // If it's exactly 10 digits, return as is
            else if (numberDigits.length === 10) {
                return numberDigits;
            }
            // If it's longer than 10 digits (like your example 265347508764757)
            else if (numberDigits.length > 10) {
                // Check if it starts with 91 (Indian country code)
                if (numberDigits.startsWith('91')) {
                    return numberDigits.substring(2, 12); // Extract 10 digits after 91
                }
                // Otherwise take last 10 digits
                return numberDigits.slice(-10);
            }
            // If none of the above, recursively clean the number part
            else {
                return this.cleanPhoneNumber(numberPart);
            }
        }
        
        // Case 2: Handle raw number strings
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Indian number with country code (12 digits starting with 91)
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return cleaned.substring(2);
        }
        // Indian number without country code (10 digits)
        else if (cleaned.length === 10) {
            return cleaned;
        }
        // US number with country code (11 digits starting with 1)
        else if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return cleaned.substring(1);
        }
        // Any number longer than 10 digits - take last 10
        else if (cleaned.length > 10) {
            // Check if it starts with 91 (Indian format)
            if (cleaned.startsWith('91')) {
                return cleaned.substring(2, 12);
            }
            return cleaned.slice(-10);
        }
        
        // Return whatever we have (might be invalid)
        return cleaned;
    }

    // Safe number formatter
    safeNumber(value, defaultValue = 0) {
        if (value === null || value === undefined) return defaultValue;
        if (typeof value === 'number') return value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    safeToFixed(value, digits = 2) {
        const num = this.safeNumber(value);
        return num.toFixed(digits);
    }

    // ========== PAYMENT VERIFICATION APIS WITH COMPANY CONTEXT ==========

    async createPaymentVerification(verificationData) {
        try {
            console.log('🔍 Creating payment verification:', {
                orderNumber: verificationData.orderNumber,
                customerPhone: verificationData.customerPhone,
                companyId: verificationData.companyId,
                hasOcrData: !!verificationData.ocrAnalysis,
                hasValidation: !!verificationData.validationResults,
                engineUsed: verificationData.metadata?.ocrEngine
            });

            if (!verificationData.orderNumber || !verificationData.customerPhone) {
                throw new Error('Order number and customer phone are required');
            }

            // Format payment verification data with ALL professional OCR fields
            const formattedData = {
                // Core identifiers
                orderNumber: verificationData.orderNumber,
                customerPhone: verificationData.customerPhone,
                customerName: verificationData.customerName || '',
                orderReference: verificationData.orderReference || verificationData.orderNumber,
                
                // ✅ CRITICAL: Company context for multi-tenancy
                companyId: verificationData.companyId || 'default',
                
                // Complete order details
                orderDetails: {
                    totalAmount: this.safeNumber(verificationData.orderDetails?.totalAmount || verificationData.amount),
                    subtotal: this.safeNumber(verificationData.orderDetails?.subtotal),
                    totalGst: this.safeNumber(verificationData.orderDetails?.totalGst),
                    customerName: verificationData.orderDetails?.customerName || verificationData.customerName,
                    customerEmail: verificationData.orderDetails?.customerEmail,
                    shippingAddress: verificationData.orderDetails?.shippingAddress,
                    pincode: verificationData.orderDetails?.pincode,
                    items: (verificationData.orderDetails?.items || []).map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: this.safeNumber(item.quantity),
                        price: this.safeNumber(item.price),
                        mrp: this.safeNumber(item.mrp),
                        gstRate: this.safeNumber(item.gstRate, 18),
                        gstIncluded: item.gstIncluded !== false,
                        gstAmount: this.safeNumber(item.gstAmount),
                        totalAmount: this.safeNumber(item.totalAmount)
                    }))
                },

                // Payment proof (screenshot/QR)
                paymentProof: {
                    imageData: verificationData.paymentProof?.imageData ? 
                        verificationData.paymentProof.imageData.substring(0, 10000) : null, // Truncate for storage
                    mimeType: verificationData.paymentProof?.mimeType || 'image/jpeg',
                    fileName: verificationData.paymentProof?.fileName || 'payment_screenshot.jpg',
                    fileSize: verificationData.paymentProof?.fileSize,
                    uploadedAt: verificationData.paymentProof?.uploadedAt || new Date().toISOString(),
                    imageHash: verificationData.paymentProof?.imageHash
                },

                // Detected payment information (from QR/OCR)
                detectedPayment: {
                    amount: this.safeNumber(verificationData.detectedPayment?.amount || verificationData.amount),
                    upiId: verificationData.detectedPayment?.upiId || verificationData.upiId,
                    upiTransactionId: verificationData.detectedPayment?.upiTransactionId || verificationData.upiTransactionId,
                    transactionId: verificationData.detectedPayment?.transactionId || verificationData.transactionId,
                    bankReference: verificationData.detectedPayment?.bankReference,
                    paymentMethod: verificationData.detectedPayment?.paymentMethod || verificationData.paymentMethod || 'upi',
                    timestamp: verificationData.detectedPayment?.timestamp || new Date().toISOString(),
                    status: verificationData.detectedPayment?.status || 'success',
                    confidence: this.safeNumber(verificationData.detectedPayment?.confidence, 1),
                    appName: verificationData.detectedPayment?.appName,
                    bankName: verificationData.detectedPayment?.bankName,
                    senderName: verificationData.detectedPayment?.senderName,
                    senderUpi: verificationData.detectedPayment?.senderUpi,
                    payeeVPA: verificationData.detectedPayment?.payeeVPA,
                    reference: verificationData.detectedPayment?.reference,
                    remarks: verificationData.detectedPayment?.remarks
                },

                // ========== CRITICAL: OCR ANALYSIS RESULTS ==========
                ocrAnalysis: {
                    // Raw extracted text from screenshot (MOST IMPORTANT FOR AUDIT)
                    extractedText: verificationData.ocrAnalysis?.extractedText || '',
                    
                    // Overall confidence scores
                    confidenceScore: this.safeNumber(verificationData.ocrAnalysis?.confidenceScore, 0),
                    
                    // Extracted fields with their individual confidences
                    extractedAmount: this.safeNumber(verificationData.ocrAnalysis?.extractedAmount),
                    extractedAmountConfidence: this.safeNumber(verificationData.ocrAnalysis?.extractedAmountConfidence, 0),
                    
                    extractedUPI: verificationData.ocrAnalysis?.extractedUPI || '',
                    extractedUPIConfidence: this.safeNumber(verificationData.ocrAnalysis?.extractedUPIConfidence, 0),
                    
                    transactionId: verificationData.ocrAnalysis?.transactionId || '',
                    transactionIdConfidence: this.safeNumber(verificationData.ocrAnalysis?.transactionIdConfidence, 0),
                    
                    // Payment status detection
                    status: verificationData.ocrAnalysis?.status || 'unknown',
                    statusConfidence: this.safeNumber(verificationData.ocrAnalysis?.statusConfidence, 0),
                    
                    // Timestamp extraction
                    timestamp: verificationData.ocrAnalysis?.timestamp || '',
                    timestampConfidence: this.safeNumber(verificationData.ocrAnalysis?.timestampConfidence, 0),
                    
                    // App/Bank detection
                    appName: verificationData.ocrAnalysis?.appName || '',
                    appNameConfidence: this.safeNumber(verificationData.ocrAnalysis?.appNameConfidence, 0),
                    
                    bankName: verificationData.ocrAnalysis?.bankName || '',
                    bankNameConfidence: this.safeNumber(verificationData.ocrAnalysis?.bankNameConfidence, 0),
                    
                    // OCR metadata
                    wordCount: this.safeNumber(verificationData.ocrAnalysis?.wordCount, 0),
                    processingTime: this.safeNumber(verificationData.ocrAnalysis?.processingTime, 0),
                    ocrEngine: verificationData.ocrAnalysis?.ocrEngine || 'paddle',
                    backupUsed: verificationData.ocrAnalysis?.backupUsed || false,
                    
                    // Full raw text for debugging (truncated for performance)
                    rawText: verificationData.ocrAnalysis?.rawText ? 
                        verificationData.ocrAnalysis.rawText.substring(0, 5000) : '',
                    
                    // Word-level data for UI highlighting
                    words: verificationData.ocrAnalysis?.words || []
                },

                // ========== VALIDATION RESULTS ==========
                validationResults: {
                    // Amount validation
                    amountMatch: verificationData.validationResults?.amountMatch || false,
                    expectedAmount: this.safeNumber(verificationData.validationResults?.expectedAmount),
                    foundAmount: this.safeNumber(verificationData.validationResults?.foundAmount),
                    amountDifference: this.safeNumber(verificationData.validationResults?.amountDifference, 0),
                    matchQuality: verificationData.validationResults?.matchQuality || 'none', // exact/close/near/far
                    
                    // UPI validation
                    upiMatch: verificationData.validationResults?.upiMatch || false,
                    matchedUpiId: verificationData.validationResults?.matchedUpiId,
                    upiMatchType: verificationData.validationResults?.upiMatchType, // exact/contains/partial
                    
                    // Time validation
                    timeValid: verificationData.validationResults?.timeValid || false,
                    detectedTime: verificationData.validationResults?.detectedTime,
                    timeDifferenceMinutes: this.safeNumber(verificationData.validationResults?.timeDifferenceMinutes, 0),
                    
                    // Success indicators
                    successIndicators: verificationData.validationResults?.successIndicators || false,
                    
                    // Overall confidence
                    confidenceScore: this.safeNumber(verificationData.validationResults?.confidenceScore, 0),
                    
                    // Errors and warnings
                    validationErrors: verificationData.validationResults?.validationErrors || [],
                    validationWarnings: verificationData.validationResults?.validationWarnings || [],
                    
                    // Validation timestamp
                    validatedAt: verificationData.validationResults?.validatedAt || new Date().toISOString()
                },

                // ========== FRAUD ANALYSIS ==========
                fraudAnalysis: {
                    isSuspicious: verificationData.fraudAnalysis?.isSuspicious || false,
                    fraudScore: this.safeNumber(verificationData.fraudAnalysis?.fraudScore, 0),
                    riskLevel: verificationData.fraudAnalysis?.riskLevel || 'low', // low/medium/high/critical
                    reasons: verificationData.fraudAnalysis?.reasons || [],
                    flags: verificationData.fraudAnalysis?.flags || [],
                    analysisPerformedAt: verificationData.fraudAnalysis?.analysisPerformedAt || new Date().toISOString()
                },

                // ========== METADATA ==========
                metadata: {
                    // Source information
                    source: verificationData.metadata?.source || 'whatsapp',
                    ipAddress: verificationData.metadata?.ipAddress,
                    userAgent: verificationData.metadata?.userAgent,
                    
                    // OCR engine information
                    ocrEngine: verificationData.metadata?.ocrEngine || 'paddle',
                    backupEngine: verificationData.metadata?.backupEngine,
                    backupUsed: verificationData.metadata?.backupUsed || false,
                    
                    // Payment type detection
                    paymentType: verificationData.metadata?.paymentType || 'screenshot', // qr_code/screenshot/upi_text/phone_number
                    
                    // Performance metrics
                    processingTime: this.safeNumber(verificationData.metadata?.processingTime, 0),
                    
                    // Request tracking
                    requestId: verificationData.metadata?.requestId,
                    
                    // Company context
                    companyId: verificationData.companyId || 'default',
                    
                    // Any additional metadata
                    ...verificationData.metadata
                },

                // Status
                status: verificationData.status || 'pending',
                
                // Timestamps
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('📤 Sending to /api/payments/verify with complete OCR data:', {
                orderNumber: formattedData.orderNumber,
                customerPhone: formattedData.customerPhone,
                companyId: formattedData.companyId,
                ocrConfidence: formattedData.ocrAnalysis.confidenceScore,
                extractedAmount: formattedData.ocrAnalysis.extractedAmount,
                validationMatch: formattedData.validationResults.matchQuality,
                fraudRisk: formattedData.fraudAnalysis.riskLevel,
                engineUsed: formattedData.metadata.ocrEngine,
                dataSize: JSON.stringify(formattedData).length
            });

            const response = await this.client.post('/api/payments/verify', formattedData);
            
            console.log('✅ Payment verification created successfully:', {
                id: response.data?.data?._id,
                status: response.data?.data?.status,
                companyId: response.data?.data?.companyId,
                confidence: response.data?.data?.ocrAnalysis?.confidenceScore
            });
            
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Create payment verification error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                orderNumber: verificationData?.orderNumber,
                customerPhone: verificationData?.customerPhone,
                companyId: verificationData?.companyId
            });
            
            if (error.response?.status === 400) {
                throw new Error(`Invalid request: ${error.response.data?.message || 'Bad request'}`);
            }
            
            if (error.response?.status === 409) {
                throw new Error(`Duplicate verification: ${error.response.data?.message || 'Already exists'}`);
            }
            
            throw new Error('Failed to create payment verification: ' + (error.message || 'Unknown error'));
        }
    }

    async verifyPaymentAutomatically(verificationId, verificationResult) {
        try {
            if (!verificationId) {
                throw new Error('Verification ID is required');
            }

            console.log('🤖 Auto-verifying payment:', verificationId);
            
            const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=verify`, {
                verificationResult,
                confidenceScore: this.safeNumber(verificationResult?.confidence),
                verifiedBy: 'auto-verification',
                verificationMethod: verificationResult?.method || 'ocr',
                matchedFields: verificationResult?.matchedFields || []
            });

            console.log('✅ Payment auto-verified successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Auto-verify error:', error.response?.data || error.message);
            throw new Error('Failed to auto-verify payment: ' + (error.message || 'Unknown error'));
        }
    }

    // ========== COMPANY IDENTIFICATION METHODS FOR WHATSAPP BOT ==========
    // CRITICAL: These methods allow the WhatsApp bot to identify which company
    // a customer is messaging based on the WhatsApp number they contacted

    /**
 * Identify company from WhatsApp number that customer messaged
 * This is the CORE of multi-tenant isolation for WhatsApp
 * @param {string} whatsappNumber - The WhatsApp number the customer messaged (e.g., "919876543210")
 * @returns {Promise<string|null>} Company ID or null
 */
/**
 * Identify company from WhatsApp number that customer messaged
 * This is the CORE of multi-tenant isolation for WhatsApp
 * @param {string} whatsappNumber - The WhatsApp number the customer messaged (e.g., "919876543210")
 * @returns {Promise<string|null>} Company ID or null
 */
async identifyCompanyFromWhatsApp(whatsappNumber) {
    console.log('\n' + '🔍'.repeat(30));
    console.log('🔍 [DEBUG] ===== identifyCompanyFromWhatsApp CALLED =====');
    console.log(`🔍 [DEBUG] Input whatsappNumber: "${whatsappNumber}"`);
    console.log('🔍'.repeat(30) + '\n');
    
    try {
        if (!whatsappNumber) {
            console.log('⚠️ No WhatsApp number provided for company identification');
            console.log('🔍 [DEBUG] Returning null - no number');
            return null;
        }

        const cleanNumber = this.cleanPhoneNumber(whatsappNumber);
        console.log(`🔍 [DEBUG] Original: "${whatsappNumber}" → Cleaned: "${cleanNumber}"`);
        console.log(`🔍 Identifying company for WhatsApp number: ${cleanNumber}`);

        // Call your API endpoint that finds company by WhatsApp number
        console.log(`🔍 [DEBUG] Making API call to: /api/companies/by-whatsapp?phone=${cleanNumber}`);
        
        const response = await this.client.get(`/api/companies/by-whatsapp?phone=${cleanNumber}`);
        
        console.log(`🔍 [DEBUG] API Response status: ${response.status}`);
        console.log(`🔍 [DEBUG] API Response data:`, JSON.stringify(response.data, null, 2));
        
        // ✅ FIXED: Check for response.data.data._id (not response.data.companyId)
        if (response.data?.success && response.data?.data?._id) {
            const companyId = response.data.data._id;  // ← FIXED: Use data._id
            console.log(`✅ Company identified: ${companyId} for WhatsApp number: ${cleanNumber}`);
            console.log(`🔍 [DEBUG] Setting this.companyId to: ${companyId}`);
            
            // Store the company ID for subsequent requests
            this.companyId = companyId;
            
            // Set default header for all future requests
            console.log(`🔍 [DEBUG] Setting x-company-id header to: ${companyId}`);
            this.client.defaults.headers.common['x-company-id'] = companyId;
            
            // Also store in instance for quick access
            this.currentCompanyId = companyId;
            
            // Emit event if you have event emitter (optional)
            if (this.eventEmitter) {
                console.log(`🔍 [DEBUG] Emitting company:identified event`);
                this.eventEmitter.emit('company:identified', { companyId, whatsappNumber: cleanNumber });
            }
            
            console.log(`🔍 [DEBUG] Returning companyId: ${companyId}`);
            return companyId;
        }
        
        console.log(`⚠️ No company found for WhatsApp number: ${cleanNumber}`);
        console.log(`🔍 [DEBUG] Response structure:`, {
            success: response.data?.success,
            hasData: !!response.data?.data,
            hasId: !!response.data?.data?._id,
            data: response.data
        });
        console.log(`🔍 [DEBUG] Returning null - no company found`);
        return null;
        
    } catch (error) {
        console.error('❌ Failed to identify company from WhatsApp number:', {
            whatsappNumber,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        
        console.log(`🔍 [DEBUG] Error details:`, {
            message: error.message,
            stack: error.stack,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'No response'
        });
        
        // Return null but don't throw - let the calling code handle it
        console.log(`🔍 [DEBUG] Returning null due to error`);
        return null;
    } finally {
        console.log('🔍'.repeat(30));
        console.log('🔍 [DEBUG] ===== identifyCompanyFromWhatsApp FINISHED =====');
        console.log(`🔍 [DEBUG] Final this.companyId: "${this.companyId || 'null'}"`);
        console.log('🔍'.repeat(30) + '\n');
    }
}

    /**
     * Get current company ID
     * @returns {string|null} Current company ID
     */
    getCompanyId() {
        return this.companyId || this.currentCompanyId || null;
    }

    /**
     * Set company ID manually (for testing or admin override)
     * @param {string} companyId - Company ID to set
     * @param {boolean} persistHeaders - Whether to set default headers
     */
    setCompanyId(companyId, persistHeaders = true) {
        if (!companyId) {
            console.warn('⚠️ Attempted to set null/undefined company ID');
            return false;
        }
        
        this.companyId = companyId;
        this.currentCompanyId = companyId;
        
        if (persistHeaders) {
            this.client.defaults.headers.common['x-company-id'] = companyId;
            console.log(`✅ Company ID set manually and headers configured: ${companyId}`);
        } else {
            console.log(`✅ Company ID set manually (headers not persisted): ${companyId}`);
        }
        
        return true;
    }

    /**
     * Clear company context (e.g., when switching WhatsApp numbers or logging out)
     */
    clearCompanyContext() {
        this.companyId = null;
        this.currentCompanyId = null;
        delete this.client.defaults.headers.common['x-company-id'];
        console.log('🧹 Company context cleared from API service');
    }

    /**
     * Validate that current company context matches expected company
     * @param {string} expectedCompanyId - Expected company ID
     * @returns {boolean} True if matches or no context set
     */
    validateCompanyContext(expectedCompanyId) {
        if (!expectedCompanyId) {
            console.warn('⚠️ No expected company ID provided for validation');
            return true; // Can't validate, assume OK
        }
        
        const currentId = this.getCompanyId();
        
        if (!currentId) {
            console.warn('⚠️ No company context set, but expected:', expectedCompanyId);
            return false;
        }
        
        const isValid = currentId.toString() === expectedCompanyId.toString();
        
        if (!isValid) {
            console.error('❌ Company context mismatch!', {
                current: currentId,
                expected: expectedCompanyId
            });
        }
        
        return isValid;
    }

    /**
     * Ensure company context for API call
     * @param {Object} options - Request options
     * @param {string} companyId - Optional company ID to override
     * @returns {Object} Updated headers
     */
    ensureCompanyContext(options = {}, companyId = null) {
        const targetCompanyId = companyId || this.getCompanyId();
        
        if (!targetCompanyId) {
            console.warn('⚠️ No company context available for API call');
            return options;
        }
        
        return {
            ...options,
            headers: {
                ...options.headers,
                'x-company-id': targetCompanyId
            }
        };
    }

    /**
     * Make API call with automatic company context
     * @param {string} method - HTTP method
     * @param {string} url - API endpoint
     * @param {Object} data - Request data
     * @param {string} companyId - Optional company ID override
     * @returns {Promise} API response
     */
    async callWithCompanyContext(method, url, data = null, companyId = null) {
        const targetCompanyId = companyId || this.getCompanyId();
        
        const config = {
            method,
            url,
            headers: {}
        };
        
        if (targetCompanyId) {
            config.headers['x-company-id'] = targetCompanyId;
        }
        
        if (data && (method.toLowerCase() === 'post' || method.toLowerCase() === 'put' || method.toLowerCase() === 'patch')) {
            config.data = data;
        }
        
        try {
            const response = await this.client(config);
            return response;
        } catch (error) {
            console.error(`❌ API call failed with company context:`, {
                method,
                url,
                companyId: targetCompanyId,
                error: error.message
            });
            throw error;
        }
    }

    async getPaymentVerificationById(verificationId, companyId = null) {
        try {
            if (!verificationId) {
                throw new Error('Verification ID is required');
            }

            let url = `/api/payments/verify?id=${verificationId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Get payment verification error:', error.message);
            return null;
        }
    }

    async getPaymentVerificationByOrderNumber(orderNumber, companyId = null) {
        try {
            if (!orderNumber) {
                throw new Error('Order number is required');
            }

            let url = `/api/payments/verify?orderNumber=${orderNumber}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Get verification by order error:', error.message);
            return null;
        }
    }

    async updatePaymentVerificationStatus(verificationId, updateData) {
        try {
            if (!verificationId || !updateData) {
                throw new Error('Verification ID and update data are required');
            }

            const response = await this.client.patch(`/api/payments/verify?id=${verificationId}`, updateData);
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Update verification status error:', error.message);
            throw new Error('Failed to update payment verification status');
        }
    }

    async rejectPaymentVerification(verificationId, reason, rejectedBy = 'admin', companyId = null) {
        try {
            if (!verificationId || !reason) {
                throw new Error('Verification ID and reason are required');
            }

            let url = `/api/payments/verify?id=${verificationId}&action=reject`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.put(url, {
                reason,
                rejectedBy,
                timestamp: new Date().toISOString()
            });

            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Reject payment verification error:', error.message);
            throw new Error('Failed to reject payment verification');
        }
    }

    async markPaymentAsFraud(verificationId, reasons, markedBy = 'admin', companyId = null) {
        try {
            if (!verificationId || !reasons) {
                throw new Error('Verification ID and reasons are required');
            }

            let url = `/api/payments/verify?id=${verificationId}&action=mark-fraud`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.put(url, {
                reasons: Array.isArray(reasons) ? reasons : [reasons],
                markedBy,
                timestamp: new Date().toISOString()
            });

            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Mark payment as fraud error:', error.message);
            throw new Error('Failed to mark payment as fraud');
        }
    }

    async getPendingPaymentVerifications(companyId = null) {
        try {
            let url = '/api/payments/verify?status=pending';
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.ensureArray(response.data);

        } catch (error) {
            console.error('❌ Get pending verifications error:', error.message);
            return [];
        }
    }

    async getPaymentVerificationsByStatus(status = 'pending', companyId = null) {
        try {
            let url = `/api/payments/verify?status=${status}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.ensureArray(response.data);

        } catch (error) {
            console.error('❌ Get verifications by status error:', error.message);
            return [];
        }
    }

    // ========== ORDER APIS WITH COMPANY CONTEXT ==========

    async createOrder(orderData) {
        try {
            if (!orderData.orderNumber || !orderData.phoneNumber || !orderData.items) {
                throw new Error('Missing required order fields');
            }

            // Format order data with enhanced schema fields and company context
            const formattedOrderData = {
                // ✅ CRITICAL: Company context for multi-tenancy
                companyId: orderData.companyId || 'default',
                
                orderNumber: orderData.orderNumber,
                customerName: orderData.customerName || '',
                customerEmail: orderData.customerEmail || '',
                phoneNumber: this.cleanPhoneNumber(orderData.phoneNumber),
                secondaryPhoneNumber: orderData.secondaryPhoneNumber ? this.cleanPhoneNumber(orderData.secondaryPhoneNumber) : null,
                // ✅ WhatsApp number for customer identification
                whatsappNumber: orderData.whatsappNumber ? this.cleanPhoneNumber(orderData.whatsappNumber) : null,
                shippingAddress: orderData.shippingAddress || {
                    street: orderData.shippingAddress || orderData.address || '',
                    city: orderData.city || '',
                    state: orderData.state || '',
                    pincode: orderData.pincode || '',
                    country: 'India'
                },
                billingAddress: orderData.billingAddress || orderData.shippingAddress,
                sameAsShipping: orderData.sameAsShipping !== false,
                paymentMethod: orderData.paymentMethod || 'upi',
                gstType: orderData.gstType || 'intra-state',
                items: (orderData.items || []).map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: this.safeNumber(item.quantity, 1),
                    mrp: this.safeNumber(item.mrp),
                    discountPrice: this.safeNumber(item.discountPrice),
                    price: this.safeNumber(item.price),
                    gstRate: this.safeNumber(item.gstRate, 18),
                    gstIncluded: item.gstIncluded !== false,
                    gstAmount: this.safeNumber(item.gstAmount),
                    totalAmount: this.safeNumber(item.quantity) * this.safeNumber(item.price),
                    sku: item.sku || '',
                    hsnCode: item.hsnCode || ''
                })),
                subtotal: this.safeNumber(orderData.subtotal),
                totalDiscount: this.safeNumber(orderData.totalDiscount),
                totalGst: this.safeNumber(orderData.totalGst),
                shippingCharge: this.safeNumber(orderData.shippingCharge),
                totalPrice: this.safeNumber(orderData.totalPrice),
                paidAmount: this.safeNumber(orderData.paidAmount, 0),
                balanceAmount: this.safeNumber(orderData.totalPrice) - this.safeNumber(orderData.paidAmount, 0),
                paymentStatus: orderData.paymentStatus || 'pending',
                status: orderData.status || 'pending',
                orderNotes: orderData.orderNotes || '',
                deliveryDate: orderData.deliveryDate || null,
                deliverySlot: orderData.deliverySlot || null,
                createdBy: orderData.createdBy || 'whatsapp'
            };

            console.log('📦 Creating order with company context:', {
                orderNumber: formattedOrderData.orderNumber,
                companyId: formattedOrderData.companyId,
                customerName: formattedOrderData.customerName,
                whatsappNumber: formattedOrderData.whatsappNumber,
                totalPrice: formattedOrderData.totalPrice
            });

            const response = await this.client.post('/api/orders', formattedOrderData);
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Create Order', error);
            throw new Error('Failed to create order: ' + (error.response?.data?.message || error.message));
        }
    }

    async getCustomerOrders(identifier, companyId = null) {
        try {
            if (!identifier) {
                return [];
            }

            const cleanIdentifier = this.cleanPhoneNumber(identifier);
            if (cleanIdentifier.length < 10) {
                return [];
            }

            console.log(`📞 Fetching orders for identifier: ${cleanIdentifier} company: ${companyId || 'any'}`);
            
            // ✅ Search by BOTH phoneNumber and whatsappNumber with company filter
            let url = `/api/orders?search=${cleanIdentifier}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            
            // Log the response for debugging
            console.log(`📊 Found ${response.data?.data?.length || 0} orders`);
            
            return this.ensureArray(response.data);
        } catch (error) {
            this.handleApiError('Get Customer Orders', error);
            return [];
        }
    }

    async getPendingOrdersByPhone(phoneNumber, companyId = null) {
        try {
            if (!phoneNumber) {
                return [];
            }

            const cleanPhone = this.cleanPhoneNumber(phoneNumber);
            if (cleanPhone.length < 10) {
                return [];
            }

            console.log(`📞 Fetching pending orders for: ${cleanPhone} company: ${companyId || 'any'}`);
            
            const allOrders = await this.getCustomerOrders(cleanPhone, companyId);
            
            const pendingOrders = allOrders.filter(order => 
                order.paymentStatus === 'pending' || 
                order.paymentStatus === 'partial' ||
                (order.status === 'pending' && order.paymentStatus !== 'paid')
            );

            console.log(`📦 Found ${pendingOrders.length} pending orders for ${cleanPhone}`);
            return pendingOrders;
        } catch (error) {
            this.handleApiError('Get Pending Orders By Phone', error);
            return [];
        }
    }

    async getOrderById(orderId, companyId = null) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            let url = `/api/orders?id=${orderId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            const order = this.extractData(response.data);
            
            if (!order) {
                throw new Error('Order not found in response');
            }

            return order;
        } catch (error) {
            this.handleApiError('Get Order', error);
            
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch order');
        }
    }

    async getOrderByNumber(orderNumber, companyId = null) {
        try {
            if (!orderNumber) {
                throw new Error('Order number is required');
            }

            let url = `/api/orders?orderNumber=${orderNumber}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            const order = this.extractData(response.data);
            
            return order || null;
        } catch (error) {
            this.handleApiError('Get Order By Number', error);
            return null;
        }
    }

    async updateOrderStatus(orderId, status, comment = '', companyId = null) {
        try {
            if (!orderId || !status) {
                throw new Error('Order ID and status are required');
            }

            let url = `/api/orders?id=${orderId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, { 
                status,
                statusComment: comment,
                statusHistory: [{
                    status,
                    timestamp: new Date().toISOString(),
                    comment,
                    updatedBy: 'system'
                }]
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Update Order Status', error);
            throw new Error('Failed to update order status');
        }
    }

    /**
     * CRITICAL METHOD: Update order payment status with company validation
     * Used when payment verification succeeds
     */
    async updateOrderPaymentStatus(orderNumber, paymentData, companyId = null) {
        try {
            if (!orderNumber) {
                throw new Error('Order number is required');
            }

            console.log(`💰 Updating payment status for order: ${orderNumber} company: ${companyId || 'any'}`, paymentData);

            // First get the order by order number to get its ID
            const order = await this.getOrderByNumber(orderNumber, companyId);
            
            if (!order) {
                throw new Error(`Order ${orderNumber} not found`);
            }

            // Verify order belongs to the correct company
            if (companyId && order.companyId && order.companyId.toString() !== companyId.toString()) {
                throw new Error(`Order ${orderNumber} does not belong to company ${companyId}`);
            }

            // Prepare update data
            const updatePayload = {
                paymentStatus: paymentData.paymentStatus || 'paid',
                paidAmount: this.safeNumber(paymentData.paidAmount) || this.safeNumber(paymentData.amount) || order.totalPrice,
                balanceAmount: 0,
                transactionId: paymentData.transactionId || order.transactionId,
                paymentMethod: paymentData.paymentMethod || order.paymentMethod || 'upi',
                statusHistory: [{
                    status: 'confirmed',
                    timestamp: new Date().toISOString(),
                    comment: `Payment verified automatically. Transaction: ${paymentData.transactionId || 'N/A'}`,
                    updatedBy: paymentData.verifiedBy || 'auto_ocr'
                }]
            };

            // Use the PUT endpoint with payment-verified action
            let url = `/api/orders?id=${order._id}&action=payment-verified`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.put(url, updatePayload);
            
            console.log(`✅ Order ${orderNumber} payment status updated to PAID for company ${companyId || order.companyId}`);
            return this.extractData(response.data);

        } catch (error) {
            this.handleApiError('Update Order Payment Status', error);
            throw new Error('Failed to update order payment status: ' + (error.message || 'Unknown error'));
        }
    }

    // ========== PRODUCT APIS WITH COMPANY CONTEXT ==========

    async getProducts(companyId = null) {
        try {
            let url = '/api/products?isActive=true';
            if (companyId) {
                url += `&companyId=${companyId}`;
                console.log(`🔍 Fetching products for company: ${companyId}`);
            }

            const response = await this.client.get(url);
            const products = this.ensureArray(response.data);
            
            // Format products with computed fields and ensure category consistency
            return products.map(product => {
                // ✅ SAFELY extract category information
                let categoryName = '';
                let categoryId = null;
                
                if (product.category) {
                    if (typeof product.category === 'string') {
                        categoryName = product.category;
                        categoryId = product.category;
                    } else if (typeof product.category === 'object') {
                        categoryName = product.category.name || '';
                        categoryId = product.category._id || null;
                    }
                }
                
                // ✅ SAFELY extract subCategory information
                let subCategoryName = '';
                let subCategoryId = null;
                
                if (product.subCategory) {
                    if (typeof product.subCategory === 'string') {
                        subCategoryName = product.subCategory;
                        subCategoryId = product.subCategory;
                    } else if (typeof product.subCategory === 'object') {
                        subCategoryName = product.subCategory.name || '';
                        subCategoryId = product.subCategory._id || null;
                    }
                }
                
                return {
                    ...product,
                    // ✅ Computed fields
                    displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
                    inStock: this.safeNumber(product.stock) > 0,
                    discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
                        ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
                        : 0,
                    
                    // ✅ Category in multiple formats for maximum compatibility
                    category: product.category, // Keep original
                    categoryName: categoryName, // String version for search
                    categoryId: categoryId,     // ID version for reference
                    
                    // ✅ SubCategory in multiple formats
                    subCategory: product.subCategory, // Keep original
                    subCategoryName: subCategoryName, // String version
                    subCategoryId: subCategoryId,     // ID version
                    
                    // ✅ Ensure all string fields are actually strings
                    productName: String(product.productName || ''),
                    description: String(product.description || ''),
                    shortDescription: String(product.shortDescription || ''),
                    sku: String(product.sku || ''),
                    hsnCode: String(product.hsnCode || ''),
                    brand: String(product.brand || '')
                };
            });
        } catch (error) {
            this.handleApiError('Get Products', error);
            return [];
        }
    }

    async getProductById(productId, companyId = null) {
        try {
            if (!productId || productId.length !== 24) {
                throw new Error('Invalid product ID format');
            }

            let url = `/api/products?id=${productId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            console.log('🔍 Product by ID response:', response.data);
            
            const product = this.extractData(response.data);
            
            if (!product) {
                throw new Error('Product not found in response');
            }

            // Format with computed fields
            return {
                ...product,
                displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
                inStock: this.safeNumber(product.stock) > 0,
                discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
                    ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
                    : 0
            };
        } catch (error) {
            this.handleApiError('Get Product', error);
            
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch product');
        }
    }

    async searchProducts(query, companyId = null) {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            let url = `/api/products?search=${encodeURIComponent(query.trim())}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            const products = this.ensureArray(response.data);
            
            return products.map(product => ({
                ...product,
                displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
                inStock: this.safeNumber(product.stock) > 0
            }));
        } catch (error) {
            this.handleApiError('Search Products', error);
            return [];
        }
    }

    async getAllActiveProducts(companyId = null) {
        try {
            let url = '/api/products?isActive=true';
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            const products = this.ensureArray(response.data);
            
            return products.filter(p => p.isActive).map(product => ({
                ...product,
                displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
                inStock: this.safeNumber(product.stock) > 0
            }));
        } catch (error) {
            this.handleApiError('Get All Active Products', error);
            return [];
        }
    }

    async getProductsByCategory(category, companyId = null) {
        try {
            if (!category) {
                return [];
            }

            let url = `/api/products?category=${encodeURIComponent(category)}&isActive=true`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            const products = this.ensureArray(response.data);
            
            return products.map(product => ({
                ...product,
                displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
                inStock: this.safeNumber(product.stock) > 0
            }));
        } catch (error) {
            this.handleApiError('Get Products By Category', error);
            return [];
        }
    }

    // ========== IMAGE URL HANDLING ==========

    getProductImageUrl(imagePath) {
        if (!imagePath) {
            return null;
        }

        const baseUrl = process.env.NEXTJS_BASE_URL || 'http://localhost:3000';
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('/uploads/')) {
            return `${baseUrl}${imagePath}`;
        }
        
        if (imagePath.startsWith('/')) {
            return `${baseUrl}${imagePath}`;
        }
        
        return `${baseUrl}/uploads/${imagePath}`;
    }

    async validateImageUrl(imageUrl) {
        try {
            if (!imageUrl) return false;
            
            const fullUrl = this.getProductImageUrl(imageUrl);
            const response = await axios.head(fullUrl, { timeout: 5000 });
            
            return response.status === 200;
        } catch (error) {
            console.error('❌ Image URL validation failed:', imageUrl, error.message);
            return false;
        }
    }

    // ========== PRODUCT MANAGEMENT ==========

    async updateProductStock(productId, newStock, companyId = null) {
        try {
            if (!productId || newStock === undefined) {
                throw new Error('Product ID and stock are required');
            }

            let url = `/api/products?id=${productId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, { 
                stock: this.safeNumber(newStock) 
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Update Product Stock', error);
            throw new Error('Failed to update product stock');
        }
    }

    // ========== ORDER MANAGEMENT WITH COMPANY CONTEXT ==========

    async getOrdersByStatus(status = 'all', companyId = null) {
        try {
            let url = `/api/orders?status=${status}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.ensureArray(response.data);
        } catch (error) {
            this.handleApiError('Get Orders by Status', error);
            return [];
        }
    }

    async getPendingOrderByPhone(phoneNumber, companyId = null) {
        try {
            const pendingOrders = await this.getPendingOrdersByPhone(phoneNumber, companyId);
            return pendingOrders.length > 0 ? pendingOrders[0] : null;
        } catch (error) {
            this.handleApiError('Get Pending Order By Phone', error);
            return null;
        }
    }

    async cancelOrder(orderId, reason = 'Customer request', companyId = null) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            let url = `/api/orders?id=${orderId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, { 
                status: 'cancelled',
                cancellationReason: reason,
                statusComment: `Order cancelled: ${reason}`
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Cancel Order', error);
            throw new Error('Failed to cancel order');
        }
    }

    async shipOrder(orderId, trackingNumber = '', companyId = null) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            let url = `/api/orders?id=${orderId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, { 
                status: 'shipped',
                trackingNumber: trackingNumber,
                statusComment: `Order shipped with tracking: ${trackingNumber || 'N/A'}`
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Ship Order', error);
            throw new Error('Failed to update order as shipped');
        }
    }

    async deliverOrder(orderId, companyId = null) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            let url = `/api/orders?id=${orderId}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.patch(url, { 
                status: 'delivered',
                statusComment: 'Order delivered successfully'
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Deliver Order', error);
            throw new Error('Failed to update order as delivered');
        }
    }

    // ========== PAYMENT APIS WITH COMPANY CONTEXT ==========

    async rejectPayment(rejectionData) {
        try {
            if (!rejectionData.orderNumber) {
                throw new Error('Order number is required for payment rejection');
            }

            const response = await this.client.post('/api/payments/reject', {
                orderNumber: rejectionData.orderNumber,
                reason: rejectionData.reason || 'Payment verification failed',
                rejectedBy: rejectionData.rejectedBy || 'system',
                companyId: rejectionData.companyId || 'default',
                timestamp: new Date().toISOString()
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Reject Payment', error);
            throw new Error('Payment rejection failed');
        }
    }

    async getPendingPayments(companyId = null) {
        try {
            let url = '/api/payments/verify?status=pending';
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.ensureArray(response.data);
        } catch (error) {
            this.handleApiError('Get Pending Payments', error);
            return [];
        }
    }

    // ========== ANALYTICS AND REPORTING WITH COMPANY CONTEXT ==========

    async getOrderStats(timeframe = 'month', companyId = null) {
        try {
            let url = `/api/analytics/orders?timeframe=${timeframe}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Get Order Stats', error);
            return {
                totalOrders: 0,
                totalRevenue: 0,
                totalPaid: 0,
                totalPending: 0,
                pendingOrders: 0,
                completedOrders: 0
            };
        }
    }

    async getProductStats(companyId = null) {
        try {
            let url = '/api/analytics/products';
            if (companyId) {
                url += `?companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Get Product Stats', error);
            return {
                totalProducts: 0,
                activeProducts: 0,
                lowStockProducts: 0,
                outOfStockProducts: 0,
                totalInventoryValue: 0
            };
        }
    }

    async getPaymentVerificationStats(timeframe = 'week', companyId = null) {
        try {
            let url = `/api/analytics/payments?timeframe=${timeframe}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }

            const response = await this.client.get(url);
            return this.extractData(response.data) || {
                total: 0,
                verified: 0,
                pending: 0,
                rejected: 0,
                fraud: 0,
                autoVerified: 0,
                manualVerified: 0
            };
        } catch (error) {
            this.handleApiError('Get Payment Verification Stats', error);
            return {
                total: 0,
                verified: 0,
                pending: 0,
                rejected: 0,
                fraud: 0,
                autoVerified: 0,
                manualVerified: 0
            };
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await this.client.get('/api/health');
            return {
                status: 'healthy',
                data: response.data
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async testConnection() {
        try {
            const response = await this.client.get('/api/health');
            console.log('🔗 API Connection Test:', {
                status: response.status,
                data: response.data
            });
            return true;
        } catch (error) {
            console.error('🔗 API Connection Failed:', error.message);
            return false;
        }
    }

    // ========== FCM TOKEN MANAGEMENT APIS WITH COMPANY CONTEXT ==========

    async saveFCMToken(tokenData) {
        try {
            console.log('📱 Saving FCM token for admin device:', {
                deviceType: tokenData.deviceInfo?.deviceType,
                companyId: tokenData.companyId,
                tokenPreview: tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token'
            });

            if (!tokenData.token) {
                throw new Error('FCM token is required');
            }

            const response = await this.client.post('/api/auth/fcm-token', tokenData);
            
            console.log('✅ FCM token saved successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Save FCM token error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            if (error.response?.status === 401) {
                throw new Error('Unauthorized: Admin login required');
            }
            throw new Error('Failed to save FCM token: ' + (error.message || 'Unknown error'));
        }
    }

    async deleteFCMToken(token, companyId = null) {
        try {
            console.log('🗑️ Deleting FCM token:', token ? token.substring(0, 20) + '...' : 'No token');

            if (!token) {
                throw new Error('FCM token is required');
            }

            const data = { token };
            if (companyId) {
                data.companyId = companyId;
            }

            const response = await this.client.delete('/api/auth/fcm-token', {
                data
            });
            
            console.log('✅ FCM token deleted successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Delete FCM token error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getAdminFCMTokens(companyId = null) {
        try {
            console.log(`📱 Fetching admin FCM tokens for company: ${companyId || 'all'}`);
            
            let url = '/api/auth/fcm-token?adminOnly=true';
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            const result = this.extractData(response.data);
            
            console.log(`✅ Found ${result.tokens?.length || 0} FCM tokens for company ${companyId || 'all'}`);
            return result;

        } catch (error) {
            console.error('❌ Get FCM tokens error:', error.message);
            return { tokens: [], count: 0 };
        }
    }

    async sendTestNotificationToAdmin(notificationData = {}, companyId = null) {
        try {
            console.log(`🧪 Sending test notification to admin devices for company: ${companyId || 'all'}`);
            
            const payload = {
                title: notificationData.title || 'Test Notification',
                body: notificationData.body || 'This is a test notification',
                type: notificationData.type || 'test',
                priority: notificationData.priority || 'normal',
                data: {
                    ...notificationData.data,
                    companyId: companyId
                },
                timestamp: new Date().toISOString()
            };

            if (companyId) {
                payload.companyId = companyId;
            }
            
            const response = await this.client.post('/api/admin/notifications/test', payload);
            
            console.log('✅ Test notification sent successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Send test notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getAdminNotificationStats(timeframe = 'day', companyId = null) {
        try {
            console.log('📊 Fetching admin notification statistics');
            
            let url = `/api/admin/notifications/stats?timeframe=${timeframe}`;
            if (companyId) {
                url += `&companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Get notification stats error:', error.message);
            return {
                totalSent: 0,
                successful: 0,
                failed: 0,
                timeframe
            };
        }
    }

    async updateNotificationSettings(settings, companyId = null) {
        try {
            console.log(`⚙️ Updating admin notification settings for company: ${companyId || 'all'}`);
            
            const payload = { ...settings };
            if (companyId) {
                payload.companyId = companyId;
            }
            
            const response = await this.client.patch('/api/admin/notifications/settings', payload);
            
            console.log('✅ Notification settings updated successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Update notification settings error:', error.message);
            throw new Error('Failed to update notification settings: ' + error.message);
        }
    }

    async getNotificationSettings(companyId = null) {
        try {
            console.log(`⚙️ Fetching admin notification settings for company: ${companyId || 'all'}`);
            
            let url = '/api/admin/notifications/settings';
            if (companyId) {
                url += `?companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            const result = this.extractData(response.data);
            
            return result || {
                pushNotifications: { enabled: true },
                notificationTypes: {
                    newOrders: { enabled: true, priority: 'high' },
                    payments: { enabled: true, priority: 'high' },
                    lowStock: { enabled: true, priority: 'normal' },
                    systemAlerts: { enabled: true, priority: 'high' }
                },
                quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
            };

        } catch (error) {
            console.error('❌ Get notification settings error:', error.message);
            return {
                pushNotifications: { enabled: true },
                notificationTypes: {
                    newOrders: { enabled: true, priority: 'high' },
                    payments: { enabled: true, priority: 'high' },
                    lowStock: { enabled: true, priority: 'normal' },
                    systemAlerts: { enabled: true, priority: 'high' }
                },
                quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
            };
        }
    }

    // ========== NOTIFICATION TRIGGER APIS WITH COMPANY CONTEXT ==========

    async sendNotificationToDashboard(notificationData) {
        try {
            console.log('📤 Sending notification to dashboard:', {
                type: notificationData.type,
                companyId: notificationData.companyId,
                orderNumber: notificationData.data?.orderNumber
            });

            const payload = {
                type: notificationData.type || 'INFO',
                priority: notificationData.priority || 'normal',
                title: notificationData.title || '',
                message: notificationData.message || '',
                data: {
                    ...notificationData.data,
                    timestamp: new Date().toISOString()
                },
                forAdmin: notificationData.forAdmin !== false
            };

            if (notificationData.companyId) {
                payload.companyId = notificationData.companyId;
            }

            const response = await this.client.post('/api/notifications', payload, {
                headers: {
                    'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Dashboard notification sent successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Dashboard notification error:', {
                message: error.message,
                status: error.response?.status,
                url: error.config?.url
            });
            
            if (error.response?.status === 404) {
                console.warn('⚠️ /api/notifications endpoint returned 404, using fallback');
                
                return {
                    success: true,
                    message: 'Notification processed (fallback mode)',
                    notification: notificationData,
                    fallback: true,
                    timestamp: new Date().toISOString()
                };
            }
            
            return { 
                success: false, 
                error: error.message,
                statusCode: error.response?.status 
            };
        }
    }

    async sendPaymentNotification(paymentData) {
        try {
            console.log('💰 Sending payment notification via API:', {
                orderNumber: paymentData.orderNumber,
                amount: paymentData.amount,
                companyId: paymentData.companyId
            });

            const payload = {
                type: 'PAYMENT_RECEIVED',
                priority: 'high',
                title: 'Payment Received',
                message: `Payment of ₹${this.safeToFixed(paymentData.amount)} received for order #${paymentData.orderNumber}`,
                data: {
                    orderNumber: paymentData.orderNumber || '',
                    amount: this.safeNumber(paymentData.amount),
                    customerName: paymentData.customerName || '',
                    customerPhone: this.cleanPhoneNumber(paymentData.customerPhone || ''),
                    paymentMethod: paymentData.paymentMethod || 'upi',
                    transactionId: paymentData.transactionId || '',
                    confidence: this.safeNumber(paymentData.confidence, 1),
                    verifiedBy: paymentData.verifiedBy || 'auto_ocr',
                    companyId: paymentData.companyId || 'default',
                    timestamp: new Date().toISOString()
                },
                forAdmin: true
            };

            if (paymentData.companyId) {
                payload.companyId = paymentData.companyId;
            }

            const response = await this.client.post('/api/notifications', payload, {
                headers: {
                    'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
                }
            });
            
            console.log('✅ Payment notification sent successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Send payment notification API error:', error.message);
            return { 
                success: false, 
                error: error.message,
                statusCode: error.response?.status 
            };
        }
    }

    async sendInvoiceNotification(invoiceData) {
        try {
            console.log('📄 Sending invoice notification via API:', {
                orderNumber: invoiceData.orderNumber,
                companyId: invoiceData.companyId
            });

            const payload = {
                type: 'INVOICE_GENERATED',
                priority: 'normal',
                title: 'Invoice Generated',
                message: `Invoice generated for order #${invoiceData.orderNumber}`,
                data: {
                    orderNumber: invoiceData.orderNumber || '',
                    customerPhone: this.cleanPhoneNumber(invoiceData.customerPhone || ''),
                    amount: this.safeNumber(invoiceData.amount),
                    invoiceUrl: invoiceData.invoiceUrl || '',
                    invoiceGeneratedAt: invoiceData.invoiceGeneratedAt || new Date().toISOString(),
                    companyId: invoiceData.companyId || 'default',
                    timestamp: new Date().toISOString()
                },
                forAdmin: true
            };

            if (invoiceData.companyId) {
                payload.companyId = invoiceData.companyId;
            }

            const response = await this.client.post('/api/notifications', payload, {
                headers: {
                    'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
                }
            });
            
            console.log('✅ Invoice notification sent successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Send invoice notification API error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async triggerNewOrderNotification(orderData) {
        try {
            console.log('🛍️ Triggering new order notification:', {
                orderNumber: orderData.orderNumber,
                companyId: orderData.companyId
            });
            
            const payload = {
                ...orderData,
                companyId: orderData.companyId || 'default',
                timestamp: new Date().toISOString()
            };
            
            const response = await this.client.post('/api/admin/notifications/trigger/new-order', payload);
            
            console.log('✅ New order notification triggered');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Trigger new order notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async triggerPaymentNotification(paymentData) {
        try {
            console.log('💰 Triggering payment notification:', {
                orderNumber: paymentData.orderNumber,
                companyId: paymentData.companyId
            });
            
            const payload = {
                ...paymentData,
                amount: this.safeNumber(paymentData.amount),
                companyId: paymentData.companyId || 'default',
                timestamp: new Date().toISOString()
            };
            
            const response = await this.client.post('/api/admin/notifications/trigger/payment', payload);
            
            console.log('✅ Payment notification triggered');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Trigger payment notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async triggerLowStockNotification(stockData) {
        try {
            console.log('📉 Triggering low stock notification:', {
                productName: stockData.productName,
                companyId: stockData.companyId
            });
            
            const payload = {
                ...stockData,
                currentStock: this.safeNumber(stockData.currentStock),
                threshold: this.safeNumber(stockData.threshold),
                companyId: stockData.companyId || 'default',
                timestamp: new Date().toISOString()
            };
            
            const response = await this.client.post('/api/admin/notifications/trigger/low-stock', payload);
            
            console.log('✅ Low stock notification triggered');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Trigger low stock notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async checkFCMConnectivity(companyId = null) {
        try {
            console.log(`🔗 Checking FCM connectivity for company: ${companyId || 'all'}`);
            
            let url = '/api/admin/notifications/health';
            if (companyId) {
                url += `?companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ FCM connectivity check failed:', error.message);
            return {
                success: false,
                message: 'FCM connectivity check failed',
                error: error.message
            };
        }
    }

    async getActiveAdminDevices(companyId = null) {
        try {
            console.log(`📱 Fetching active admin devices for company: ${companyId || 'all'}`);
            
            let url = '/api/admin/devices/active';
            if (companyId) {
                url += `?companyId=${companyId}`;
            }
            
            const response = await this.client.get(url);
            const result = this.extractData(response.data);
            
            console.log(`✅ Found ${result.devices?.length || 0} active devices`);
            return result;

        } catch (error) {
            console.error('❌ Get active devices error:', error.message);
            return { devices: [], count: 0 };
        }
    }

    // ========== COMPATIBILITY METHODS ==========

    async verifyPayment(paymentData) {
        console.log('⚠️ DEPRECATED: verifyPayment called, using createPaymentVerification instead');
        try {
            const verificationData = {
                orderNumber: paymentData.orderNumber,
                customerPhone: paymentData.customerPhone || paymentData.phoneNumber,
                orderReference: paymentData.orderId || paymentData.orderReference,
                companyId: paymentData.companyId || 'default',
                orderDetails: {
                    totalAmount: paymentData.amount,
                    items: paymentData.items || []
                },
                paymentProof: paymentData.paymentProof || {},
                detectedPayment: {
                    amount: paymentData.amount,
                    status: 'success',
                    confidence: 1
                }
            };

            return await this.createPaymentVerification(verificationData);
            
        } catch (error) {
            console.error('❌ verifyPayment (compat) error:', error.message);
            throw new Error('Payment verification failed: ' + error.message);
        }
    }

    async saveTokenToBackend(token, deviceInfo = {}, companyId = null) {
        return await this.saveFCMToken({
            token,
            companyId: companyId || 'default',
            deviceInfo: {
                userAgent: deviceInfo.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
                platform: deviceInfo.platform || (typeof navigator !== 'undefined' ? navigator.platform : ''),
                deviceName: deviceInfo.deviceName || this.getDeviceName(),
                deviceType: deviceInfo.deviceType || this.getDeviceType(),
                os: deviceInfo.os || this.getOS(),
                browser: deviceInfo.browser || this.getBrowser(),
                screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
                ipAddress: deviceInfo.ipAddress || '',
                timestamp: new Date().toISOString(),
                ...deviceInfo
            }
        });
    }

    // Helper methods for device detection
    getDeviceName() {
        if (typeof navigator === 'undefined') return 'Server';
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'Mobile Device';
        if (/tablet/i.test(ua)) return 'Tablet';
        if (/mac/i.test(ua)) return 'Mac';
        if (/windows/i.test(ua)) return 'Windows PC';
        if (/linux/i.test(ua)) return 'Linux PC';
        return 'Unknown Device';
    }

    getDeviceType() {
        if (typeof navigator === 'undefined') return 'server';
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'mobile';
        if (/tablet/i.test(ua)) return 'tablet';
        return 'desktop';
    }

    getOS() {
        if (typeof navigator === 'undefined') return 'Server';
        const ua = navigator.userAgent;
        if (/windows/i.test(ua)) return 'Windows';
        if (/mac/i.test(ua)) return 'macOS';
        if (/linux/i.test(ua)) return 'Linux';
        if (/android/i.test(ua)) return 'Android';
        if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
        return 'Unknown OS';
    }

    getBrowser() {
        if (typeof navigator === 'undefined') return 'Server';
        const ua = navigator.userAgent;
        if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
        if (/firefox/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
        if (/edg/i.test(ua)) return 'Edge';
        if (/opera|opr/i.test(ua)) return 'Opera';
        return 'Unknown Browser';
    }
}


// Create and export singleton instance
const apiService = new ApiService();
export default apiService;