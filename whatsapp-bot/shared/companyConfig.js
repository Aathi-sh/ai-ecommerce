


// // //whatsapp-bot/shared/companyConfig.js

// // /**
// //  * 
// //  * 
// //  * COMPANY CONFIGURATION MANAGER
// //  * 
// //  * Fetches company settings from Next.js API endpoints
// //  * NO DIRECT DATABASE CONNECTION NEEDED!
// //  * 
// //  * Features:
// //  * - Fetches real-time settings from Next.js API
// //  * - 5-minute cache with auto-refresh
// //  * - Fallback defaults if API is unavailable
// //  * - Auto-updates when admin changes settings via API
// //  */

// // // ==================== CONFIGURATION ====================

// // const API_BASE_URL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
// // const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// // const REQUEST_TIMEOUT = 5000; // 5 seconds

// // // Default fallback settings (used ONLY if API is completely unavailable)
// // // These are just placeholders - REAL data comes from API
// // const DEFAULT_SETTINGS = {
// //     companyName: 'Your Company Name',
// //     legalName: 'Your Legal Name',
// //     tagline: 'Your Tagline',
// //     phone: '+91 00000 00000',
// //     email: 'support@yourcompany.com',
// //     website: 'www.yourcompany.com',
// //     address: 'Your Address',
// //     city: 'Your City',
// //     gstin: '',
// //     pan: '',
// //     cin: '',
    
// //     // ✅ ADDED: Default order flow mode
// //     orderFlowMode: 'short',
    
// //     // UPI IDs - These will be OVERWRITTEN by API data
// //     upiIds: [
// //         {
// //             id: 'your-upi@oksbi',
// //             name: 'Primary UPI',
// //             appType: 'other',
// //             isActive: true,
// //             description: 'Main business UPI ID'
// //         }
// //     ],
    
// //     // Bank Details
// //     bank: {
// //         name: 'Your Bank',
// //         account: '00000000000',
// //         ifsc: 'BANK0000000',
// //         branch: 'Your Branch',
// //         accountType: 'Current Account'
// //     },
    
// //     // Invoice Settings
// //     invoiceSettings: {
// //         prefix: 'INV',
// //         separator: '-',
// //         dateFormat: 'dd/mm/yyyy',
// //         currency: '₹',
// //         taxSystem: 'GST',
// //         gstBreakdown: true,
// //         showCGSTSGST: true,
// //         roundAmount: true,
// //         paymentTerms: 'Due on receipt',
// //         deliveryTerms: '3-5 business days after payment confirmation',
// //         warrantyTerms: '7 days replacement',
// //         refundPolicy: 'No refunds after processing'
// //     },
    
// //     // Support Settings
// //     support: {
// //         email: 'support@yourcompany.com',
// //         phone: '+91 00000 00000',
// //         hours: 'Mon-Sat, 10:00 AM - 7:00 PM',
// //         responseTime: 'Within 30 minutes'
// //     },
    
// //     // Social Media
// //     social: {
// //         facebook: '',
// //         instagram: '',
// //         twitter: '',
// //         youtube: ''
// //     },
    
// //     // Theme
// //     theme: {
// //         primary: '#2c3e50',
// //         secondary: '#34495e',
// //         accent: '#27ae60'
// //     },
    
// //     // Images
// //     logo: null,
// //     signature: null,
// //     stamp: null
// // };

// // // ==================== COMPANY CONFIG CLASS ====================

// // class CompanyConfig {
// //     constructor() {
// //         this.cache = null;
// //         this.lastFetch = null;
// //         this.fetchPromise = null;
// //         this.refreshTimer = null;
// //         this.baseUrl = API_BASE_URL;
        
// //         console.log(`🚀 [CompanyConfig] Initialized with API URL: ${this.baseUrl}`);
// //     }

// //     /**
// //      * Make API request with timeout
// //      */
// //     async apiRequest(endpoint) {
// //         const controller = new AbortController();
// //         const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

// //         try {
// //             console.log(`🌐 [CompanyConfig] Fetching: ${this.baseUrl}${endpoint}`);
            
// //             const response = await fetch(`${this.baseUrl}${endpoint}`, {
// //                 signal: controller.signal,
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 }
// //             });

// //             clearTimeout(timeoutId);

// //             if (!response.ok) {
// //                 throw new Error(`API returned ${response.status}: ${response.statusText}`);
// //             }

// //             const data = await response.json();
            
// //             if (!data.success) {
// //                 throw new Error(data.error || 'API request failed');
// //             }

// //             console.log(`✅ [CompanyConfig] API response received`);
// //             return data.data;

// //         } catch (error) {
// //             clearTimeout(timeoutId);
            
// //             if (error.name === 'AbortError') {
// //                 console.error(`❌ [CompanyConfig] Request timeout after ${REQUEST_TIMEOUT}ms`);
// //                 throw new Error('Request timeout');
// //             }
            
// //             console.error(`❌ [CompanyConfig] API request failed:`, error.message);
// //             throw error;
// //         }
// //     }

// //     /**
// //      * Fetch fresh settings from API
// //      */
// //     async fetchFromAPI() {
// //         try {
// //             const settings = await this.apiRequest('/api/company-settings');
// //             console.log('✅ [CompanyConfig] Settings fetched from API successfully');
            
// //             // Log what we got (without sensitive data)
// //             console.log(`📊 [CompanyConfig] Company: ${settings.companyName}`);
// //             console.log(`📊 [CompanyConfig] Active UPI IDs: ${settings.upiIds?.filter(u => u.isActive).length || 0}`);
// //             // ✅ ADDED: Log order flow mode
// //             console.log(`📊 [CompanyConfig] Order flow mode: ${settings.orderFlowMode || 'short'}`);
            
// //             return settings;

// //         } catch (error) {
// //             console.error('❌ [CompanyConfig] API fetch failed:', error.message);
            
// //             // Log more details about the error
// //             if (error.message.includes('ECONNREFUSED')) {
// //                 console.error(`💡 Make sure Next.js server is running at ${this.baseUrl}`);
// //             }
            
// //             return null;
// //         }
// //     }

// //     /**
// //      * Get settings (with caching)
// //      * 
// //      * @returns {Promise<Object>} Company settings from API or fallback defaults
// //      */
// //     async getSettings() {
// //         // If cache is valid, return it
// //         if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < CACHE_TTL)) {
// //             console.log('📦 [CompanyConfig] Returning cached settings (age: ' + 
// //                 Math.round((Date.now() - this.lastFetch) / 1000) + 's)');
// //             return this.cache;
// //         }

// //         // If already fetching, wait for that promise
// //         if (this.fetchPromise) {
// //             console.log('⏳ [CompanyConfig] Waiting for ongoing fetch...');
// //             return this.fetchPromise;
// //         }

// //         // Fetch new data
// //         console.log('🔄 [CompanyConfig] Cache expired, fetching fresh settings...');
// //         this.fetchPromise = this.fetchFromAPI();

// //         try {
// //             const settings = await this.fetchPromise;
            
// //             if (settings) {
// //                 // ✅ CRITICAL: Cache the REAL data from API
// //                 this.cache = settings;
// //                 this.lastFetch = Date.now();
// //               //  this.setupAutoRefresh();
                
// //                 console.log(`✅ [CompanyConfig] Settings updated in cache`);
// //                 console.log(`   Company: ${settings.companyName}`);
// //                 console.log(`   UPI IDs: ${settings.upiIds?.length || 0} total, ${settings.upiIds?.filter(u => u.isActive).length || 0} active`);
// //                 // ✅ ADDED: Log cached mode
// //                 console.log(`   Order flow mode: ${settings.orderFlowMode || 'short'}`);
                
// //                 return settings;
// //             } else {
// //                 // Return cached data even if expired (better than nothing)
// //                 if (this.cache) {
// //                     console.warn('⚠️ [CompanyConfig] Using stale cache due to API failure');
// //                     console.warn(`   Cache age: ${Math.round((Date.now() - this.lastFetch) / 1000 / 60)} minutes`);
// //                     return this.cache;
// //                 }
                
// //                 // Ultimate fallback to defaults (only if absolutely nothing works)
// //                 console.warn('⚠️ [CompanyConfig] Using DEFAULT settings (API unavailable and no cache)');
// //                 console.warn(`   Check: Is Next.js server running at ${this.baseUrl}?`);
// //                 return { ...DEFAULT_SETTINGS }; // Return copy of defaults
// //             }
// //         } finally {
// //             this.fetchPromise = null;
// //         }
// //     }

// //     /**
// //      * Setup auto-refresh timer
// //      */
// //     // setupAutoRefresh() {
// //     //     if (this.refreshTimer) {
// //     //         clearTimeout(this.refreshTimer);
// //     //     }
        
// //     //     this.refreshTimer = setTimeout(async () => {
// //     //         console.log('🔄 [CompanyConfig] Auto-refreshing settings...');
// //     //         await this.getSettings();
// //     //     }, CACHE_TTL);
// //     // }

// //     /**
// //      * ✅ ADDED: Get current order flow mode
// //      * Uses existing getSettings() method - NO NEW API CALLS!
// //      * 
// //      * @returns {Promise<string>} 'short' or 'long'
// //      */
// //     async getOrderFlowMode() {
// //         try {
// //             const settings = await this.getSettings();
// //             const mode = settings.orderFlowMode || 'short';
// //             console.log(`🔄 [CompanyConfig] Order flow mode: ${mode}`);
// //             return mode;
// //         } catch (error) {
// //             console.error('❌ [CompanyConfig] Error getting order flow mode:', error.message);
// //             return 'short'; // Default to short on error
// //         }
// //     }

// //     /**
// //      * Get active UPI IDs (for payment verification)
// //      * 
// //      * @returns {Promise<string[]>} Array of active UPI ID strings
// //      */
// //     async getActiveUpiIds() {
// //         const settings = await this.getSettings();
// //         const activeUpiIds = (settings.upiIds || [])
// //             .filter(upi => upi.isActive)
// //             .map(upi => upi.id);
        
// //         console.log(`💰 [CompanyConfig] Active UPI IDs: ${activeUpiIds.join(', ') || 'None'}`);
// //         return activeUpiIds;
// //     }

// //     /**
// //      * Get active UPI IDs with full details
// //      * 
// //      * @returns {Promise<Array>} Array of active UPI objects with all details
// //      */
// //     async getActiveUpiDetails() {
// //         const settings = await this.getSettings();
// //         const activeUpiDetails = (settings.upiIds || []).filter(upi => upi.isActive);
        
// //         console.log(`💰 [CompanyConfig] Active UPI details: ${activeUpiDetails.length} found`);
// //         return activeUpiDetails;
// //     }

// //     /**
// //      * Check if UPI ID is valid and active
// //      * 
// //      * @param {string} upiId - UPI ID to check
// //      * @returns {Promise<boolean>} True if valid and active
// //      */
// //     async isValidUpiId(upiId) {
// //         if (!upiId) return false;
        
// //         const settings = await this.getSettings();
// //         const isValid = (settings.upiIds || []).some(upi => 
// //             upi.isActive && upi.id.toLowerCase() === upiId.toLowerCase()
// //         );
        
// //         console.log(`🔍 [CompanyConfig] UPI ID ${upiId} is ${isValid ? '✅ valid' : '❌ invalid'}`);
// //         return isValid;
// //     }

// //     /**
// //      * Get company info for invoice
// //      * 
// //      * @returns {Promise<Object>} Formatted company info for invoices
// //      */
// //     async getInvoiceInfo() {
// //     try {
// //         const settings = await this.getSettings();
        
// //         // ✅ CRITICAL FIX: Check if settings is null or undefined
// //         if (!settings) {
// //             console.warn('⚠️ [CompanyConfig] Settings is null/undefined, using defaults');
// //             return {
// //                 companyName: DEFAULT_SETTINGS.companyName,
// //                 legalName: DEFAULT_SETTINGS.legalName,
// //                 tagline: DEFAULT_SETTINGS.tagline,
// //                 address: DEFAULT_SETTINGS.address,
// //                 city: DEFAULT_SETTINGS.city,
// //                 gstin: DEFAULT_SETTINGS.gstin || '',
// //                 pan: DEFAULT_SETTINGS.pan || '',
// //                 cin: DEFAULT_SETTINGS.cin || '',
// //                 phone: DEFAULT_SETTINGS.phone,
// //                 email: DEFAULT_SETTINGS.email,
// //                 website: DEFAULT_SETTINGS.website,
// //                 bank: DEFAULT_SETTINGS.bank,
// //                 invoiceSettings: DEFAULT_SETTINGS.invoiceSettings,
// //                 logo: DEFAULT_SETTINGS.logo,
// //                 signature: DEFAULT_SETTINGS.signature,
// //                 stamp: DEFAULT_SETTINGS.stamp
// //             };
// //         }
        
// //         // ✅ Safe to access settings properties now
// //         return {
// //             companyName: settings.companyName || DEFAULT_SETTINGS.companyName,
// //             legalName: settings.legalName || DEFAULT_SETTINGS.legalName,
// //             tagline: settings.tagline || DEFAULT_SETTINGS.tagline,
// //             address: settings.address || DEFAULT_SETTINGS.address,
// //             city: settings.city || DEFAULT_SETTINGS.city,
// //             gstin: settings.gstin || '',
// //             pan: settings.pan || '',
// //             cin: settings.cin || '',
// //             phone: settings.phone || DEFAULT_SETTINGS.phone,
// //             email: settings.email || DEFAULT_SETTINGS.email,
// //             website: settings.website || DEFAULT_SETTINGS.website,
// //             bank: settings.bank || DEFAULT_SETTINGS.bank,
// //             invoiceSettings: settings.invoiceSettings || DEFAULT_SETTINGS.invoiceSettings,
// //             logo: settings.logo,
// //             signature: settings.signature,
// //             stamp: settings.stamp
// //         };
// //     } catch (error) {
// //         console.error('❌ [CompanyConfig] Error in getInvoiceInfo:', error.message);
        
// //         // Return defaults on any error
// //         return {
// //             companyName: DEFAULT_SETTINGS.companyName,
// //             legalName: DEFAULT_SETTINGS.legalName,
// //             tagline: DEFAULT_SETTINGS.tagline,
// //             address: DEFAULT_SETTINGS.address,
// //             city: DEFAULT_SETTINGS.city,
// //             gstin: DEFAULT_SETTINGS.gstin || '',
// //             pan: DEFAULT_SETTINGS.pan || '',
// //             cin: DEFAULT_SETTINGS.cin || '',
// //             phone: DEFAULT_SETTINGS.phone,
// //             email: DEFAULT_SETTINGS.email,
// //             website: DEFAULT_SETTINGS.website,
// //             bank: DEFAULT_SETTINGS.bank,
// //             invoiceSettings: DEFAULT_SETTINGS.invoiceSettings,
// //             logo: DEFAULT_SETTINGS.logo,
// //             signature: DEFAULT_SETTINGS.signature,
// //             stamp: DEFAULT_SETTINGS.stamp
// //         };
// //     }
// // }

// //     /**
// //      * Get support information
// //      * 
// //      * @returns {Promise<Object>} Formatted support info
// //      */
// //     async getSupportInfo() {
// //         const settings = await this.getSettings();
        
// //         return {
// //             email: settings.support?.email || settings.email || DEFAULT_SETTINGS.support.email,
// //             phone: settings.support?.phone || settings.phone || DEFAULT_SETTINGS.support.phone,
// //             hours: settings.support?.hours || DEFAULT_SETTINGS.support.hours,
// //             responseTime: settings.support?.responseTime || DEFAULT_SETTINGS.support.responseTime,
// //             address: `${settings.address || DEFAULT_SETTINGS.address}, ${settings.city || DEFAULT_SETTINGS.city}`,
// //             social: settings.social || DEFAULT_SETTINGS.social
// //         };
// //     }

// //     /**
// //      * Get bank details
// //      * 
// //      * @returns {Promise<Object>} Bank details
// //      */
// //     async getBankDetails() {
// //         const settings = await this.getSettings();
// //         return settings.bank || DEFAULT_SETTINGS.bank;
// //     }

// //     /**
// //      * Force refresh settings (call after admin updates)
// //      * 
// //      * @returns {Promise<Object>} Fresh settings from API
// //      */
// //     async forceRefresh() {
// //         console.log('🔄 [CompanyConfig] Force refreshing settings...');
// //         this.lastFetch = null; // Invalidate cache
// //         this.cache = null;
        
// //         if (this.refreshTimer) {
// //             clearTimeout(this.refreshTimer);
// //         }
        
// //         console.log('🔄 [CompanyConfig] Cache cleared, fetching fresh data...');
// //         return this.getSettings();
// //     }

// //     /**
// //      * Get specific setting by path (dot notation)
// //      * 
// //      * @param {string} path - Dot notation path (e.g., 'bank.name')
// //      * @returns {Promise<any>} Value at path or undefined
// //      */
// //     async get(path) {
// //         const settings = await this.getSettings();
        
// //         return path.split('.').reduce((obj, key) => 
// //             obj && obj[key] !== undefined ? obj[key] : undefined, settings);
// //     }

// //     /**
// //      * Check if API is reachable
// //      * 
// //      * @returns {Promise<boolean>} True if API is reachable
// //      */
// //     async healthCheck() {
// //         try {
// //             await this.apiRequest('/api/company-settings');
// //             return true;
// //         } catch {
// //             return false;
// //         }
// //     }

// //     /**
// //      * Get cache status
// //      * 
// //      * @returns {Object} Cache status info
// //      */
// //     getCacheStatus() {
// //         return {
// //             hasCache: !!this.cache,
// //             cacheAge: this.lastFetch ? Date.now() - this.lastFetch : null,
// //             cacheAgeMinutes: this.lastFetch ? Math.round((Date.now() - this.lastFetch) / 1000 / 60) : null,
// //             isFetching: !!this.fetchPromise,
// //             nextRefresh: this.lastFetch ? new Date(this.lastFetch + CACHE_TTL) : null
// //         };
// //     }

// //     /**
// //      * Clean up resources
// //      */
// //     destroy() {
// //         if (this.refreshTimer) {
// //             clearTimeout(this.refreshTimer);
// //             this.refreshTimer = null;
// //         }
// //         console.log('🧹 [CompanyConfig] Cleaned up');
// //     }
// // }

// // // ==================== EXPORT SINGLETON ====================

// // // Create and export a single instance (singleton pattern)
// // const companyConfig = new CompanyConfig();

// // // Handle process exit
// // process.on('SIGINT', () => {
// //     companyConfig.destroy();
// // });

// // process.on('SIGTERM', () => {
// //     companyConfig.destroy();
// // });

// // // Handle uncaught errors
// // process.on('uncaughtException', (error) => {
// //     console.error('❌ [CompanyConfig] Uncaught exception:', error);
// // });

// // export default companyConfig;





















// // whatsapp-bot/shared/companyConfig.js
// // ✅ FIXED: CommonJS version (using module.exports)

// /**
//  * COMPANY CONFIGURATION MANAGER
//  * 
//  * Fetches company settings from Next.js API endpoints
//  * NO DIRECT DATABASE CONNECTION NEEDED!
//  * 
//  * Features:
//  * - Fetches real-time settings from Next.js API
//  * - 5-minute cache with auto-refresh
//  * - Fallback defaults if API is unavailable
//  * - Auto-updates when admin changes settings via API
//  * - Supports MULTIPLE PAYMENT METHODS:
//  *   ✅ UPI IDs (multiple per company)
//  *   ✅ GPay Numbers (phone-based UPI)
//  *   ✅ PhonePe Numbers
//  *   ✅ PayTM Numbers
//  *   ✅ QR Code Images
//  *   ✅ Bank Accounts
//  */

// // ==================== CONFIGURATION ====================

// const API_BASE_URL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// const REQUEST_TIMEOUT = 5000; // 5 seconds

// // Default fallback settings (used ONLY if API is completely unavailable)
// // These are just placeholders - REAL data comes from API
// const DEFAULT_SETTINGS = {
//     companyName: 'Your Company Name',
//     legalName: 'Your Legal Name',
//     tagline: 'Your Tagline',
//     phone: '+91 00000 00000',
//     email: 'support@yourcompany.com',
//     website: 'www.yourcompany.com',
//     address: 'Your Address',
//     city: 'Your City',
//     gstin: '',
//     pan: '',
//     cin: '',
    
//     // ✅ Order flow mode
//     orderFlowMode: 'short',
    
//     // ========== PAYMENT METHODS ==========
    
//     // ✅ UPI IDs (Standard UPI format - name@bank)
//     upiIds: [
//         {
//             id: 'your-business@okaxis',
//             name: 'Primary Business UPI',
//             appType: 'upi',
//             isActive: true,
//             description: 'Main UPI ID for business',
//             createdAt: new Date().toISOString()
//         },
//         {
//             id: 'your-business@paytm',
//             name: 'PayTM UPI',
//             appType: 'paytm',
//             isActive: true,
//             description: 'PayTM UPI ID',
//             createdAt: new Date().toISOString()
//         }
//     ],
    
//     // ✅ GPay Numbers (Phone numbers for Google Pay)
//     gpayNumbers: [
//         {
//             phoneNumber: '+919876543210',
//             name: 'Primary GPay',
//             isActive: true,
//             description: 'Main Google Pay number',
//             upiId: '9876543210@okhdfcbank', // Auto-converted format
//             createdAt: new Date().toISOString()
//         }
//     ],
    
//     // ✅ PhonePe Numbers
//     phonePeNumbers: [
//         {
//             phoneNumber: '+919876543211',
//             name: 'Primary PhonePe',
//             isActive: true,
//             description: 'Main PhonePe number',
//             upiId: '9876543211@ybl', // Auto-converted format
//             createdAt: new Date().toISOString()
//         }
//     ],
    
//     // ✅ PayTM Numbers
//     paytmNumbers: [
//         {
//             phoneNumber: '+919876543212',
//             name: 'Primary PayTM',
//             isActive: true,
//             description: 'Main PayTM number',
//             upiId: '9876543212@paytm', // Auto-converted format
//             createdAt: new Date().toISOString()
//         }
//     ],
    
//     // ✅ QR Code (Base64 or URL)
//     qrCode: {
//         imageUrl: null, // URL to QR code image
//         imageData: null, // Base64 encoded QR
//         description: 'Scan to pay',
//         isActive: true,
//         updatedAt: null
//     },
    
//     // ✅ Bank Accounts (for traditional transfers)
//     bankAccounts: [
//         {
//             accountName: 'Your Business Name',
//             accountNumber: '1234567890',
//             bankName: 'Your Bank',
//             ifscCode: 'BANK0001234',
//             branch: 'Main Branch',
//             accountType: 'Current',
//             isActive: true,
//             description: 'Primary bank account',
//             createdAt: new Date().toISOString()
//         }
//     ],
    
//     // ✅ Payment Settings
//     paymentSettings: {
//         preferredMethod: 'upi', // 'upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank'
//         allowPartialPayments: false,
//         autoVerifyEnabled: true,
//         minConfidenceForAuto: 85,
//         paymentTimeout: 30, // minutes
//         requireTransactionId: true,
//         allowMultiplePaymentMethods: true
//     },
    
//     // Bank Details (legacy support)
//     bank: {
//         name: 'Your Bank',
//         account: '00000000000',
//         ifsc: 'BANK0000000',
//         branch: 'Your Branch',
//         accountType: 'Current Account'
//     },
    
//     // Invoice Settings
//     invoiceSettings: {
//         prefix: 'INV',
//         separator: '-',
//         dateFormat: 'dd/mm/yyyy',
//         currency: '₹',
//         taxSystem: 'GST',
//         gstBreakdown: true,
//         showCGSTSGST: true,
//         roundAmount: true,
//         paymentTerms: 'Due on receipt',
//         deliveryTerms: '3-5 business days after payment confirmation',
//         warrantyTerms: '7 days replacement',
//         refundPolicy: 'No refunds after processing'
//     },
    
//     // Support Settings
//     support: {
//         email: 'support@yourcompany.com',
//         phone: '+91 00000 00000',
//         hours: 'Mon-Sat, 10:00 AM - 7:00 PM',
//         responseTime: 'Within 30 minutes'
//     },
    
//     // Social Media
//     social: {
//         facebook: '',
//         instagram: '',
//         twitter: '',
//         youtube: ''
//     },
    
//     // Theme
//     theme: {
//         primary: '#2c3e50',
//         secondary: '#34495e',
//         accent: '#27ae60'
//     },
    
//     // Images
//     logo: null,
//     signature: null,
//     stamp: null
// };

// // ==================== COMPANY CONFIG CLASS ====================

// class CompanyConfig {
//     constructor() {
//         this.cache = null;
//         this.lastFetch = null;
//         this.fetchPromise = null;
//         this.refreshTimer = null;
//         this.baseUrl = API_BASE_URL;
        
//         console.log(`🚀 [CompanyConfig] Initialized with API URL: ${this.baseUrl}`);
//     }

//     /**
//      * Make API request with timeout
//      */
//     async apiRequest(endpoint) {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

//         try {
//             console.log(`🌐 [CompanyConfig] Fetching: ${this.baseUrl}${endpoint}`);
            
//             const response = await fetch(`${this.baseUrl}${endpoint}`, {
//                 signal: controller.signal,
//                 headers: {
//                     'Content-Type': 'application/json',
//                 }
//             });

//             clearTimeout(timeoutId);

//             if (!response.ok) {
//                 throw new Error(`API returned ${response.status}: ${response.statusText}`);
//             }

//             const data = await response.json();
            
//             if (!data.success) {
//                 throw new Error(data.error || 'API request failed');
//             }

//             console.log(`✅ [CompanyConfig] API response received`);
//             return data.data;

//         } catch (error) {
//             clearTimeout(timeoutId);
            
//             if (error.name === 'AbortError') {
//                 console.error(`❌ [CompanyConfig] Request timeout after ${REQUEST_TIMEOUT}ms`);
//                 throw new Error('Request timeout');
//             }
            
//             console.error(`❌ [CompanyConfig] API request failed:`, error.message);
//             throw error;
//         }
//     }

//     /**
//      * Fetch fresh settings from API
//      */
//     async fetchFromAPI() {
//         try {
//             const settings = await this.apiRequest('/api/company-settings');
//             console.log('✅ [CompanyConfig] Settings fetched from API successfully');
            
//             // Log what we got
//             console.log(`📊 [CompanyConfig] Company: ${settings.companyName}`);
//             console.log(`📊 [CompanyConfig] Active UPI IDs: ${settings.upiIds?.filter(u => u.isActive).length || 0}`);
//             console.log(`📊 [CompanyConfig] Active GPay Numbers: ${settings.gpayNumbers?.filter(g => g.isActive).length || 0}`);
//             console.log(`📊 [CompanyConfig] Active PhonePe Numbers: ${settings.phonePeNumbers?.filter(p => p.isActive).length || 0}`);
//             console.log(`📊 [CompanyConfig] Active PayTM Numbers: ${settings.paytmNumbers?.filter(p => p.isActive).length || 0}`);
//             console.log(`📊 [CompanyConfig] QR Code Active: ${settings.qrCode?.isActive ? '✅ Yes' : '❌ No'}`);
//             console.log(`📊 [CompanyConfig] Active Bank Accounts: ${settings.bankAccounts?.filter(b => b.isActive).length || 0}`);
//             console.log(`📊 [CompanyConfig] Order flow mode: ${settings.orderFlowMode || 'short'}`);
            
//             return settings;

//         } catch (error) {
//             console.error('❌ [CompanyConfig] API fetch failed:', error.message);
            
//             if (error.message.includes('ECONNREFUSED')) {
//                 console.error(`💡 Make sure Next.js server is running at ${this.baseUrl}`);
//             }
            
//             return null;
//         }
//     }

//     /**
//      * Get settings (with caching)
//      */
//     async getSettings() {
//         // If cache is valid, return it
//         if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < CACHE_TTL)) {
//             console.log('📦 [CompanyConfig] Returning cached settings (age: ' + 
//                 Math.round((Date.now() - this.lastFetch) / 1000) + 's)');
//             return this.cache;
//         }

//         // If already fetching, wait for that promise
//         if (this.fetchPromise) {
//             console.log('⏳ [CompanyConfig] Waiting for ongoing fetch...');
//             return this.fetchPromise;
//         }

//         // Fetch new data
//         console.log('🔄 [CompanyConfig] Cache expired, fetching fresh settings...');
//         this.fetchPromise = this.fetchFromAPI();

//         try {
//             const settings = await this.fetchPromise;
            
//             if (settings) {
//                 this.cache = settings;
//                 this.lastFetch = Date.now();
                
//                 console.log(`✅ [CompanyConfig] Settings updated in cache`);
//                 console.log(`   Company: ${settings.companyName}`);
//                 console.log(`   Payment methods available:`);
//                 console.log(`   - UPI: ${settings.upiIds?.filter(u => u.isActive).length || 0}`);
//                 console.log(`   - GPay: ${settings.gpayNumbers?.filter(g => g.isActive).length || 0}`);
//                 console.log(`   - PhonePe: ${settings.phonePeNumbers?.filter(p => p.isActive).length || 0}`);
//                 console.log(`   - PayTM: ${settings.paytmNumbers?.filter(p => p.isActive).length || 0}`);
//                 console.log(`   - QR: ${settings.qrCode?.isActive ? 'Yes' : 'No'}`);
//                 console.log(`   - Bank: ${settings.bankAccounts?.filter(b => b.isActive).length || 0}`);
//                 console.log(`   Order flow mode: ${settings.orderFlowMode || 'short'}`);
                
//                 return settings;
//             } else {
//                 // Return cached data even if expired (better than nothing)
//                 if (this.cache) {
//                     console.warn('⚠️ [CompanyConfig] Using stale cache due to API failure');
//                     console.warn(`   Cache age: ${Math.round((Date.now() - this.lastFetch) / 1000 / 60)} minutes`);
//                     return this.cache;
//                 }
                
//                 // Ultimate fallback to defaults
//                 console.warn('⚠️ [CompanyConfig] Using DEFAULT settings (API unavailable and no cache)');
//                 return { ...DEFAULT_SETTINGS };
//             }
//         } finally {
//             this.fetchPromise = null;
//         }
//     }

//     // ========== PAYMENT METHOD GETTERS ==========

//     /**
//      * ✅ Get all active UPI IDs
//      */
//     async getActiveUpiIds() {
//         const settings = await this.getSettings();
//         return (settings.upiIds || [])
//             .filter(upi => upi.isActive)
//             .map(upi => upi.id);
//     }

//     /**
//      * ✅ Get all active GPay numbers (with converted UPI format)
//      */
//     async getActiveGpayNumbers() {
//         const settings = await this.getSettings();
//         return (settings.gpayNumbers || [])
//             .filter(gpay => gpay.isActive)
//             .map(gpay => ({
//                 phoneNumber: gpay.phoneNumber,
//                 upiId: gpay.upiId || this.convertPhoneToUpi(gpay.phoneNumber, 'okhdfcbank'),
//                 name: gpay.name,
//                 description: gpay.description
//             }));
//     }

//     /**
//      * ✅ Get all active PhonePe numbers
//      */
//     async getActivePhonePeNumbers() {
//         const settings = await this.getSettings();
//         return (settings.phonePeNumbers || [])
//             .filter(phonepe => phonepe.isActive)
//             .map(phonepe => ({
//                 phoneNumber: phonepe.phoneNumber,
//                 upiId: phonepe.upiId || this.convertPhoneToUpi(phonepe.phoneNumber, 'ybl'),
//                 name: phonepe.name,
//                 description: phonepe.description
//             }));
//     }

//     /**
//      * ✅ Get all active PayTM numbers
//      */
//     async getActivePaytmNumbers() {
//         const settings = await this.getSettings();
//         return (settings.paytmNumbers || [])
//             .filter(paytm => paytm.isActive)
//             .map(paytm => ({
//                 phoneNumber: paytm.phoneNumber,
//                 upiId: paytm.upiId || this.convertPhoneToUpi(paytm.phoneNumber, 'paytm'),
//                 name: paytm.name,
//                 description: paytm.description
//             }));
//     }

//     /**
//      * ✅ Get active QR code
//      */
//     async getActiveQrCode() {
//         const settings = await this.getSettings();
//         if (settings.qrCode?.isActive) {
//             return settings.qrCode;
//         }
//         return null;
//     }

//     /**
//      * ✅ Get active bank accounts
//      */
//     async getActiveBankAccounts() {
//         const settings = await this.getSettings();
//         return (settings.bankAccounts || [])
//             .filter(bank => bank.isActive);
//     }

//     /**
//      * ✅ Get ALL active payment methods (for WhatsApp display)
//      */
//     async getAllPaymentMethods() {
//         const settings = await this.getSettings();
        
//         const methods = [];
        
//         // Add UPI IDs
//         (settings.upiIds || [])
//             .filter(u => u.isActive)
//             .forEach(upi => {
//                 methods.push({
//                     type: 'upi',
//                     id: upi.id,
//                     name: upi.name,
//                     description: upi.description,
//                     appType: upi.appType,
//                     displayValue: upi.id
//                 });
//             });
        
//         // Add GPay numbers
//         (settings.gpayNumbers || [])
//             .filter(g => g.isActive)
//             .forEach(gpay => {
//                 methods.push({
//                     type: 'gpay',
//                     phoneNumber: gpay.phoneNumber,
//                     upiId: gpay.upiId || this.convertPhoneToUpi(gpay.phoneNumber, 'okhdfcbank'),
//                     name: gpay.name,
//                     description: gpay.description,
//                     displayValue: gpay.phoneNumber
//                 });
//             });
        
//         // Add PhonePe numbers
//         (settings.phonePeNumbers || [])
//             .filter(p => p.isActive)
//             .forEach(phonepe => {
//                 methods.push({
//                     type: 'phonepe',
//                     phoneNumber: phonepe.phoneNumber,
//                     upiId: phonepe.upiId || this.convertPhoneToUpi(phonepe.phoneNumber, 'ybl'),
//                     name: phonepe.name,
//                     description: phonepe.description,
//                     displayValue: phonepe.phoneNumber
//                 });
//             });
        
//         // Add PayTM numbers
//         (settings.paytmNumbers || [])
//             .filter(p => p.isActive)
//             .forEach(paytm => {
//                 methods.push({
//                     type: 'paytm',
//                     phoneNumber: paytm.phoneNumber,
//                     upiId: paytm.upiId || this.convertPhoneToUpi(paytm.phoneNumber, 'paytm'),
//                     name: paytm.name,
//                     description: paytm.description,
//                     displayValue: paytm.phoneNumber
//                 });
//             });
        
//         // Add QR code
//         if (settings.qrCode?.isActive) {
//             methods.push({
//                 type: 'qr',
//                 imageUrl: settings.qrCode.imageUrl,
//                 imageData: settings.qrCode.imageData,
//                 description: settings.qrCode.description,
//                 displayValue: 'QR Code'
//             });
//         }
        
//         return methods;
//     }

//     /**
//      * ✅ Convert phone number to UPI format
//      */
//     convertPhoneToUpi(phoneNumber, handle = 'okhdfcbank') {
//         const digits = phoneNumber.replace(/\D/g, '');
//         // Take last 10 digits for UPI
//         const last10 = digits.slice(-10);
//         return `${last10}@${handle}`;
//     }

//     /**
//      * ✅ Validate payment method
//      */
//     async validatePaymentMethod(type, value) {
//         const settings = await this.getSettings();
        
//         switch(type) {
//             case 'upi':
//                 return (settings.upiIds || []).some(u => 
//                     u.isActive && u.id.toLowerCase() === value.toLowerCase()
//                 );
            
//             case 'gpay':
//                 const gpayNumber = value.replace(/\D/g, '');
//                 return (settings.gpayNumbers || []).some(g => 
//                     g.isActive && g.phoneNumber.replace(/\D/g, '') === gpayNumber
//                 );
            
//             case 'phonepe':
//                 const phonepeNumber = value.replace(/\D/g, '');
//                 return (settings.phonePeNumbers || []).some(p => 
//                     p.isActive && p.phoneNumber.replace(/\D/g, '') === phonepeNumber
//                 );
            
//             case 'paytm':
//                 const paytmNumber = value.replace(/\D/g, '');
//                 return (settings.paytmNumbers || []).some(p => 
//                     p.isActive && p.phoneNumber.replace(/\D/g, '') === paytmNumber
//                 );
            
//             default:
//                 return false;
//         }
//     }

//     // ========== ORDER FLOW MODE ==========

//     /**
//      * ✅ Get current order flow mode
//      */
//     async getOrderFlowMode() {
//         try {
//             const settings = await this.getSettings();
//             const mode = settings.orderFlowMode || 'short';
//             console.log(`🔄 [CompanyConfig] Order flow mode: ${mode}`);
//             return mode;
//         } catch (error) {
//             console.error('❌ [CompanyConfig] Error getting order flow mode:', error.message);
//             return 'short';
//         }
//     }

//     // ========== PAYMENT SETTINGS ==========

//     /**
//      * ✅ Get payment settings
//      */
//     async getPaymentSettings() {
//         const settings = await this.getSettings();
//         return settings.paymentSettings || DEFAULT_SETTINGS.paymentSettings;
//     }

//     /**
//      * ✅ Check if auto-verify is enabled
//      */
//     async isAutoVerifyEnabled() {
//         const settings = await this.getPaymentSettings();
//         return settings.autoVerifyEnabled !== false;
//     }

//     /**
//      * ✅ Get minimum confidence for auto-verify
//      */
//     async getMinConfidenceForAuto() {
//         const settings = await this.getPaymentSettings();
//         return settings.minConfidenceForAuto || 85;
//     }

//     // ========== INVOICE & SUPPORT METHODS ==========

//     /**
//      * Get company info for invoice
//      */
//     async getInvoiceInfo() {
//         try {
//             const settings = await this.getSettings();
            
//             if (!settings) {
//                 console.warn('⚠️ [CompanyConfig] Settings is null/undefined, using defaults');
//                 return this.getDefaultInvoiceInfo();
//             }
            
//             return {
//                 companyName: settings.companyName || DEFAULT_SETTINGS.companyName,
//                 legalName: settings.legalName || DEFAULT_SETTINGS.legalName,
//                 tagline: settings.tagline || DEFAULT_SETTINGS.tagline,
//                 address: settings.address || DEFAULT_SETTINGS.address,
//                 city: settings.city || DEFAULT_SETTINGS.city,
//                 gstin: settings.gstin || '',
//                 pan: settings.pan || '',
//                 cin: settings.cin || '',
//                 phone: settings.phone || DEFAULT_SETTINGS.phone,
//                 email: settings.email || DEFAULT_SETTINGS.email,
//                 website: settings.website || DEFAULT_SETTINGS.website,
//                 bank: settings.bank || DEFAULT_SETTINGS.bank,
//                 invoiceSettings: settings.invoiceSettings || DEFAULT_SETTINGS.invoiceSettings,
//                 logo: settings.logo,
//                 signature: settings.signature,
//                 stamp: settings.stamp
//             };
//         } catch (error) {
//             console.error('❌ [CompanyConfig] Error in getInvoiceInfo:', error.message);
//             return this.getDefaultInvoiceInfo();
//         }
//     }

//     getDefaultInvoiceInfo() {
//         return {
//             companyName: DEFAULT_SETTINGS.companyName,
//             legalName: DEFAULT_SETTINGS.legalName,
//             tagline: DEFAULT_SETTINGS.tagline,
//             address: DEFAULT_SETTINGS.address,
//             city: DEFAULT_SETTINGS.city,
//             gstin: DEFAULT_SETTINGS.gstin || '',
//             pan: DEFAULT_SETTINGS.pan || '',
//             cin: DEFAULT_SETTINGS.cin || '',
//             phone: DEFAULT_SETTINGS.phone,
//             email: DEFAULT_SETTINGS.email,
//             website: DEFAULT_SETTINGS.website,
//             bank: DEFAULT_SETTINGS.bank,
//             invoiceSettings: DEFAULT_SETTINGS.invoiceSettings,
//             logo: DEFAULT_SETTINGS.logo,
//             signature: DEFAULT_SETTINGS.signature,
//             stamp: DEFAULT_SETTINGS.stamp
//         };
//     }

//     /**
//      * Get support information
//      */
//     async getSupportInfo() {
//         const settings = await this.getSettings();
        
//         return {
//             email: settings.support?.email || settings.email || DEFAULT_SETTINGS.support.email,
//             phone: settings.support?.phone || settings.phone || DEFAULT_SETTINGS.support.phone,
//             hours: settings.support?.hours || DEFAULT_SETTINGS.support.hours,
//             responseTime: settings.support?.responseTime || DEFAULT_SETTINGS.support.responseTime,
//             address: `${settings.address || DEFAULT_SETTINGS.address}, ${settings.city || DEFAULT_SETTINGS.city}`,
//             social: settings.social || DEFAULT_SETTINGS.social
//         };
//     }

//     /**
//      * Force refresh settings (call after admin updates)
//      */
//     async forceRefresh() {
//         console.log('🔄 [CompanyConfig] Force refreshing settings...');
//         this.lastFetch = null;
//         this.cache = null;
        
//         if (this.refreshTimer) {
//             clearTimeout(this.refreshTimer);
//         }
        
//         return this.getSettings();
//     }

//     /**
//      * Get cache status
//      */
//     getCacheStatus() {
//         return {
//             hasCache: !!this.cache,
//             cacheAge: this.lastFetch ? Date.now() - this.lastFetch : null,
//             cacheAgeMinutes: this.lastFetch ? Math.round((Date.now() - this.lastFetch) / 1000 / 60) : null,
//             isFetching: !!this.fetchPromise,
//             nextRefresh: this.lastFetch ? new Date(this.lastFetch + CACHE_TTL) : null
//         };
//     }

//     /**
//      * Clean up resources
//      */
//     destroy() {
//         if (this.refreshTimer) {
//             clearTimeout(this.refreshTimer);
//             this.refreshTimer = null;
//         }
//         console.log('🧹 [CompanyConfig] Cleaned up');
//     }
// }

// // ==================== EXPORT SINGLETON ====================
// // ✅ FIXED: Using CommonJS module.exports instead of export default

// const companyConfig = new CompanyConfig();

// // Handle process exit
// process.on('SIGINT', () => {
//     companyConfig.destroy();
// });

// process.on('SIGTERM', () => {
//     companyConfig.destroy();
// });

// // Handle uncaught errors
// process.on('uncaughtException', (error) => {
//     console.error('❌ [CompanyConfig] Uncaught exception:', error);
// });

// // ✅ CommonJS export
// export default companyConfig;
























// ==================== CONFIGURATION ====================

const API_BASE_URL = process.env.NEXTJS_API_URL || 'http://localhost:3000';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Default fallback settings (used ONLY if API is completely unavailable)
// These are just placeholders - REAL data comes from API
const DEFAULT_SETTINGS = {
    companyName: 'Your Company Name',
    legalName: 'Your Legal Name',
    tagline: 'Your Tagline',
    phone: '+91 00000 00000',
    email: 'support@yourcompany.com',
    website: 'www.yourcompany.com',
    address: 'Your Address',
    city: 'Your City',
    gstin: '',
    pan: '',
    cin: '',
    
    // ✅ Order flow mode
    orderFlowMode: 'short',
    
    // ========== PAYMENT METHODS ==========
    
    // ✅ UPI IDs (Standard UPI format - name@bank)
    upiIds: [
        {
            id: 'your-business@okaxis',
            name: 'Primary Business UPI',
            appType: 'upi',
            isActive: true,
            description: 'Main UPI ID for business',
            createdAt: new Date().toISOString()
        },
        {
            id: 'your-business@paytm',
            name: 'PayTM UPI',
            appType: 'paytm',
            isActive: true,
            description: 'PayTM UPI ID',
            createdAt: new Date().toISOString()
        }
    ],
    
    // ✅ GPay Numbers (Phone numbers for Google Pay)
    gpayNumbers: [
        {
            phoneNumber: '+919876543210',
            name: 'Primary GPay',
            isActive: true,
            description: 'Main Google Pay number',
            upiId: '9876543210@okhdfcbank', // Auto-converted format
            createdAt: new Date().toISOString()
        }
    ],
    
    // ✅ PhonePe Numbers
    phonePeNumbers: [
        {
            phoneNumber: '+919876543211',
            name: 'Primary PhonePe',
            isActive: true,
            description: 'Main PhonePe number',
            upiId: '9876543211@ybl', // Auto-converted format
            createdAt: new Date().toISOString()
        }
    ],
    
    // ✅ PayTM Numbers
    paytmNumbers: [
        {
            phoneNumber: '+919876543212',
            name: 'Primary PayTM',
            isActive: true,
            description: 'Main PayTM number',
            upiId: '9876543212@paytm', // Auto-converted format
            createdAt: new Date().toISOString()
        }
    ],
    
    // ✅ QR Code (Base64 or URL)
    qrCode: {
        imageUrl: null, // URL to QR code image
        imageData: null, // Base64 encoded QR
        description: 'Scan to pay',
        isActive: true,
        updatedAt: null
    },
    
    // ✅ Bank Accounts (for traditional transfers)
    bankAccounts: [
        {
            accountName: 'Your Business Name',
            accountNumber: '1234567890',
            bankName: 'Your Bank',
            ifscCode: 'BANK0001234',
            branch: 'Main Branch',
            accountType: 'Current',
            isActive: true,
            description: 'Primary bank account',
            createdAt: new Date().toISOString()
        }
    ],
    
    // ✅ Payment Settings
    paymentSettings: {
        preferredMethod: 'upi', // 'upi', 'gpay', 'phonepe', 'paytm', 'qr', 'bank'
        allowPartialPayments: false,
        autoVerifyEnabled: true,
        minConfidenceForAuto: 85,
        paymentTimeout: 30, // minutes
        requireTransactionId: true,
        allowMultiplePaymentMethods: true
    },
    
    // Bank Details (legacy support)
    bank: {
        name: 'Your Bank',
        account: '00000000000',
        ifsc: 'BANK0000000',
        branch: 'Your Branch',
        accountType: 'Current Account'
    },
    
    // Invoice Settings
    invoiceSettings: {
        prefix: 'INV',
        separator: '-',
        dateFormat: 'dd/mm/yyyy',
        currency: '₹',
        taxSystem: 'GST',
        gstBreakdown: true,
        showCGSTSGST: true,
        roundAmount: true,
        paymentTerms: 'Due on receipt',
        deliveryTerms: '3-5 business days after payment confirmation',
        warrantyTerms: '7 days replacement',
        refundPolicy: 'No refunds after processing'
    },
    
    // Support Settings
    support: {
        email: 'support@yourcompany.com',
        phone: '+91 00000 00000',
        hours: 'Mon-Sat, 10:00 AM - 7:00 PM',
        responseTime: 'Within 30 minutes'
    },
    
    // Social Media
    social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
    },
    
    // Theme
    theme: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#27ae60'
    },
    
    // Images
    logo: null,
    signature: null,
    stamp: null
};

// ==================== COMPANY CONFIG CLASS ====================

class CompanyConfig {
    constructor(companyId = null) {
        this.companyId = companyId;
        // ✅ Company-specific cache storage
        this.cache = new Map(); // Map<companyId, settings>
        this.lastFetch = new Map(); // Map<companyId, timestamp>
        this.fetchPromises = new Map(); // Map<companyId, Promise>
        this.refreshTimers = new Map(); // Map<companyId, Timer>
        this.baseUrl = API_BASE_URL;
        
        console.log(`🚀 [CompanyConfig] Initialized for company: ${companyId || 'default'}`);
        console.log(`   Cache TTL: ${CACHE_TTL/1000}s, Timeout: ${REQUEST_TIMEOUT/1000}s`);
    }

    /**
     * Get cache key for company
     */
    _getCacheKey(companyId = null) {
        return companyId || this.companyId || 'default';
    }

    /**
     * Make API request with timeout and company context
     */
    async apiRequest(endpoint, companyId = null) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
        const targetCompanyId = companyId || this.companyId;

        try {
            // ✅ Add companyId to URL if present
            const url = targetCompanyId 
                ? `${this.baseUrl}${endpoint}?companyId=${targetCompanyId}`
                : `${this.baseUrl}${endpoint}`;
            
            console.log(`🌐 [CompanyConfig] Fetching for company ${targetCompanyId || 'default'}: ${url}`);
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'API request failed');
            }

            console.log(`✅ [CompanyConfig] API response received for company ${targetCompanyId || 'default'}`);
            return data.data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error(`❌ [CompanyConfig] Request timeout after ${REQUEST_TIMEOUT}ms for company ${targetCompanyId || 'default'}`);
                throw new Error('Request timeout');
            }
            
            console.error(`❌ [CompanyConfig] API request failed for company ${targetCompanyId || 'default'}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch fresh settings from API for specific company
     */
    async fetchFromAPI(companyId = null) {
        const targetCompanyId = companyId || this.companyId;
        
        try {
            const settings = await this.apiRequest('/api/company-settings', targetCompanyId);
            console.log(`✅ [CompanyConfig] Settings fetched from API successfully for company ${targetCompanyId || 'default'}`);
            
            // Log what we got
            console.log(`📊 [CompanyConfig] Company: ${settings.companyName}`);
            console.log(`📊 [CompanyConfig] Active UPI IDs: ${settings.upiIds?.filter(u => u.isActive).length || 0}`);
            console.log(`📊 [CompanyConfig] Active GPay Numbers: ${settings.gpayNumbers?.filter(g => g.isActive).length || 0}`);
            console.log(`📊 [CompanyConfig] Active PhonePe Numbers: ${settings.phonePeNumbers?.filter(p => p.isActive).length || 0}`);
            console.log(`📊 [CompanyConfig] Active PayTM Numbers: ${settings.paytmNumbers?.filter(p => p.isActive).length || 0}`);
            console.log(`📊 [CompanyConfig] QR Code Active: ${settings.qrCode?.isActive ? '✅ Yes' : '❌ No'}`);
            console.log(`📊 [CompanyConfig] Active Bank Accounts: ${settings.bankAccounts?.filter(b => b.isActive).length || 0}`);
            console.log(`📊 [CompanyConfig] Order flow mode: ${settings.orderFlowMode || 'short'}`);
            
            return settings;

        } catch (error) {
            console.error(`❌ [CompanyConfig] API fetch failed for company ${targetCompanyId || 'default'}:`, error.message);
            
            if (error.message.includes('ECONNREFUSED')) {
                console.error(`💡 Make sure Next.js server is running at ${this.baseUrl}`);
            }
            
            return null;
        }
    }

    /**
     * Get settings for specific company (with caching)
     */
    async getSettings(companyId = null) {
        const cacheKey = this._getCacheKey(companyId);
        
        // If cache is valid, return it
        if (this.cache.has(cacheKey) && 
            this.lastFetch.has(cacheKey) && 
            (Date.now() - this.lastFetch.get(cacheKey) < CACHE_TTL)) {
            
            const cacheAge = Math.round((Date.now() - this.lastFetch.get(cacheKey)) / 1000);
            console.log(`📦 [CompanyConfig] Returning cached settings for company ${cacheKey} (age: ${cacheAge}s)`);
            return this.cache.get(cacheKey);
        }

        // If already fetching for this company, wait for that promise
        if (this.fetchPromises.has(cacheKey)) {
            console.log(`⏳ [CompanyConfig] Waiting for ongoing fetch for company ${cacheKey}...`);
            return this.fetchPromises.get(cacheKey);
        }

        // Fetch new data
        console.log(`🔄 [CompanyConfig] Cache expired for company ${cacheKey}, fetching fresh settings...`);
        
        const fetchPromise = this.fetchFromAPI(companyId);
        this.fetchPromises.set(cacheKey, fetchPromise);

        try {
            const settings = await fetchPromise;
            
            if (settings) {
                this.cache.set(cacheKey, settings);
                this.lastFetch.set(cacheKey, Date.now());
                
                console.log(`✅ [CompanyConfig] Settings updated in cache for company ${cacheKey}`);
                console.log(`   Company: ${settings.companyName}`);
                console.log(`   Payment methods available:`);
                console.log(`   - UPI: ${settings.upiIds?.filter(u => u.isActive).length || 0}`);
                console.log(`   - GPay: ${settings.gpayNumbers?.filter(g => g.isActive).length || 0}`);
                console.log(`   - PhonePe: ${settings.phonePeNumbers?.filter(p => p.isActive).length || 0}`);
                console.log(`   - PayTM: ${settings.paytmNumbers?.filter(p => p.isActive).length || 0}`);
                console.log(`   - QR: ${settings.qrCode?.isActive ? 'Yes' : 'No'}`);
                console.log(`   - Bank: ${settings.bankAccounts?.filter(b => b.isActive).length || 0}`);
                console.log(`   Order flow mode: ${settings.orderFlowMode || 'short'}`);
                
                return settings;
            } else {
                // Return cached data even if expired (better than nothing)
                if (this.cache.has(cacheKey)) {
                    const cacheAge = Math.round((Date.now() - this.lastFetch.get(cacheKey)) / 1000 / 60);
                    console.warn(`⚠️ [CompanyConfig] Using stale cache for company ${cacheKey} due to API failure (age: ${cacheAge} minutes)`);
                    return this.cache.get(cacheKey);
                }
                
                // Ultimate fallback to defaults
                console.warn(`⚠️ [CompanyConfig] Using DEFAULT settings for company ${cacheKey} (API unavailable and no cache)`);
                return { ...DEFAULT_SETTINGS };
            }
        } finally {
            this.fetchPromises.delete(cacheKey);
        }
    }

    // ========== PAYMENT METHOD GETTERS ==========

    /**
     * ✅ Get all active UPI IDs for specific company
     */
    async getActiveUpiIds(companyId = null) {
        const settings = await this.getSettings(companyId);
        return (settings.upiIds || [])
            .filter(upi => upi.isActive)
            .map(upi => upi.id);
    }

    /**
     * ✅ Get all active GPay numbers for specific company (with converted UPI format)
     */
    async getActiveGpayNumbers(companyId = null) {
        const settings = await this.getSettings(companyId);
        return (settings.gpayNumbers || [])
            .filter(gpay => gpay.isActive)
            .map(gpay => ({
                phoneNumber: gpay.phoneNumber,
                upiId: gpay.upiId || this.convertPhoneToUpi(gpay.phoneNumber, 'okhdfcbank'),
                name: gpay.name,
                description: gpay.description
            }));
    }

    /**
     * ✅ Get all active PhonePe numbers for specific company
     */
    async getActivePhonePeNumbers(companyId = null) {
        const settings = await this.getSettings(companyId);
        return (settings.phonePeNumbers || [])
            .filter(phonepe => phonepe.isActive)
            .map(phonepe => ({
                phoneNumber: phonepe.phoneNumber,
                upiId: phonepe.upiId || this.convertPhoneToUpi(phonepe.phoneNumber, 'ybl'),
                name: phonepe.name,
                description: phonepe.description
            }));
    }

    /**
     * ✅ Get all active PayTM numbers for specific company
     */
    async getActivePaytmNumbers(companyId = null) {
        const settings = await this.getSettings(companyId);
        return (settings.paytmNumbers || [])
            .filter(paytm => paytm.isActive)
            .map(paytm => ({
                phoneNumber: paytm.phoneNumber,
                upiId: paytm.upiId || this.convertPhoneToUpi(paytm.phoneNumber, 'paytm'),
                name: paytm.name,
                description: paytm.description
            }));
    }

    /**
     * ✅ Get active QR code for specific company
     */
    async getActiveQrCode(companyId = null) {
        const settings = await this.getSettings(companyId);
        if (settings.qrCode?.isActive) {
            return settings.qrCode;
        }
        return null;
    }

    /**
     * ✅ Get active bank accounts for specific company
     */
    async getActiveBankAccounts(companyId = null) {
        const settings = await this.getSettings(companyId);
        return (settings.bankAccounts || [])
            .filter(bank => bank.isActive);
    }

    /**
     * ✅ Get ALL active payment methods for specific company (for WhatsApp display)
     */
    async getAllPaymentMethods(companyId = null) {
        const settings = await this.getSettings(companyId);
        
        const methods = [];
        
        // Add UPI IDs
        (settings.upiIds || [])
            .filter(u => u.isActive)
            .forEach(upi => {
                methods.push({
                    type: 'upi',
                    id: upi.id,
                    name: upi.name,
                    description: upi.description,
                    appType: upi.appType,
                    displayValue: upi.id
                });
            });
        
        // Add GPay numbers
        (settings.gpayNumbers || [])
            .filter(g => g.isActive)
            .forEach(gpay => {
                methods.push({
                    type: 'gpay',
                    phoneNumber: gpay.phoneNumber,
                    upiId: gpay.upiId || this.convertPhoneToUpi(gpay.phoneNumber, 'okhdfcbank'),
                    name: gpay.name,
                    description: gpay.description,
                    displayValue: gpay.phoneNumber
                });
            });
        
        // Add PhonePe numbers
        (settings.phonePeNumbers || [])
            .filter(p => p.isActive)
            .forEach(phonepe => {
                methods.push({
                    type: 'phonepe',
                    phoneNumber: phonepe.phoneNumber,
                    upiId: phonepe.upiId || this.convertPhoneToUpi(phonepe.phoneNumber, 'ybl'),
                    name: phonepe.name,
                    description: phonepe.description,
                    displayValue: phonepe.phoneNumber
                });
            });
        
        // Add PayTM numbers
        (settings.paytmNumbers || [])
            .filter(p => p.isActive)
            .forEach(paytm => {
                methods.push({
                    type: 'paytm',
                    phoneNumber: paytm.phoneNumber,
                    upiId: paytm.upiId || this.convertPhoneToUpi(paytm.phoneNumber, 'paytm'),
                    name: paytm.name,
                    description: paytm.description,
                    displayValue: paytm.phoneNumber
                });
            });
        
        // Add QR code
        if (settings.qrCode?.isActive) {
            methods.push({
                type: 'qr',
                imageUrl: settings.qrCode.imageUrl,
                imageData: settings.qrCode.imageData,
                description: settings.qrCode.description,
                displayValue: 'QR Code'
            });
        }
        
        return methods;
    }

    /**
     * ✅ Convert phone number to UPI format
     */
    convertPhoneToUpi(phoneNumber, handle = 'okhdfcbank') {
        const digits = phoneNumber.replace(/\D/g, '');
        // Take last 10 digits for UPI
        const last10 = digits.slice(-10);
        return `${last10}@${handle}`;
    }

    /**
     * ✅ Validate payment method for specific company
     */
    async validatePaymentMethod(type, value, companyId = null) {
        const settings = await this.getSettings(companyId);
        
        switch(type) {
            case 'upi':
                return (settings.upiIds || []).some(u => 
                    u.isActive && u.id.toLowerCase() === value.toLowerCase()
                );
            
            case 'gpay':
                const gpayNumber = value.replace(/\D/g, '');
                return (settings.gpayNumbers || []).some(g => 
                    g.isActive && g.phoneNumber.replace(/\D/g, '') === gpayNumber
                );
            
            case 'phonepe':
                const phonepeNumber = value.replace(/\D/g, '');
                return (settings.phonePeNumbers || []).some(p => 
                    p.isActive && p.phoneNumber.replace(/\D/g, '') === phonepeNumber
                );
            
            case 'paytm':
                const paytmNumber = value.replace(/\D/g, '');
                return (settings.paytmNumbers || []).some(p => 
                    p.isActive && p.phoneNumber.replace(/\D/g, '') === paytmNumber
                );
            
            default:
                return false;
        }
    }

    // ========== ORDER FLOW MODE ==========

    /**
     * ✅ Get current order flow mode for specific company
     */
    async getOrderFlowMode(companyId = null) {
        try {
            const settings = await this.getSettings(companyId);
            const mode = settings.orderFlowMode || 'short';
            console.log(`🔄 [CompanyConfig] Order flow mode for company ${companyId || 'default'}: ${mode}`);
            return mode;
        } catch (error) {
            console.error('❌ [CompanyConfig] Error getting order flow mode:', error.message);
            return 'short';
        }
    }

    // ========== PAYMENT SETTINGS ==========

    /**
     * ✅ Get payment settings for specific company
     */
    async getPaymentSettings(companyId = null) {
        const settings = await this.getSettings(companyId);
        return settings.paymentSettings || DEFAULT_SETTINGS.paymentSettings;
    }

    /**
     * ✅ Check if auto-verify is enabled for specific company
     */
    async isAutoVerifyEnabled(companyId = null) {
        const settings = await this.getPaymentSettings(companyId);
        return settings.autoVerifyEnabled !== false;
    }

    /**
     * ✅ Get minimum confidence for auto-verify for specific company
     */
    async getMinConfidenceForAuto(companyId = null) {
        const settings = await this.getPaymentSettings(companyId);
        return settings.minConfidenceForAuto || 85;
    }

    // ========== INVOICE & SUPPORT METHODS ==========

    /**
     * Get company info for invoice for specific company
     */
    async getInvoiceInfo(companyId = null) {
        try {
            const settings = await this.getSettings(companyId);
            
            if (!settings) {
                console.warn(`⚠️ [CompanyConfig] Settings is null/undefined for company ${companyId || 'default'}, using defaults`);
                return this.getDefaultInvoiceInfo();
            }
            
            return {
                companyName: settings.companyName || DEFAULT_SETTINGS.companyName,
                legalName: settings.legalName || DEFAULT_SETTINGS.legalName,
                tagline: settings.tagline || DEFAULT_SETTINGS.tagline,
                address: settings.address || DEFAULT_SETTINGS.address,
                city: settings.city || DEFAULT_SETTINGS.city,
                gstin: settings.gstin || '',
                pan: settings.pan || '',
                cin: settings.cin || '',
                phone: settings.phone || DEFAULT_SETTINGS.phone,
                email: settings.email || DEFAULT_SETTINGS.email,
                website: settings.website || DEFAULT_SETTINGS.website,
                bank: settings.bank || DEFAULT_SETTINGS.bank,
                invoiceSettings: settings.invoiceSettings || DEFAULT_SETTINGS.invoiceSettings,
                logo: settings.logo,
                signature: settings.signature,
                stamp: settings.stamp,
                companyId: companyId || this.companyId
            };
        } catch (error) {
            console.error(`❌ [CompanyConfig] Error in getInvoiceInfo for company ${companyId || 'default'}:`, error.message);
            return this.getDefaultInvoiceInfo();
        }
    }

    getDefaultInvoiceInfo() {
        return {
            companyName: DEFAULT_SETTINGS.companyName,
            legalName: DEFAULT_SETTINGS.legalName,
            tagline: DEFAULT_SETTINGS.tagline,
            address: DEFAULT_SETTINGS.address,
            city: DEFAULT_SETTINGS.city,
            gstin: DEFAULT_SETTINGS.gstin || '',
            pan: DEFAULT_SETTINGS.pan || '',
            cin: DEFAULT_SETTINGS.cin || '',
            phone: DEFAULT_SETTINGS.phone,
            email: DEFAULT_SETTINGS.email,
            website: DEFAULT_SETTINGS.website,
            bank: DEFAULT_SETTINGS.bank,
            invoiceSettings: DEFAULT_SETTINGS.invoiceSettings,
            logo: DEFAULT_SETTINGS.logo,
            signature: DEFAULT_SETTINGS.signature,
            stamp: DEFAULT_SETTINGS.stamp
        };
    }

    /**
     * Get support information for specific company
     */
    async getSupportInfo(companyId = null) {
        const settings = await this.getSettings(companyId);
        
        return {
            email: settings.support?.email || settings.email || DEFAULT_SETTINGS.support.email,
            phone: settings.support?.phone || settings.phone || DEFAULT_SETTINGS.support.phone,
            hours: settings.support?.hours || DEFAULT_SETTINGS.support.hours,
            responseTime: settings.support?.responseTime || DEFAULT_SETTINGS.support.responseTime,
            address: `${settings.address || DEFAULT_SETTINGS.address}, ${settings.city || DEFAULT_SETTINGS.city}`,
            social: settings.social || DEFAULT_SETTINGS.social,
            companyId: companyId || this.companyId
        };
    }

    /**
     * Force refresh settings for specific company (call after admin updates)
     */
    async forceRefresh(companyId = null) {
        const cacheKey = this._getCacheKey(companyId);
        console.log(`🔄 [CompanyConfig] Force refreshing settings for company ${cacheKey}...`);
        
        this.lastFetch.delete(cacheKey);
        this.cache.delete(cacheKey);
        
        if (this.refreshTimers.has(cacheKey)) {
            clearTimeout(this.refreshTimers.get(cacheKey));
            this.refreshTimers.delete(cacheKey);
        }
        
        return this.getSettings(companyId);
    }

    /**
     * Get cache status for specific company or all companies
     */
    getCacheStatus(companyId = null) {
        if (companyId) {
            const cacheKey = this._getCacheKey(companyId);
            return {
                companyId: cacheKey,
                hasCache: this.cache.has(cacheKey),
                cacheAge: this.lastFetch.has(cacheKey) ? Date.now() - this.lastFetch.get(cacheKey) : null,
                cacheAgeMinutes: this.lastFetch.has(cacheKey) ? 
                    Math.round((Date.now() - this.lastFetch.get(cacheKey)) / 1000 / 60) : null,
                isFetching: this.fetchPromises.has(cacheKey),
                nextRefresh: this.lastFetch.has(cacheKey) ? 
                    new Date(this.lastFetch.get(cacheKey) + CACHE_TTL) : null
            };
        }

        // Return status for all companies
        const allStatus = {};
        for (const [key, lastFetch] of this.lastFetch.entries()) {
            allStatus[key] = {
                hasCache: this.cache.has(key),
                cacheAge: Date.now() - lastFetch,
                cacheAgeMinutes: Math.round((Date.now() - lastFetch) / 1000 / 60),
                isFetching: this.fetchPromises.has(key),
                nextRefresh: new Date(lastFetch + CACHE_TTL)
            };
        }
        return allStatus;
    }

    /**
     * Clear cache for specific company or all companies
     */
    clearCache(companyId = null) {
        if (companyId) {
            const cacheKey = this._getCacheKey(companyId);
            this.cache.delete(cacheKey);
            this.lastFetch.delete(cacheKey);
            if (this.refreshTimers.has(cacheKey)) {
                clearTimeout(this.refreshTimers.get(cacheKey));
                this.refreshTimers.delete(cacheKey);
            }
            console.log(`🧹 [CompanyConfig] Cleared cache for company ${cacheKey}`);
        } else {
            this.cache.clear();
            this.lastFetch.clear();
            for (const timer of this.refreshTimers.values()) {
                clearTimeout(timer);
            }
            this.refreshTimers.clear();
            console.log(`🧹 [CompanyConfig] Cleared cache for ALL companies`);
        }
    }

    /**
     * Get list of all cached companies
     */
    getCachedCompanies() {
        return Array.from(this.cache.keys()).map(key => ({
            companyId: key,
            cacheAge: this.lastFetch.has(key) ? Date.now() - this.lastFetch.get(key) : null,
            cacheAgeMinutes: this.lastFetch.has(key) ? 
                Math.round((Date.now() - this.lastFetch.get(key)) / 1000 / 60) : null
        }));
    }

    /**
     * Warm up cache for multiple companies
     */
    async warmUpCache(companyIds) {
        console.log(`🔥 [CompanyConfig] Warming up cache for ${companyIds.length} companies`);
        
        const results = await Promise.allSettled(
            companyIds.map(id => this.getSettings(id))
        );
        
        const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
        console.log(`✅ [CompanyConfig] Cache warmed up for ${successCount}/${companyIds.length} companies`);
        
        return {
            total: companyIds.length,
            success: successCount,
            failed: companyIds.length - successCount
        };
    }

    /**
     * Clean up resources for specific company or all
     */
    destroy(companyId = null) {
        if (companyId) {
            const cacheKey = this._getCacheKey(companyId);
            if (this.refreshTimers.has(cacheKey)) {
                clearTimeout(this.refreshTimers.get(cacheKey));
                this.refreshTimers.delete(cacheKey);
            }
            console.log(`🧹 [CompanyConfig] Cleaned up resources for company ${cacheKey}`);
        } else {
            for (const timer of this.refreshTimers.values()) {
                clearTimeout(timer);
            }
            this.refreshTimers.clear();
            console.log('🧹 [CompanyConfig] Cleaned up all resources');
        }
    }
}

// ==================== EXPORT SINGLETON ====================
// Create instance without default company - companyId will be passed in methods
const companyConfig = new CompanyConfig();

// Handle process exit
process.on('SIGINT', () => {
    companyConfig.destroy();
});

process.on('SIGTERM', () => {
    companyConfig.destroy();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ [CompanyConfig] Uncaught exception:', error);
});

// Export the instance
export default companyConfig;