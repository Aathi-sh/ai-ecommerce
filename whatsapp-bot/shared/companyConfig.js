/**
 * COMPANY CONFIGURATION MANAGER
 * 
 * Fetches company settings from Next.js API endpoints
 * NO DIRECT DATABASE CONNECTION NEEDED!
 * 
 * Features:
 * - Fetches real-time settings from Next.js API
 * - 5-minute cache with auto-refresh
 * - Fallback defaults if API is unavailable
 * - Auto-updates when admin changes settings via API
 */

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
    
    // UPI IDs - These will be OVERWRITTEN by API data
    upiIds: [
        {
            id: 'your-upi@oksbi',
            name: 'Primary UPI',
            appType: 'other',
            isActive: true,
            description: 'Main business UPI ID'
        }
    ],
    
    // Bank Details
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
    constructor() {
        this.cache = null;
        this.lastFetch = null;
        this.fetchPromise = null;
        this.refreshTimer = null;
        this.baseUrl = API_BASE_URL;
        
        console.log(`🚀 [CompanyConfig] Initialized with API URL: ${this.baseUrl}`);
    }

    /**
     * Make API request with timeout
     */
    async apiRequest(endpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            console.log(`🌐 [CompanyConfig] Fetching: ${this.baseUrl}${endpoint}`);
            
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
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

            console.log(`✅ [CompanyConfig] API response received`);
            return data.data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                console.error(`❌ [CompanyConfig] Request timeout after ${REQUEST_TIMEOUT}ms`);
                throw new Error('Request timeout');
            }
            
            console.error(`❌ [CompanyConfig] API request failed:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch fresh settings from API
     */
    async fetchFromAPI() {
        try {
            const settings = await this.apiRequest('/api/company-settings');
            console.log('✅ [CompanyConfig] Settings fetched from API successfully');
            
            // Log what we got (without sensitive data)
            console.log(`📊 [CompanyConfig] Company: ${settings.companyName}`);
            console.log(`📊 [CompanyConfig] Active UPI IDs: ${settings.upiIds?.filter(u => u.isActive).length || 0}`);
            
            return settings;

        } catch (error) {
            console.error('❌ [CompanyConfig] API fetch failed:', error.message);
            
            // Log more details about the error
            if (error.message.includes('ECONNREFUSED')) {
                console.error(`💡 Make sure Next.js server is running at ${this.baseUrl}`);
            }
            
            return null;
        }
    }

    /**
     * Get settings (with caching)
     * 
     * @returns {Promise<Object>} Company settings from API or fallback defaults
     */
    async getSettings() {
        // If cache is valid, return it
        if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < CACHE_TTL)) {
            console.log('📦 [CompanyConfig] Returning cached settings (age: ' + 
                Math.round((Date.now() - this.lastFetch) / 1000) + 's)');
            return this.cache;
        }

        // If already fetching, wait for that promise
        if (this.fetchPromise) {
            console.log('⏳ [CompanyConfig] Waiting for ongoing fetch...');
            return this.fetchPromise;
        }

        // Fetch new data
        console.log('🔄 [CompanyConfig] Cache expired, fetching fresh settings...');
        this.fetchPromise = this.fetchFromAPI();

        try {
            const settings = await this.fetchPromise;
            
            if (settings) {
                // ✅ CRITICAL: Cache the REAL data from API
                this.cache = settings;
                this.lastFetch = Date.now();
                this.setupAutoRefresh();
                
                console.log(`✅ [CompanyConfig] Settings updated in cache`);
                console.log(`   Company: ${settings.companyName}`);
                console.log(`   UPI IDs: ${settings.upiIds?.length || 0} total, ${settings.upiIds?.filter(u => u.isActive).length || 0} active`);
                
                return settings;
            } else {
                // Return cached data even if expired (better than nothing)
                if (this.cache) {
                    console.warn('⚠️ [CompanyConfig] Using stale cache due to API failure');
                    console.warn(`   Cache age: ${Math.round((Date.now() - this.lastFetch) / 1000 / 60)} minutes`);
                    return this.cache;
                }
                
                // Ultimate fallback to defaults (only if absolutely nothing works)
                console.warn('⚠️ [CompanyConfig] Using DEFAULT settings (API unavailable and no cache)');
                console.warn(`   Check: Is Next.js server running at ${this.baseUrl}?`);
                return { ...DEFAULT_SETTINGS }; // Return copy of defaults
            }
        } finally {
            this.fetchPromise = null;
        }
    }

    /**
     * Setup auto-refresh timer
     */
    setupAutoRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        this.refreshTimer = setTimeout(async () => {
            console.log('🔄 [CompanyConfig] Auto-refreshing settings...');
            await this.getSettings();
        }, CACHE_TTL);
    }

    /**
     * Get active UPI IDs (for payment verification)
     * 
     * @returns {Promise<string[]>} Array of active UPI ID strings
     */
    async getActiveUpiIds() {
        const settings = await this.getSettings();
        const activeUpiIds = (settings.upiIds || [])
            .filter(upi => upi.isActive)
            .map(upi => upi.id);
        
        console.log(`💰 [CompanyConfig] Active UPI IDs: ${activeUpiIds.join(', ') || 'None'}`);
        return activeUpiIds;
    }

    /**
     * Get active UPI IDs with full details
     * 
     * @returns {Promise<Array>} Array of active UPI objects with all details
     */
    async getActiveUpiDetails() {
        const settings = await this.getSettings();
        const activeUpiDetails = (settings.upiIds || []).filter(upi => upi.isActive);
        
        console.log(`💰 [CompanyConfig] Active UPI details: ${activeUpiDetails.length} found`);
        return activeUpiDetails;
    }

    /**
     * Check if UPI ID is valid and active
     * 
     * @param {string} upiId - UPI ID to check
     * @returns {Promise<boolean>} True if valid and active
     */
    async isValidUpiId(upiId) {
        if (!upiId) return false;
        
        const settings = await this.getSettings();
        const isValid = (settings.upiIds || []).some(upi => 
            upi.isActive && upi.id.toLowerCase() === upiId.toLowerCase()
        );
        
        console.log(`🔍 [CompanyConfig] UPI ID ${upiId} is ${isValid ? '✅ valid' : '❌ invalid'}`);
        return isValid;
    }

    /**
     * Get company info for invoice
     * 
     * @returns {Promise<Object>} Formatted company info for invoices
     */
    async getInvoiceInfo() {
        const settings = await this.getSettings();
        
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
            stamp: settings.stamp
        };
    }

    /**
     * Get support information
     * 
     * @returns {Promise<Object>} Formatted support info
     */
    async getSupportInfo() {
        const settings = await this.getSettings();
        
        return {
            email: settings.support?.email || settings.email || DEFAULT_SETTINGS.support.email,
            phone: settings.support?.phone || settings.phone || DEFAULT_SETTINGS.support.phone,
            hours: settings.support?.hours || DEFAULT_SETTINGS.support.hours,
            responseTime: settings.support?.responseTime || DEFAULT_SETTINGS.support.responseTime,
            address: `${settings.address || DEFAULT_SETTINGS.address}, ${settings.city || DEFAULT_SETTINGS.city}`,
            social: settings.social || DEFAULT_SETTINGS.social
        };
    }

    /**
     * Get bank details
     * 
     * @returns {Promise<Object>} Bank details
     */
    async getBankDetails() {
        const settings = await this.getSettings();
        return settings.bank || DEFAULT_SETTINGS.bank;
    }

    /**
     * Force refresh settings (call after admin updates)
     * 
     * @returns {Promise<Object>} Fresh settings from API
     */
    async forceRefresh() {
        console.log('🔄 [CompanyConfig] Force refreshing settings...');
        this.lastFetch = null; // Invalidate cache
        this.cache = null;
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        console.log('🔄 [CompanyConfig] Cache cleared, fetching fresh data...');
        return this.getSettings();
    }

    /**
     * Get specific setting by path (dot notation)
     * 
     * @param {string} path - Dot notation path (e.g., 'bank.name')
     * @returns {Promise<any>} Value at path or undefined
     */
    async get(path) {
        const settings = await this.getSettings();
        
        return path.split('.').reduce((obj, key) => 
            obj && obj[key] !== undefined ? obj[key] : undefined, settings);
    }

    /**
     * Check if API is reachable
     * 
     * @returns {Promise<boolean>} True if API is reachable
     */
    async healthCheck() {
        try {
            await this.apiRequest('/api/company-settings');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get cache status
     * 
     * @returns {Object} Cache status info
     */
    getCacheStatus() {
        return {
            hasCache: !!this.cache,
            cacheAge: this.lastFetch ? Date.now() - this.lastFetch : null,
            cacheAgeMinutes: this.lastFetch ? Math.round((Date.now() - this.lastFetch) / 1000 / 60) : null,
            isFetching: !!this.fetchPromise,
            nextRefresh: this.lastFetch ? new Date(this.lastFetch + CACHE_TTL) : null
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        console.log('🧹 [CompanyConfig] Cleaned up');
    }
}

// ==================== EXPORT SINGLETON ====================

// Create and export a single instance (singleton pattern)
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

export default companyConfig;