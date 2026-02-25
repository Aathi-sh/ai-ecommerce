


// // services/apiService.js - COMPLETE FIXED VERSION




// import axios from 'axios';

// class ApiService {
//     constructor() {
//         this.baseURL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
//         this.client = axios.create({
//             baseURL: this.baseURL,
//             timeout: 30000, // Increased timeout for payment processing
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         });

//         // Add request interceptor for logging
//         this.client.interceptors.request.use(
//             (config) => {
//                 console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
//                 if (config.data && config.method === 'POST') {
//                     console.log('📦 Request Data:', {
//                         orderNumber: config.data.orderNumber,
//                         customerPhone: config.data.customerPhone,
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

//     // ========== PAYMENT VERIFICATION APIS ==========

//     async createPaymentVerification(verificationData) {
//         try {
//             console.log('🔍 Creating payment verification:', {
//                 orderNumber: verificationData.orderNumber,
//                 customerPhone: verificationData.customerPhone
//             });

//             if (!verificationData.orderNumber || !verificationData.customerPhone) {
//                 throw new Error('Order number and customer phone are required');
//             }

//             // Clean up large data if present to avoid payload issues
//             const safeVerificationData = {
//                 ...verificationData,
//                 paymentProof: verificationData.paymentProof ? {
//                     mimeType: verificationData.paymentProof.mimeType,
//                     // Don't send full image data in logs
//                     imageData: verificationData.paymentProof.imageData ? 
//                         verificationData.paymentProof.imageData.substring(0, 50) + '...' : null
//                 } : {}
//             };

//             console.log('📤 Sending to /api/payments/verify');
//             const response = await this.client.post('/api/payments/verify', verificationData);
            
//             console.log('✅ Payment verification created successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Create payment verification error:', {
//                 status: error.response?.status,
//                 data: error.response?.data,
//                 message: error.message
//             });
            
//             if (error.response?.status === 400) {
//                 throw new Error(`Invalid request: ${error.response.data?.message || 'Bad request'}`);
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
//                 confidenceScore: verificationResult?.confidence,
//                 verifiedBy: 'auto-verification'
//             });

//             console.log('✅ Payment auto-verified successfully');
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Auto-verify error:', error.response?.data || error.message);
//             throw new Error('Failed to auto-verify payment: ' + (error.message || 'Unknown error'));
//         }
//     }

//     async getPaymentVerificationById(verificationId) {
//         try {
//             if (!verificationId) {
//                 throw new Error('Verification ID is required');
//             }

//             const response = await this.client.get(`/api/payments/verify?id=${verificationId}`);
//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Get payment verification error:', error.message);
//             return null;
//         }
//     }

//     async getPaymentVerificationByOrderNumber(orderNumber) {
//         try {
//             if (!orderNumber) {
//                 throw new Error('Order number is required');
//             }

//             const response = await this.client.get(`/api/payments/verify?orderNumber=${orderNumber}`);
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

//     async rejectPaymentVerification(verificationId, reason, rejectedBy = 'admin') {
//         try {
//             if (!verificationId || !reason) {
//                 throw new Error('Verification ID and reason are required');
//             }

//             const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=reject`, {
//                 reason,
//                 rejectedBy
//             });

//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Reject payment verification error:', error.message);
//             throw new Error('Failed to reject payment verification');
//         }
//     }

//     async markPaymentAsFraud(verificationId, reasons, markedBy = 'admin') {
//         try {
//             if (!verificationId || !reasons) {
//                 throw new Error('Verification ID and reasons are required');
//             }

//             const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=mark-fraud`, {
//                 reasons: Array.isArray(reasons) ? reasons : [reasons],
//                 markedBy
//             });

//             return this.extractData(response.data);

//         } catch (error) {
//             console.error('❌ Mark payment as fraud error:', error.message);
//             throw new Error('Failed to mark payment as fraud');
//         }
//     }

//     async getPendingPaymentVerifications() {
//         try {
//             const response = await this.client.get('/api/payments/verify?status=pending');
//             return this.ensureArray(response.data);

//         } catch (error) {
//             console.error('❌ Get pending verifications error:', error.message);
//             return [];
//         }
//     }

//     async getPaymentVerificationsByStatus(status = 'pending') {
//         try {
//             const response = await this.client.get(`/api/payments/verify?status=${status}`);
//             return this.ensureArray(response.data);

//         } catch (error) {
//             console.error('❌ Get verifications by status error:', error.message);
//             return [];
//         }
//     }

//     async sendInvoiceToCustomer(verificationId, sendMethod = 'whatsapp') {
//         try {
//             if (!verificationId) {
//                 throw new Error('Verification ID is required');
//             }

//             // This is a placeholder - implement actual invoice sending
//             console.log(`📧 Invoice sent for verification: ${verificationId} via ${sendMethod}`);
//             return { success: true, message: 'Invoice sent' };

//         } catch (error) {
//             console.error('❌ Send invoice error:', error.message);
//             return { success: false, message: 'Failed to send invoice' };
//         }
//     }

//     async updateOrderPaymentStatus(orderNumber, paymentData) {
//         try {
//             if (!orderNumber) {
//                 throw new Error('Order number is required');
//             }

//             console.log(`💰 Updating order payment status: ${orderNumber}`, paymentData);
            
//             // This is a placeholder - implement actual order update
//             // You should call your order update API here
//             return { success: true, message: 'Order payment status updated' };

//         } catch (error) {
//             console.error('❌ Update order payment status error:', error.message);
//             throw new Error('Failed to update order payment status');
//         }
//     }

//     // ========== COMPATIBILITY METHODS (for existing code) ==========

//     async verifyPayment(paymentData) {
//         console.log('⚠️ DEPRECATED: verifyPayment called, using createPaymentVerification instead');
//         try {
//             // Convert old format to new format
//             const verificationData = {
//                 orderNumber: paymentData.orderNumber,
//                 customerPhone: paymentData.customerPhone || paymentData.phoneNumber,
//                 orderReference: paymentData.orderId || paymentData.orderReference,
//                 orderDetails: paymentData.orderDetails || {
//                     totalAmount: paymentData.amount,
//                     items: paymentData.items || []
//                 },
//                 paymentProof: paymentData.paymentProof || {},
//                 detectedPayment: {
//                     amount: paymentData.amount,
//                     status: 'success'
//                 }
//             };

//             return await this.createPaymentVerification(verificationData);
            
//         } catch (error) {
//             console.error('❌ verifyPayment (compat) error:', error.message);
//             throw new Error('Payment verification failed: ' + error.message);
//         }
//     }

//     // ========== ORDER APIS ==========

//     async createOrder(orderData) {
//         try {
//             if (!orderData.orderNumber || !orderData.phoneNumber || !orderData.items) {
//                 throw new Error('Missing required order fields');
//             }

//             const response = await this.client.post('/api/orders', orderData);
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Create Order', error);
//             throw new Error('Failed to create order: ' + (error.response?.data?.message || error.message));
//         }
//     }

//     async getCustomerOrders(phoneNumber) {
//         try {
//             if (!phoneNumber) {
//                 return [];
//             }

//             const cleanPhone = this.cleanPhoneNumber(phoneNumber);
//             if (cleanPhone.length < 10) {
//                 return [];
//             }

//             console.log(`📞 Fetching orders for customer: ${cleanPhone}`);
//             const response = await this.client.get(`/api/orders?customer=${cleanPhone}`);
            
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Customer Orders', error);
//             return [];
//         }
//     }

//     async getPendingOrdersByPhone(phoneNumber) {
//         try {
//             if (!phoneNumber) {
//                 return [];
//             }

//             const cleanPhone = this.cleanPhoneNumber(phoneNumber);
//             if (cleanPhone.length < 10) {
//                 return [];
//             }

//             console.log(`📞 Fetching pending orders for: ${cleanPhone}`);
            
//             const allOrders = await this.getCustomerOrders(cleanPhone);
            
//             const pendingOrders = allOrders.filter(order => 
//                 order.paymentStatus === 'pending' || 
//                 order.paymentStatus === 'processing' ||
//                 (order.status === 'pending' && order.paymentStatus !== 'paid')
//             );

//             console.log(`📦 Found ${pendingOrders.length} pending orders for ${cleanPhone}`);
//             return pendingOrders;
//         } catch (error) {
//             this.handleApiError('Get Pending Orders By Phone', error);
//             return [];
//         }
//     }

//     async getOrderById(orderId) {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             const response = await this.client.get(`/api/orders?id=${orderId}`);
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

//     async updateOrderStatus(orderId, status) {
//         try {
//             if (!orderId || !status) {
//                 throw new Error('Order ID and status are required');
//             }

//             const response = await this.client.patch(`/api/orders?id=${orderId}`, { status });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Update Order Status', error);
//             throw new Error('Failed to update order status');
//         }
//     }

//     // ========== PRODUCT APIS ==========

//     async getProducts() {
//         try {
//             const response = await this.client.get('/api/products');
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Products', error);
//             return [];
//         }
//     }

//     async getProductById(productId) {
//         try {
//             if (!productId || productId.length !== 24) {
//                 throw new Error('Invalid product ID format');
//             }

//             // Uses query parameter format
//             const response = await this.client.get(`/api/products?id=${productId}`);
//             console.log('🔍 Product by ID response:', response.data);
            
//             const product = this.extractData(response.data);
            
//             if (!product) {
//                 throw new Error('Product not found in response');
//             }

//             return product;
//         } catch (error) {
//             this.handleApiError('Get Product', error);
            
//             // Return null instead of throwing to allow graceful handling
//             if (error.response?.status === 404) {
//                 return null;
//             }
//             throw new Error('Failed to fetch product');
//         }
//     }

//     async searchProducts(query) {
//         try {
//             if (!query || query.trim().length < 2) {
//                 return [];
//             }

//             const response = await this.client.get(`/api/products?search=${encodeURIComponent(query.trim())}`);
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Search Products', error);
//             return [];
//         }
//     }

//     async getAllActiveProducts() {
//         try {
//             const response = await this.client.get('/api/products?isActive=true');
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get All Active Products', error);
//             return [];
//         }
//     }

//     async getProductsByCategory(category) {
//         try {
//             if (!category) {
//                 return [];
//             }

//             const response = await this.client.get(`/api/products?category=${encodeURIComponent(category)}`);
//             return this.ensureArray(response.data);
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
        
//         // If it's already a full URL, return as is
//         if (imagePath.startsWith('http')) {
//             return imagePath;
//         }
        
//         // Handle different image path formats
//         if (imagePath.startsWith('/uploads/')) {
//             return `${baseUrl}${imagePath}`;
//         }
        
//         if (imagePath.startsWith('/')) {
//             return `${baseUrl}${imagePath}`;
//         }
        
//         // Default: assume it's in uploads folder
//         return `${baseUrl}/uploads/${imagePath}`;
//     }

//     // Utility method to validate image URLs
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

//     async updateProductStock(productId, newStock) {
//         try {
//             if (!productId || newStock === undefined) {
//                 throw new Error('Product ID and stock are required');
//             }

//             const response = await this.client.patch(`/api/products?id=${productId}`, { stock: newStock });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Update Product Stock', error);
//             throw new Error('Failed to update product stock');
//         }
//     }

//     // ========== ORDER MANAGEMENT ==========

//     async getOrdersByStatus(status = 'all') {
//         try {
//             const response = await this.client.get(`/api/orders?status=${status}`);
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Orders by Status', error);
//             return [];
//         }
//     }

//     async getPendingOrderByPhone(phoneNumber) {
//         try {
//             const pendingOrders = await this.getPendingOrdersByPhone(phoneNumber);
//             // Return the most recent pending order
//             return pendingOrders.length > 0 ? pendingOrders[0] : null;
//         } catch (error) {
//             this.handleApiError('Get Pending Order By Phone', error);
//             return null;
//         }
//     }

//     async cancelOrder(orderId, reason = 'Customer request') {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
//                 status: 'cancelled',
//                 cancellationReason: reason
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Cancel Order', error);
//             throw new Error('Failed to cancel order');
//         }
//     }

//     async shipOrder(orderId, trackingNumber = '') {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
//                 status: 'shipped',
//                 trackingNumber: trackingNumber,
//                 shippedAt: new Date().toISOString()
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Ship Order', error);
//             throw new Error('Failed to update order as shipped');
//         }
//     }

//     async deliverOrder(orderId) {
//         try {
//             if (!orderId) {
//                 throw new Error('Order ID is required');
//             }

//             const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
//                 status: 'delivered',
//                 deliveredAt: new Date().toISOString()
//             });
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Deliver Order', error);
//             throw new Error('Failed to update order as delivered');
//         }
//     }

//     // ========== PAYMENT APIS ==========

//     async rejectPayment(rejectionData) {
//         try {
//             if (!rejectionData.orderNumber) {
//                 throw new Error('Order number is required for payment rejection');
//             }

//             const response = await this.client.post('/api/payments/reject', rejectionData);
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Reject Payment', error);
//             throw new Error('Payment rejection failed');
//         }
//     }

//     async getPendingPayments() {
//         try {
//             const response = await this.client.get('/api/payments/pending');
//             return this.ensureArray(response.data);
//         } catch (error) {
//             this.handleApiError('Get Pending Payments', error);
//             return [];
//         }
//     }

//     // ========== ANALYTICS AND REPORTING ==========

//     async getOrderStats(timeframe = 'month') {
//         try {
//             const response = await this.client.get(`/api/analytics/orders?timeframe=${timeframe}`);
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Get Order Stats', error);
//             return {
//                 totalOrders: 0,
//                 totalRevenue: 0,
//                 pendingOrders: 0,
//                 completedOrders: 0
//             };
//         }
//     }

//     async getProductStats() {
//         try {
//             const response = await this.client.get('/api/analytics/products');
//             return this.extractData(response.data);
//         } catch (error) {
//             this.handleApiError('Get Product Stats', error);
//             return {
//                 totalProducts: 0,
//                 lowStockProducts: 0,
//                 outOfStockProducts: 0
//             };
//         }
//     }

//     async getPaymentVerificationStats(timeframe = 'week') {
//         try {
//             // You can implement this endpoint later
//             return {
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
        
//         const cleaned = phoneNumber.replace(/\D/g, '');
        
//         let searchPhone = cleaned;
        
//         if (cleaned.length === 12 && cleaned.startsWith('91')) {
//             searchPhone = cleaned.substring(2);
//         }
//         else if (cleaned.length === 11 && cleaned.startsWith('1')) {
//             searchPhone = cleaned.substring(1);
//         }
//         else if (cleaned.length === 10) {
//             searchPhone = cleaned;
//         }
//         else if (phoneNumber.includes('@')) {
//             const numberPart = phoneNumber.split('@')[0];
//             return this.cleanPhoneNumber(numberPart);
//         }

//         return searchPhone;
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

//     // Test API connectivity
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
//     // ========== FCM TOKEN MANAGEMENT APIS ==========

// /**
//  * Save FCM token for admin device
//  */
// async saveFCMToken(tokenData) {
//   try {
//     console.log('📱 Saving FCM token for admin device:', {
//       deviceType: tokenData.deviceInfo?.deviceType,
//       tokenPreview: tokenData.token ? tokenData.token.substring(0, 20) + '...' : 'No token'
//     });

//     if (!tokenData.token) {
//       throw new Error('FCM token is required');
//     }

//     const response = await this.client.post('/api/auth/fcm-token', tokenData);
    
//     console.log('✅ FCM token saved successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Save FCM token error:', {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });
    
//     if (error.response?.status === 401) {
//       throw new Error('Unauthorized: Admin login required');
//     }
//     throw new Error('Failed to save FCM token: ' + (error.message || 'Unknown error'));
//   }
// }

// /**
//  * Delete FCM token (when logging out or token invalid)
//  */
// async deleteFCMToken(token) {
//   try {
//     console.log('🗑️ Deleting FCM token:', token ? token.substring(0, 20) + '...' : 'No token');

//     if (!token) {
//       throw new Error('FCM token is required');
//     }

//     const response = await this.client.delete('/api/auth/fcm-token', {
//       data: { token }
//     });
    
//     console.log('✅ FCM token deleted successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Delete FCM token error:', error.message);
//     // Don't throw error for deletion failures - just log
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Get all FCM tokens for admin (for debugging)
//  */
// async getAdminFCMTokens() {
//   try {
//     console.log('📱 Fetching admin FCM tokens');
    
//     const response = await this.client.get('/api/auth/fcm-token?adminOnly=true');
//     const result = this.extractData(response.data);
    
//     console.log(`✅ Found ${result.tokens?.length || 0} FCM tokens`);
//     return result;

//   } catch (error) {
//     console.error('❌ Get FCM tokens error:', error.message);
//     return { tokens: [], count: 0 };
//   }
// }

// /**
//  * Send test notification to admin devices
//  */
// async sendTestNotificationToAdmin(notificationData = {}) {
//   try {
//     console.log('🧪 Sending test notification to admin devices');
    
//     const response = await this.client.post('/api/admin/notifications/test', {
//       title: notificationData.title || 'Test Notification',
//       body: notificationData.body || 'This is a test notification',
//       ...notificationData
//     });
    
//     console.log('✅ Test notification sent successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Send test notification error:', error.message);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Get admin notification statistics
//  */
// async getAdminNotificationStats(timeframe = 'day') {
//   try {
//     console.log('📊 Fetching admin notification statistics');
    
//     const response = await this.client.get(`/api/admin/notifications/stats?timeframe=${timeframe}`);
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Get notification stats error:', error.message);
//     return {
//       totalSent: 0,
//       successful: 0,
//       failed: 0,
//       timeframe
//     };
//   }
// }

// /**
//  * Update admin notification preferences
//  */
// async updateNotificationSettings(settings) {
//   try {
//     console.log('⚙️ Updating admin notification settings');
    
//     const response = await this.client.patch('/api/admin/notifications/settings', settings);
    
//     console.log('✅ Notification settings updated successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Update notification settings error:', error.message);
//     throw new Error('Failed to update notification settings: ' + error.message);
//   }
// }

// /**
//  * Get admin notification preferences
//  */
// async getNotificationSettings() {
//   try {
//     console.log('⚙️ Fetching admin notification settings');
    
//     const response = await this.client.get('/api/admin/notifications/settings');
//     const result = this.extractData(response.data);
    
//     return result || {
//       pushNotifications: { enabled: true },
//       notificationTypes: {
//         newOrders: { enabled: true, priority: 'high' },
//         payments: { enabled: true, priority: 'high' },
//         lowStock: { enabled: true, priority: 'normal' },
//         systemAlerts: { enabled: true, priority: 'high' }
//       },
//       quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
//     };

//   } catch (error) {
//     console.error('❌ Get notification settings error:', error.message);
//     // Return default settings if API fails
//     return {
//       pushNotifications: { enabled: true },
//       notificationTypes: {
//         newOrders: { enabled: true, priority: 'high' },
//         payments: { enabled: true, priority: 'high' },
//         lowStock: { enabled: true, priority: 'normal' },
//         systemAlerts: { enabled: true, priority: 'high' }
//       },
//       quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }
//     };
//   }
// }

// // ========== NOTIFICATION TRIGGER APIS ==========

// /**
//  * Trigger new order notification (for testing)
//  */
// async triggerNewOrderNotification(orderData) {
//   try {
//     console.log('🛍️ Triggering new order notification:', {
//       orderNumber: orderData.orderNumber
//     });
    
//     const response = await this.client.post('/api/admin/notifications/trigger/new-order', orderData);
    
//     console.log('✅ New order notification triggered');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Trigger new order notification error:', error.message);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Trigger payment notification (for testing)
//  */
// async triggerPaymentNotification(paymentData) {
//   try {
//     console.log('💰 Triggering payment notification:', {
//       orderNumber: paymentData.orderNumber
//     });
    
//     const response = await this.client.post('/api/admin/notifications/trigger/payment', paymentData);
    
//     console.log('✅ Payment notification triggered');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Trigger payment notification error:', error.message);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Trigger low stock notification (for testing)
//  */
// async triggerLowStockNotification(stockData) {
//   try {
//     console.log('📉 Triggering low stock notification:', {
//       productName: stockData.productName
//     });
    
//     const response = await this.client.post('/api/admin/notifications/trigger/low-stock', stockData);
    
//     console.log('✅ Low stock notification triggered');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Trigger low stock notification error:', error.message);
//     return { success: false, error: error.message };
//   }
// }

// /**
//  * Check FCM connectivity
//  */
// async checkFCMConnectivity() {
//   try {
//     console.log('🔗 Checking FCM connectivity');
    
//     const response = await this.client.get('/api/admin/notifications/health');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ FCM connectivity check failed:', error.message);
//     return {
//       success: false,
//       message: 'FCM connectivity check failed',
//       error: error.message
//     };
//   }
// }

// /**
//  * Get active admin devices
//  */
// async getActiveAdminDevices() {
//   try {
//     console.log('📱 Fetching active admin devices');
    
//     const response = await this.client.get('/api/admin/devices/active');
//     const result = this.extractData(response.data);
    
//     console.log(`✅ Found ${result.devices?.length || 0} active devices`);
//     return result;

//   } catch (error) {
//     console.error('❌ Get active devices error:', error.message);
//     return { devices: [], count: 0 };
//   }
// }

// // ========== COMPATIBILITY WITH FCM-TOKEN-SERVICE ==========

// /**
//  * Compatibility method for fcm-token-service.js
//  * Saves token with device info
//  */
// async saveTokenToBackend(token, deviceInfo = {}) {
//   return await this.saveFCMToken({
//     token,
//     deviceInfo: {
//       userAgent: deviceInfo.userAgent || navigator.userAgent,
//       platform: deviceInfo.platform || navigator.platform,
//       deviceName: deviceInfo.deviceName || this.getDeviceName(),
//       deviceType: deviceInfo.deviceType || this.getDeviceType(),
//       os: deviceInfo.os || this.getOS(),
//       browser: deviceInfo.browser || this.getBrowser(),
//       screenResolution: deviceInfo.screenResolution || `${window.screen.width}x${window.screen.height}`,
//       ipAddress: deviceInfo.ipAddress || '',
//       timestamp: new Date().toISOString(),
//       ...deviceInfo
//     }
//   });
// }

// // Helper methods for device detection
// getDeviceName() {
//   const ua = navigator.userAgent;
//   if (/mobile/i.test(ua)) return 'Mobile Device';
//   if (/tablet/i.test(ua)) return 'Tablet';
//   if (/mac/i.test(ua)) return 'Mac';
//   if (/windows/i.test(ua)) return 'Windows PC';
//   if (/linux/i.test(ua)) return 'Linux PC';
//   return 'Unknown Device';
// }

// getDeviceType() {
//   const ua = navigator.userAgent;
//   if (/mobile/i.test(ua)) return 'mobile';
//   if (/tablet/i.test(ua)) return 'tablet';
//   return 'desktop';
// }

// getOS() {
//   const ua = navigator.userAgent;
//   if (/windows/i.test(ua)) return 'Windows';
//   if (/mac/i.test(ua)) return 'macOS';
//   if (/linux/i.test(ua)) return 'Linux';
//   if (/android/i.test(ua)) return 'Android';
//   if (/ios|iphone|ipad|ipod/i.test(ua)) return 'iOS';
//   return 'Unknown OS';
// }

// getBrowser() {
//   const ua = navigator.userAgent;
//   if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
//   if (/firefox/i.test(ua)) return 'Firefox';
//   if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
//   if (/edg/i.test(ua)) return 'Edge';
//   if (/opera|opr/i.test(ua)) return 'Opera';
//   return 'Unknown Browser';
// }
// // Add to your existing apiService.js
// // services/apiService.js - UPDATE sendNotificationToDashboard method

// async sendNotificationToDashboard(notificationData) {
//   try {
//     console.log('📤 Sending notification to dashboard:', {
//       type: notificationData.type,
//       orderNumber: notificationData.data?.orderNumber
//     });

//     // FIX: Change from /api/admin/notifications to /api/notifications
//     const response = await this.client.post('/api/notifications', notificationData, {
//       headers: {
//         'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024',
//         'Content-Type': 'application/json'
//       }
//     });
    
//     console.log('✅ Dashboard notification sent successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Dashboard notification error:', {
//       message: error.message,
//       status: error.response?.status,
//       url: error.config?.url
//     });
    
//     // Check if it's a 404 error
//     if (error.response?.status === 404) {
//       console.warn('⚠️ /api/notifications endpoint returned 404, using fallback');
      
//       // Fallback: Return success anyway since Socket.IO might handle it
//       return {
//         success: true,
//         message: 'Notification processed (fallback mode)',
//         notification: notificationData,
//         fallback: true,
//         timestamp: new Date().toISOString()
//       };
//     }
    
//     return { 
//       success: false, 
//       error: error.message,
//       statusCode: error.response?.status
//     };
//   }
// }
// // Add these methods to your ApiService class:

// /**
//  * Send payment notification via API
//  */
// async sendPaymentNotification(paymentData) {
//   try {
//     console.log('💰 Sending payment notification via API:', {
//       orderNumber: paymentData.orderNumber,
//       amount: paymentData.amount
//     });

//     const response = await this.client.post('/api/notifications', {
//       type: 'PAYMENT_RECEIVED',
//       priority: 'high',
//       data: {
//         orderNumber: paymentData.orderNumber || '',
//         amount: paymentData.amount || 0,
//         customerName: paymentData.customerName || '',
//         customerPhone: paymentData.customerPhone || '',
//         paymentMethod: paymentData.paymentMethod || 'upi',
//         timestamp: paymentData.timestamp || new Date().toISOString(),
//         confidence: paymentData.confidence || 0,
//         verifiedBy: paymentData.verifiedBy || 'auto_ocr'
//       }
//     }, {
//       headers: {
//         'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
//       }
//     });
    
//     console.log('✅ Payment notification sent successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Send payment notification API error:', error.message);
//     return { 
//       success: false, 
//       error: error.message,
//       statusCode: error.response?.status 
//     };
//   }
// }

// /**
//  * Send invoice notification via API
//  */
// async sendInvoiceNotification(invoiceData) {
//   try {
//     console.log('📄 Sending invoice notification via API:', {
//       orderNumber: invoiceData.orderNumber
//     });

//     const response = await this.client.post('/api/notifications', {
//       type: 'INVOICE_GENERATED',
//       priority: 'normal',
//       data: {
//         orderNumber: invoiceData.orderNumber || '',
//         customerPhone: invoiceData.customerPhone || '',
//         amount: invoiceData.amount || 0,
//         invoiceGeneratedAt: invoiceData.invoiceGeneratedAt || new Date().toISOString(),
//         timestamp: new Date().toISOString()
//       }
//     }, {
//       headers: {
//         'x-api-key': process.env.NOTIFICATION_API_KEY || 'dev-key-2024'
//       }
//     });
    
//     console.log('✅ Invoice notification sent successfully');
//     return this.extractData(response.data);

//   } catch (error) {
//     console.error('❌ Send invoice notification API error:', error.message);
//     return { success: false, error: error.message };
//   }
// }
// }

// // Create and export singleton instance
// const apiService = new ApiService();
// export default apiService;

// services/apiService.js - COMPLETE UPDATED VERSION FOR ENHANCED SCHEMAS

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

        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                if (config.data && config.method === 'POST') {
                    console.log('📦 Request Data:', {
                        orderNumber: config.data.orderNumber,
                        customerPhone: config.data.customerPhone,
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

    // ========== PAYMENT VERIFICATION APIS ==========

    async createPaymentVerification(verificationData) {
        try {
            console.log('🔍 Creating payment verification:', {
                orderNumber: verificationData.orderNumber,
                customerPhone: verificationData.customerPhone
            });

            if (!verificationData.orderNumber || !verificationData.customerPhone) {
                throw new Error('Order number and customer phone are required');
            }

            // Format payment verification data with enhanced fields
            const formattedData = {
                orderNumber: verificationData.orderNumber,
                customerPhone: verificationData.customerPhone,
                customerName: verificationData.customerName || '',
                orderReference: verificationData.orderReference || verificationData.orderNumber,
                orderDetails: {
                    totalAmount: this.safeNumber(verificationData.orderDetails?.totalAmount || verificationData.amount),
                    subtotal: this.safeNumber(verificationData.orderDetails?.subtotal),
                    totalGst: this.safeNumber(verificationData.orderDetails?.totalGst),
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
                paymentProof: verificationData.paymentProof || {},
                detectedPayment: {
                    amount: this.safeNumber(verificationData.detectedPayment?.amount || verificationData.amount),
                    upiTransactionId: verificationData.detectedPayment?.upiTransactionId || verificationData.upiTransactionId,
                    bankReference: verificationData.detectedPayment?.bankReference,
                    paymentMethod: verificationData.detectedPayment?.paymentMethod || verificationData.paymentMethod || 'upi',
                    timestamp: verificationData.detectedPayment?.timestamp || new Date().toISOString(),
                    status: verificationData.detectedPayment?.status || 'success',
                    confidence: this.safeNumber(verificationData.detectedPayment?.confidence, 1)
                },
                metadata: {
                    source: verificationData.metadata?.source || 'whatsapp',
                    ipAddress: verificationData.metadata?.ipAddress,
                    userAgent: verificationData.metadata?.userAgent,
                    ...verificationData.metadata
                }
            };

            console.log('📤 Sending to /api/payments/verify');
            const response = await this.client.post('/api/payments/verify', formattedData);
            
            console.log('✅ Payment verification created successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Create payment verification error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            if (error.response?.status === 400) {
                throw new Error(`Invalid request: ${error.response.data?.message || 'Bad request'}`);
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

    async getPaymentVerificationById(verificationId) {
        try {
            if (!verificationId) {
                throw new Error('Verification ID is required');
            }

            const response = await this.client.get(`/api/payments/verify?id=${verificationId}`);
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Get payment verification error:', error.message);
            return null;
        }
    }

    async getPaymentVerificationByOrderNumber(orderNumber) {
        try {
            if (!orderNumber) {
                throw new Error('Order number is required');
            }

            const response = await this.client.get(`/api/payments/verify?orderNumber=${orderNumber}`);
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

    async rejectPaymentVerification(verificationId, reason, rejectedBy = 'admin') {
        try {
            if (!verificationId || !reason) {
                throw new Error('Verification ID and reason are required');
            }

            const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=reject`, {
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

    async markPaymentAsFraud(verificationId, reasons, markedBy = 'admin') {
        try {
            if (!verificationId || !reasons) {
                throw new Error('Verification ID and reasons are required');
            }

            const response = await this.client.put(`/api/payments/verify?id=${verificationId}&action=mark-fraud`, {
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

    async getPendingPaymentVerifications() {
        try {
            const response = await this.client.get('/api/payments/verify?status=pending');
            return this.ensureArray(response.data);

        } catch (error) {
            console.error('❌ Get pending verifications error:', error.message);
            return [];
        }
    }

    async getPaymentVerificationsByStatus(status = 'pending') {
        try {
            const response = await this.client.get(`/api/payments/verify?status=${status}`);
            return this.ensureArray(response.data);

        } catch (error) {
            console.error('❌ Get verifications by status error:', error.message);
            return [];
        }
    }

    // ========== ORDER APIS (UPDATED FOR ENHANCED SCHEMA) ==========

    async createOrder(orderData) {
        try {
            if (!orderData.orderNumber || !orderData.phoneNumber || !orderData.items) {
                throw new Error('Missing required order fields');
            }

            // Format order data with enhanced schema fields
           // Format order data with enhanced schema fields
const formattedOrderData = {
    orderNumber: orderData.orderNumber,
    customerName: orderData.customerName || '',
    customerEmail: orderData.customerEmail || '',
    phoneNumber: this.cleanPhoneNumber(orderData.phoneNumber),
    secondaryPhoneNumber: orderData.secondaryPhoneNumber ? this.cleanPhoneNumber(orderData.secondaryPhoneNumber) : null,
    // ✅ ADD THIS LINE - WhatsApp number for customer identification
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

            const response = await this.client.post('/api/orders', formattedOrderData);
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Create Order', error);
            throw new Error('Failed to create order: ' + (error.response?.data?.message || error.message));
        }
    }

   async getCustomerOrders(identifier) {
    try {
        if (!identifier) {
            return [];
        }

        const cleanIdentifier = this.cleanPhoneNumber(identifier);
        if (cleanIdentifier.length < 10) {
            return [];
        }

        console.log(`📞 Fetching orders for identifier: ${cleanIdentifier}`);
        
        // ✅ Search by BOTH phoneNumber and whatsappNumber
        // Using the 'search' parameter which will be handled by the API
        const response = await this.client.get(`/api/orders?search=${cleanIdentifier}`);
        
        // Log the response for debugging
        console.log(`📊 Found ${response.data?.data?.length || 0} orders`);
        
        return this.ensureArray(response.data);
    } catch (error) {
        this.handleApiError('Get Customer Orders', error);
        return [];
    }
}

    async getPendingOrdersByPhone(phoneNumber) {
        try {
            if (!phoneNumber) {
                return [];
            }

            const cleanPhone = this.cleanPhoneNumber(phoneNumber);
            if (cleanPhone.length < 10) {
                return [];
            }

            console.log(`📞 Fetching pending orders for: ${cleanPhone}`);
            
            const allOrders = await this.getCustomerOrders(cleanPhone);
            
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

    async getOrderById(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const response = await this.client.get(`/api/orders?id=${orderId}`);
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

    async getOrderByNumber(orderNumber) {
        try {
            if (!orderNumber) {
                throw new Error('Order number is required');
            }

            const response = await this.client.get(`/api/orders?orderNumber=${orderNumber}`);
            const order = this.extractData(response.data);
            
            return order || null;
        } catch (error) {
            this.handleApiError('Get Order By Number', error);
            return null;
        }
    }

    async updateOrderStatus(orderId, status, comment = '') {
        try {
            if (!orderId || !status) {
                throw new Error('Order ID and status are required');
            }

            const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
                status,
                statusComment: comment,
                statusHistory: [{
                    status,
                    timestamp: new Date().toISOString(),
                    comment
                }]
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Update Order Status', error);
            throw new Error('Failed to update order status');
        }
    }

    /**
     * CRITICAL METHOD: Update order payment status
     * Used when payment verification succeeds
     */
    async updateOrderPaymentStatus(orderNumber, paymentData) {
        try {
            if (!orderNumber) {
                throw new Error('Order number is required');
            }

            console.log(`💰 Updating payment status for order: ${orderNumber}`, paymentData);

            // First get the order by order number to get its ID
            const order = await this.getOrderByNumber(orderNumber);
            
            if (!order) {
                throw new Error(`Order ${orderNumber} not found`);
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
            const response = await this.client.put(`/api/orders?id=${order._id}&action=payment-verified`, updatePayload);
            
            console.log(`✅ Order ${orderNumber} payment status updated to PAID`);
            return this.extractData(response.data);

        } catch (error) {
            this.handleApiError('Update Order Payment Status', error);
            throw new Error('Failed to update order payment status: ' + (error.message || 'Unknown error'));
        }
    }

    // ========== PRODUCT APIS (UPDATED FOR ENHANCED SCHEMA) ==========

    async getProducts() {
        try {
            const response = await this.client.get('/api/products?isActive=true');
            const products = this.ensureArray(response.data);
            
            // Format products with computed fields
            return products.map(product => ({
                ...product,
                displayPrice: this.safeNumber(product.discountPrice) || this.safeNumber(product.price),
                inStock: this.safeNumber(product.stock) > 0,
                discountPercentage: this.safeNumber(product.mrp) > this.safeNumber(product.discountPrice) 
                    ? Math.round(((this.safeNumber(product.mrp) - this.safeNumber(product.discountPrice)) / this.safeNumber(product.mrp)) * 100)
                    : 0
            }));
        } catch (error) {
            this.handleApiError('Get Products', error);
            return [];
        }
    }

    async getProductById(productId) {
        try {
            if (!productId || productId.length !== 24) {
                throw new Error('Invalid product ID format');
            }

            const response = await this.client.get(`/api/products?id=${productId}`);
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

    async searchProducts(query) {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            const response = await this.client.get(`/api/products?search=${encodeURIComponent(query.trim())}`);
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

    async getAllActiveProducts() {
        try {
            const response = await this.client.get('/api/products?isActive=true');
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

    async getProductsByCategory(category) {
        try {
            if (!category) {
                return [];
            }

            const response = await this.client.get(`/api/products?category=${encodeURIComponent(category)}&isActive=true`);
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

    async updateProductStock(productId, newStock) {
        try {
            if (!productId || newStock === undefined) {
                throw new Error('Product ID and stock are required');
            }

            const response = await this.client.patch(`/api/products?id=${productId}`, { 
                stock: this.safeNumber(newStock) 
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Update Product Stock', error);
            throw new Error('Failed to update product stock');
        }
    }

    // ========== ORDER MANAGEMENT ==========

    async getOrdersByStatus(status = 'all') {
        try {
            const response = await this.client.get(`/api/orders?status=${status}`);
            return this.ensureArray(response.data);
        } catch (error) {
            this.handleApiError('Get Orders by Status', error);
            return [];
        }
    }

    async getPendingOrderByPhone(phoneNumber) {
        try {
            const pendingOrders = await this.getPendingOrdersByPhone(phoneNumber);
            return pendingOrders.length > 0 ? pendingOrders[0] : null;
        } catch (error) {
            this.handleApiError('Get Pending Order By Phone', error);
            return null;
        }
    }

    async cancelOrder(orderId, reason = 'Customer request') {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
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

    async shipOrder(orderId, trackingNumber = '') {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
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

    async deliverOrder(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const response = await this.client.patch(`/api/orders?id=${orderId}`, { 
                status: 'delivered',
                statusComment: 'Order delivered successfully'
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Deliver Order', error);
            throw new Error('Failed to update order as delivered');
        }
    }

    // ========== PAYMENT APIS ==========

    async rejectPayment(rejectionData) {
        try {
            if (!rejectionData.orderNumber) {
                throw new Error('Order number is required for payment rejection');
            }

            const response = await this.client.post('/api/payments/reject', {
                orderNumber: rejectionData.orderNumber,
                reason: rejectionData.reason || 'Payment verification failed',
                rejectedBy: rejectionData.rejectedBy || 'system',
                timestamp: new Date().toISOString()
            });
            return this.extractData(response.data);
        } catch (error) {
            this.handleApiError('Reject Payment', error);
            throw new Error('Payment rejection failed');
        }
    }

    async getPendingPayments() {
        try {
            const response = await this.client.get('/api/payments/verify?status=pending');
            return this.ensureArray(response.data);
        } catch (error) {
            this.handleApiError('Get Pending Payments', error);
            return [];
        }
    }

    // ========== ANALYTICS AND REPORTING ==========

    async getOrderStats(timeframe = 'month') {
        try {
            const response = await this.client.get(`/api/analytics/orders?timeframe=${timeframe}`);
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

    async getProductStats() {
        try {
            const response = await this.client.get('/api/analytics/products');
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

    async getPaymentVerificationStats(timeframe = 'week') {
        try {
            const response = await this.client.get(`/api/analytics/payments?timeframe=${timeframe}`);
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

    // ========== FCM TOKEN MANAGEMENT APIS ==========

    async saveFCMToken(tokenData) {
        try {
            console.log('📱 Saving FCM token for admin device:', {
                deviceType: tokenData.deviceInfo?.deviceType,
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

    async deleteFCMToken(token) {
        try {
            console.log('🗑️ Deleting FCM token:', token ? token.substring(0, 20) + '...' : 'No token');

            if (!token) {
                throw new Error('FCM token is required');
            }

            const response = await this.client.delete('/api/auth/fcm-token', {
                data: { token }
            });
            
            console.log('✅ FCM token deleted successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Delete FCM token error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getAdminFCMTokens() {
        try {
            console.log('📱 Fetching admin FCM tokens');
            
            const response = await this.client.get('/api/auth/fcm-token?adminOnly=true');
            const result = this.extractData(response.data);
            
            console.log(`✅ Found ${result.tokens?.length || 0} FCM tokens`);
            return result;

        } catch (error) {
            console.error('❌ Get FCM tokens error:', error.message);
            return { tokens: [], count: 0 };
        }
    }

    async sendTestNotificationToAdmin(notificationData = {}) {
        try {
            console.log('🧪 Sending test notification to admin devices');
            
            const response = await this.client.post('/api/admin/notifications/test', {
                title: notificationData.title || 'Test Notification',
                body: notificationData.body || 'This is a test notification',
                type: notificationData.type || 'test',
                priority: notificationData.priority || 'normal',
                data: notificationData.data || {},
                timestamp: new Date().toISOString()
            });
            
            console.log('✅ Test notification sent successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Send test notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async getAdminNotificationStats(timeframe = 'day') {
        try {
            console.log('📊 Fetching admin notification statistics');
            
            const response = await this.client.get(`/api/admin/notifications/stats?timeframe=${timeframe}`);
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

    async updateNotificationSettings(settings) {
        try {
            console.log('⚙️ Updating admin notification settings');
            
            const response = await this.client.patch('/api/admin/notifications/settings', settings);
            
            console.log('✅ Notification settings updated successfully');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Update notification settings error:', error.message);
            throw new Error('Failed to update notification settings: ' + error.message);
        }
    }

    async getNotificationSettings() {
        try {
            console.log('⚙️ Fetching admin notification settings');
            
            const response = await this.client.get('/api/admin/notifications/settings');
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

    // ========== NOTIFICATION TRIGGER APIS ==========

    async sendNotificationToDashboard(notificationData) {
        try {
            console.log('📤 Sending notification to dashboard:', {
                type: notificationData.type,
                orderNumber: notificationData.data?.orderNumber
            });

            const response = await this.client.post('/api/notifications', {
                type: notificationData.type || 'INFO',
                priority: notificationData.priority || 'normal',
                title: notificationData.title || '',
                message: notificationData.message || '',
                data: {
                    ...notificationData.data,
                    timestamp: new Date().toISOString()
                },
                forAdmin: notificationData.forAdmin !== false
            }, {
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
                amount: paymentData.amount
            });

            const response = await this.client.post('/api/notifications', {
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
                    timestamp: new Date().toISOString()
                },
                forAdmin: true
            }, {
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
                orderNumber: invoiceData.orderNumber
            });

            const response = await this.client.post('/api/notifications', {
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
                    timestamp: new Date().toISOString()
                },
                forAdmin: true
            }, {
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
                orderNumber: orderData.orderNumber
            });
            
            const response = await this.client.post('/api/admin/notifications/trigger/new-order', {
                ...orderData,
                timestamp: new Date().toISOString()
            });
            
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
                orderNumber: paymentData.orderNumber
            });
            
            const response = await this.client.post('/api/admin/notifications/trigger/payment', {
                ...paymentData,
                amount: this.safeNumber(paymentData.amount),
                timestamp: new Date().toISOString()
            });
            
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
                productName: stockData.productName
            });
            
            const response = await this.client.post('/api/admin/notifications/trigger/low-stock', {
                ...stockData,
                currentStock: this.safeNumber(stockData.currentStock),
                threshold: this.safeNumber(stockData.threshold),
                timestamp: new Date().toISOString()
            });
            
            console.log('✅ Low stock notification triggered');
            return this.extractData(response.data);

        } catch (error) {
            console.error('❌ Trigger low stock notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    async checkFCMConnectivity() {
        try {
            console.log('🔗 Checking FCM connectivity');
            
            const response = await this.client.get('/api/admin/notifications/health');
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

    async getActiveAdminDevices() {
        try {
            console.log('📱 Fetching active admin devices');
            
            const response = await this.client.get('/api/admin/devices/active');
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

    async saveTokenToBackend(token, deviceInfo = {}) {
        return await this.saveFCMToken({
            token,
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