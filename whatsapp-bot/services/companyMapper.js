// // services/companyMapper.js
// // PROFESSIONAL COMPANY MAPPER - Routes incoming messages to correct company
// // Maps phone numbers to company IDs with caching and real-time updates

// import { EventEmitter } from 'events';
// import Company from '../models/Company.js';
// import redis from 'redis'; // Optional: for distributed caching
// import { promisify } from 'util';

// class CompanyMapper extends EventEmitter {
//     constructor() {
//         super();
        
//         // In-memory cache: Map<phoneNumber, { companyId, expiresAt }>
//         this.cache = new Map();
        
//         // Reverse cache: Map<companyId, Set<phoneNumbers>>
//         this.companyPhoneCache = new Map();
        
//         // Configuration
//         this.config = {
//             cacheTTL: 300000, // 5 minutes (matches your companyConfig.js)
//             maxCacheSize: 10000, // Maximum cache entries
//             cleanupInterval: 60000, // 1 minute
//             redisEnabled: false,
//             redisPrefix: 'company:phone:'
//         };
        
//         // Cache statistics
//         this.stats = {
//             hits: 0,
//             misses: 0,
//             size: 0,
//             lastCleanup: new Date()
//         };
        
//         // Redis client (optional, for distributed systems)
//         this.redisClient = null;
//         this.redisGet = null;
//         this.redisSet = null;
//         this.redisDel = null;
        
//         // Start cache cleanup interval
//         this.startCleanupInterval();
        
//         console.log('📞 [CompanyMapper] Initialized');
//     }

//     /**
//      * Initialize Redis connection (optional, for distributed deployment)
//      * @param {Object} redisConfig - Redis configuration
//      */
//     async initRedis(redisConfig = {}) {
//         try {
//             const redisUrl = redisConfig.url || process.env.REDIS_URL;
            
//             if (!redisUrl) {
//                 console.log('ℹ️ [CompanyMapper] Redis not configured, using in-memory cache only');
//                 return;
//             }
            
//             this.redisClient = redis.createClient({
//                 url: redisUrl,
//                 ...redisConfig
//             });
            
//             // Promisify Redis commands
//             this.redisGet = promisify(this.redisClient.get).bind(this.redisClient);
//             this.redisSet = promisify(this.redisClient.setex).bind(this.redisClient);
//             this.redisDel = promisify(this.redisClient.del).bind(this.redisClient);
            
//             this.redisClient.on('error', (error) => {
//                 console.error('❌ [CompanyMapper] Redis error:', error);
//                 this.redisEnabled = false;
//             });
            
//             this.redisClient.on('connect', () => {
//                 console.log('✅ [CompanyMapper] Redis connected');
//                 this.config.redisEnabled = true;
//             });
            
//             await this.redisClient.connect();
            
//         } catch (error) {
//             console.error('❌ [CompanyMapper] Redis initialization failed:', error);
//             this.config.redisEnabled = false;
//         }
//     }

//     /**
//      * Start cache cleanup interval
//      */
//     startCleanupInterval() {
//         setInterval(() => {
//             this.cleanupCache();
//         }, this.config.cleanupInterval);
//     }

//     /**
//      * Clean up expired cache entries
//      */
//     cleanupCache() {
//         const now = Date.now();
//         let removed = 0;
        
//         this.cache.forEach((value, key) => {
//             if (value.expiresAt < now) {
//                 this.cache.delete(key);
//                 removed++;
//             }
//         });
        
//         this.stats.size = this.cache.size;
//         this.stats.lastCleanup = new Date();
        
//         if (removed > 0) {
//             console.log(`🧹 [CompanyMapper] Cleaned up ${removed} expired cache entries`);
//         }
//     }

//     /**
//      * Generate cache key for phone number
//      * @param {string} phoneNumber - Phone number
//      * @returns {string} Cache key
//      */
//     getCacheKey(phoneNumber) {
//         // Normalize phone number: remove all non-digits
//         const normalized = phoneNumber.replace(/\D/g, '');
//         return `phone:${normalized}`;
//     }

//     /**
//      * Normalize phone number for consistent lookup
//      * @param {string} phoneNumber - Phone number
//      * @returns {string} Normalized phone number
//      */
//     normalizePhoneNumber(phoneNumber) {
//         if (!phoneNumber) return '';
        
//         // Remove all non-digits
//         let normalized = phoneNumber.replace(/\D/g, '');
        
//         // Handle Indian numbers (with or without 91)
//         if (normalized.length === 12 && normalized.startsWith('91')) {
//             normalized = normalized.substring(2);
//         } else if (normalized.length === 11 && normalized.startsWith('0')) {
//             normalized = normalized.substring(1);
//         }
        
//         // Ensure we have 10 digits
//         if (normalized.length === 10) {
//             return normalized;
//         } else if (normalized.length > 10) {
//             // Take last 10 digits
//             return normalized.slice(-10);
//         }
        
//         return normalized;
//     }

//     /**
//      * Get company ID by phone number
//      * @param {string} phoneNumber - WhatsApp phone number
//      * @param {Object} options - Options (skipCache, useRedis)
//      * @returns {Promise<string|null>} Company ID or null
//      */
//     async getCompanyIdByPhone(phoneNumber, options = {}) {
//         try {
//             const normalized = this.normalizePhoneNumber(phoneNumber);
            
//             if (!normalized) {
//                 console.log(`⚠️ [CompanyMapper] Invalid phone number: ${phoneNumber}`);
//                 return null;
//             }
            
//             const cacheKey = this.getCacheKey(normalized);
            
//             // ===== CHECK CACHE (In-Memory) =====
//             if (!options.skipCache) {
//                 const cached = this.cache.get(cacheKey);
//                 if (cached && cached.expiresAt > Date.now()) {
//                     this.stats.hits++;
//                     console.log(`✅ [CompanyMapper] Cache hit for ${normalized} -> ${cached.companyId}`);
//                     return cached.companyId;
//                 }
//             }
            
//             // ===== CHECK REDIS (if enabled) =====
//             if (this.config.redisEnabled && !options.skipRedis && this.redisGet) {
//                 try {
//                     const redisValue = await this.redisGet(`${this.config.redisPrefix}${normalized}`);
//                     if (redisValue) {
//                         const { companyId, expiresAt } = JSON.parse(redisValue);
                        
//                         // Update in-memory cache
//                         this.cache.set(cacheKey, { companyId, expiresAt });
                        
//                         this.stats.hits++;
//                         console.log(`✅ [CompanyMapper] Redis cache hit for ${normalized} -> ${companyId}`);
//                         return companyId;
//                     }
//                 } catch (redisError) {
//                     console.error('❌ [CompanyMapper] Redis error:', redisError.message);
//                 }
//             }
            
//             // ===== DATABASE LOOKUP =====
//             this.stats.misses++;
//             console.log(`🔍 [CompanyMapper] Cache miss for ${normalized}, querying database...`);
            
//             // Search for company with this WhatsApp number
//             const company = await Company.findOne({
//                 $or: [
//                     { 'whatsapp.phoneNumber': { $regex: normalized, $options: 'i' } },
//                     { 'whatsappRouting.phoneNumbers.number': { $regex: normalized, $options: 'i' } }
//                 ],
//                 status: 'active',
//                 deletedAt: null
//             }).select('_id whatsapp whatsappRouting');
            
//             if (!company) {
//                 console.log(`❌ [CompanyMapper] No company found for phone: ${normalized}`);
//                 return null;
//             }
            
//             const companyId = company._id.toString();
//             const expiresAt = Date.now() + this.config.cacheTTL;
            
//             // ===== UPDATE CACHES =====
            
//             // Update in-memory cache
//             this.cache.set(cacheKey, { companyId, expiresAt });
            
//             // Update reverse cache
//             if (!this.companyPhoneCache.has(companyId)) {
//                 this.companyPhoneCache.set(companyId, new Set());
//             }
//             this.companyPhoneCache.get(companyId).add(normalized);
            
//             // Update Redis if enabled
//             if (this.config.redisEnabled && this.redisSet) {
//                 try {
//                     await this.redisSet(
//                         `${this.config.redisPrefix}${normalized}`,
//                         this.config.cacheTTL / 1000,
//                         JSON.stringify({ companyId, expiresAt })
//                     );
//                 } catch (redisError) {
//                     console.error('❌ [CompanyMapper] Redis set error:', redisError.message);
//                 }
//             }
            
//             // Update statistics
//             this.stats.size = this.cache.size;
            
//             console.log(`✅ [CompanyMapper] Mapped phone ${normalized} to company ${companyId}`);
            
//             return companyId;
            
//         } catch (error) {
//             console.error('❌ [CompanyMapper] Error getting company by phone:', error);
//             return null;
//         }
//     }

//     /**
//      * Get company ID from message object
//      * @param {Object} message - WhatsApp message object
//      * @returns {Promise<string|null>} Company ID or null
//      */
//     async getCompanyIdFromMessage(message) {
//         if (!message || !message.from) {
//             return null;
//         }
        
//         // Extract phone number from message.from (format: 919876543210@c.us)
//         const phoneNumber = message.from.split('@')[0];
        
//         return this.getCompanyIdByPhone(phoneNumber);
//     }

//     /**
//      * Get all phone numbers for a company
//      * @param {string} companyId - Company ID
//      * @returns {Promise<Array>} Array of phone numbers
//      */
//     async getCompanyPhoneNumbers(companyId) {
//         try {
//             // Check reverse cache first
//             if (this.companyPhoneCache.has(companyId)) {
//                 return Array.from(this.companyPhoneCache.get(companyId));
//             }
            
//             // Query database
//             const company = await Company.findById(companyId)
//                 .select('whatsapp whatsappRouting');
            
//             if (!company) {
//                 return [];
//             }
            
//             const numbers = [];
            
//             // Add primary WhatsApp number
//             if (company.whatsapp?.phoneNumber) {
//                 const normalized = this.normalizePhoneNumber(company.whatsapp.phoneNumber);
//                 numbers.push(normalized);
//             }
            
//             // Add routing numbers
//             if (company.whatsappRouting?.phoneNumbers) {
//                 company.whatsappRouting.phoneNumbers.forEach(p => {
//                     if (p.isActive) {
//                         const normalized = this.normalizePhoneNumber(p.number);
//                         numbers.push(normalized);
//                     }
//                 });
//             }
            
//             // Update reverse cache
//             this.companyPhoneCache.set(companyId, new Set(numbers));
            
//             return numbers;
            
//         } catch (error) {
//             console.error(`❌ [CompanyMapper] Error getting phone numbers for ${companyId}:`, error);
//             return [];
//         }
//     }

//     /**
//      * Register a company's phone number in cache
//      * @param {string} companyId - Company ID
//      * @param {string} phoneNumber - Phone number
//      * @param {number} ttl - Cache TTL in ms (optional)
//      */
//     async registerCompanyPhone(companyId, phoneNumber, ttl = this.config.cacheTTL) {
//         try {
//             const normalized = this.normalizePhoneNumber(phoneNumber);
//             const cacheKey = this.getCacheKey(normalized);
//             const expiresAt = Date.now() + ttl;
            
//             // Update in-memory cache
//             this.cache.set(cacheKey, { companyId, expiresAt });
            
//             // Update reverse cache
//             if (!this.companyPhoneCache.has(companyId)) {
//                 this.companyPhoneCache.set(companyId, new Set());
//             }
//             this.companyPhoneCache.get(companyId).add(normalized);
            
//             // Update Redis if enabled
//             if (this.config.redisEnabled && this.redisSet) {
//                 await this.redisSet(
//                     `${this.config.redisPrefix}${normalized}`,
//                     ttl / 1000,
//                     JSON.stringify({ companyId, expiresAt })
//                 );
//             }
            
//             console.log(`✅ [CompanyMapper] Registered ${normalized} -> ${companyId}`);
            
//             // Emit event for other services
//             this.emit('phone-registered', { companyId, phoneNumber: normalized });
            
//         } catch (error) {
//             console.error('❌ [CompanyMapper] Error registering phone:', error);
//         }
//     }

//     /**
//      * Register multiple phone numbers for a company
//      * @param {string} companyId - Company ID
//      * @param {Array} phoneNumbers - Array of phone numbers
//      */
//     async registerCompanyPhones(companyId, phoneNumbers) {
//         const promises = phoneNumbers.map(phone => 
//             this.registerCompanyPhone(companyId, phone)
//         );
//         await Promise.all(promises);
//     }

//     /**
//      * Refresh cache for a company (call when company updates numbers)
//      * @param {string} companyId - Company ID
//      */
//     async refreshCompanyMapping(companyId) {
//         try {
//             console.log(`🔄 [CompanyMapper] Refreshing mapping for company ${companyId}`);
            
//             // Get current phone numbers from database
//             const numbers = await this.getCompanyPhoneNumbers(companyId);
            
//             // Clear existing cache entries for this company
//             await this.clearCompanyCache(companyId);
            
//             // Register new numbers
//             await this.registerCompanyPhones(companyId, numbers);
            
//             console.log(`✅ [CompanyMapper] Refreshed mapping for company ${companyId}`);
            
//             // Emit event
//             this.emit('mapping-refreshed', { companyId, numbers });
            
//         } catch (error) {
//             console.error(`❌ [CompanyMapper] Error refreshing mapping for ${companyId}:`, error);
//         }
//     }

//     /**
//      * Clear cache for a specific phone number
//      * @param {string} phoneNumber - Phone number
//      */
//     async clearPhoneCache(phoneNumber) {
//         const normalized = this.normalizePhoneNumber(phoneNumber);
//         const cacheKey = this.getCacheKey(normalized);
        
//         // Clear in-memory cache
//         this.cache.delete(cacheKey);
        
//         // Clear Redis if enabled
//         if (this.config.redisEnabled && this.redisDel) {
//             try {
//                 await this.redisDel(`${this.config.redisPrefix}${normalized}`);
//             } catch (error) {
//                 console.error('❌ [CompanyMapper] Redis delete error:', error);
//             }
//         }
        
//         console.log(`🗑️ [CompanyMapper] Cleared cache for ${normalized}`);
//     }

//     /**
//      * Clear all cache entries for a company
//      * @param {string} companyId - Company ID
//      */
//     async clearCompanyCache(companyId) {
//         // Get all phone numbers for this company from reverse cache
//         const numbers = this.companyPhoneCache.get(companyId);
        
//         if (numbers) {
//             // Clear each number
//             for (const number of numbers) {
//                 await this.clearPhoneCache(number);
//             }
            
//             // Remove from reverse cache
//             this.companyPhoneCache.delete(companyId);
//         }
        
//         console.log(`🗑️ [CompanyMapper] Cleared all cache for company ${companyId}`);
//     }

//     /**
//      * Clear entire cache
//      */
//     async clearAllCache() {
//         this.cache.clear();
//         this.companyPhoneCache.clear();
        
//         if (this.config.redisEnabled && this.redisClient) {
//             // Clear all Redis keys with prefix
//             const keys = await this.redisClient.keys(`${this.config.redisPrefix}*`);
//             if (keys.length > 0) {
//                 await this.redisClient.del(keys);
//             }
//         }
        
//         console.log('🗑️ [CompanyMapper] Cleared all cache');
//     }

//     /**
//      * Get cache statistics
//      * @returns {Object} Cache statistics
//      */
//     getStats() {
//         const hitRate = this.stats.hits + this.stats.misses > 0
//             ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100)
//             : 0;
        
//         return {
//             ...this.stats,
//             hitRate: `${hitRate}%`,
//             cacheSize: this.cache.size,
//             reverseCacheSize: this.companyPhoneCache.size,
//             redisEnabled: this.config.redisEnabled
//         };
//     }

//     /**
//      * Get all current mappings
//      * @returns {Array} Array of mappings
//      */
//     getAllMappings() {
//         const mappings = [];
        
//         this.cache.forEach((value, key) => {
//             mappings.push({
//                 cacheKey: key,
//                 companyId: value.companyId,
//                 expiresAt: new Date(value.expiresAt).toISOString(),
//                 timeLeft: Math.round((value.expiresAt - Date.now()) / 1000) + 's'
//             });
//         });
        
//         return mappings;
//     }

//     /**
//      * Warm up cache with all active companies
//      */
//     async warmUpCache() {
//         try {
//             console.log('🔥 [CompanyMapper] Warming up cache...');
            
//             // Find all active companies with WhatsApp numbers
//             const companies = await Company.find({
//                 'whatsapp.isConnected': true,
//                 status: 'active',
//                 deletedAt: null
//             }).select('_id whatsapp whatsappRouting');
            
//             let totalNumbers = 0;
            
//             for (const company of companies) {
//                 const numbers = [];
                
//                 if (company.whatsapp?.phoneNumber) {
//                     numbers.push(company.whatsapp.phoneNumber);
//                 }
                
//                 if (company.whatsappRouting?.phoneNumbers) {
//                     company.whatsappRouting.phoneNumbers.forEach(p => {
//                         if (p.isActive) numbers.push(p.number);
//                     });
//                 }
                
//                 await this.registerCompanyPhones(company._id.toString(), numbers);
//                 totalNumbers += numbers.length;
//             }
            
//             console.log(`✅ [CompanyMapper] Cache warmed up with ${companies.length} companies, ${totalNumbers} phone numbers`);
            
//         } catch (error) {
//             console.error('❌ [CompanyMapper] Cache warm-up failed:', error);
//         }
//     }

//     /**
//      * Validate if a phone number belongs to a company
//      * @param {string} phoneNumber - Phone number
//      * @param {string} companyId - Company ID
//      * @returns {Promise<boolean>} True if valid
//      */
//     async validatePhoneForCompany(phoneNumber, companyId) {
//         const foundCompanyId = await this.getCompanyIdByPhone(phoneNumber);
//         return foundCompanyId === companyId;
//     }

//     /**
//      * Get primary phone number for a company
//      * @param {string} companyId - Company ID
//      * @returns {Promise<string|null>} Primary phone number
//      */
//     async getPrimaryPhoneForCompany(companyId) {
//         try {
//             const company = await Company.findById(companyId)
//                 .select('whatsapp whatsappRouting');
            
//             if (!company) return null;
            
//             // Check if primary is set in routing
//             if (company.whatsappRouting?.phoneNumbers) {
//                 const primary = company.whatsappRouting.phoneNumbers.find(p => p.isPrimary && p.isActive);
//                 if (primary) return primary.number;
//             }
            
//             // Fallback to main WhatsApp number
//             return company.whatsapp?.phoneNumber || null;
            
//         } catch (error) {
//             console.error(`❌ [CompanyMapper] Error getting primary phone for ${companyId}:`, error);
//             return null;
//         }
//     }
// }

// // Create singleton instance
// let mapperInstance = null;

// export function getCompanyMapper() {
//     if (!mapperInstance) {
//         mapperInstance = new CompanyMapper();
//     }
//     return mapperInstance;
// }

// export default getCompanyMapper();

















// services/companyMapper.js
// PROFESSIONAL COMPANY MAPPER - Routes incoming messages to correct company
// Maps phone numbers to company IDs with caching and real-time updates
// UPDATED: Uses API calls instead of direct model imports (for separate Node.js service)

import { EventEmitter } from 'events';
import axios from 'axios';
import redis from 'redis'; // Optional: for distributed caching
import { promisify } from 'util';

class CompanyMapper extends EventEmitter {
    constructor() {
        super();
        
        // API configuration
        this.apiBaseUrl = process.env.NEXTJS_API_URL || 'http://localhost:3000';
        this.apiClient = axios.create({
            baseURL: this.apiBaseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        // In-memory cache: Map<phoneNumber, { companyId, expiresAt }>
        this.cache = new Map();
        
        // Reverse cache: Map<companyId, Set<phoneNumbers>>
        this.companyPhoneCache = new Map();
        
        // Configuration
        this.config = {
            cacheTTL:  86400000, // 24 hours (matches your companyConfig.js)
            maxCacheSize: 10000, // Maximum cache entries
            cleanupInterval: 60000, // 1 minute
            redisEnabled: false,
            redisPrefix: 'company:phone:'
        };
        
        // Cache statistics
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
            lastCleanup: new Date()
        };
        
        // Redis client (optional, for distributed systems)
        this.redisClient = null;
        this.redisGet = null;
        this.redisSet = null;
        this.redisDel = null;
        
        // Start cache cleanup interval
        this.startCleanupInterval();
        
        console.log('📞 [CompanyMapper] Initialized with API URL:', this.apiBaseUrl);
    }

    /**
     * Initialize Redis connection (optional, for distributed deployment)
     * @param {Object} redisConfig - Redis configuration
     */
    async initRedis(redisConfig = {}) {
        try {
            const redisUrl = redisConfig.url || process.env.REDIS_URL;
            
            if (!redisUrl) {
                console.log('ℹ️ [CompanyMapper] Redis not configured, using in-memory cache only');
                return;
            }
            
            this.redisClient = redis.createClient({
                url: redisUrl,
                ...redisConfig
            });
            
            // Promisify Redis commands
            this.redisGet = promisify(this.redisClient.get).bind(this.redisClient);
            this.redisSet = promisify(this.redisClient.setex).bind(this.redisClient);
            this.redisDel = promisify(this.redisClient.del).bind(this.redisClient);
            
            this.redisClient.on('error', (error) => {
                console.error('❌ [CompanyMapper] Redis error:', error);
                this.config.redisEnabled = false;
            });
            
            this.redisClient.on('connect', () => {
                console.log('✅ [CompanyMapper] Redis connected');
                this.config.redisEnabled = true;
            });
            
            await this.redisClient.connect();
            
        } catch (error) {
            console.error('❌ [CompanyMapper] Redis initialization failed:', error);
            this.config.redisEnabled = false;
        }
    }

    /**
     * Start cache cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupCache();
        }, this.config.cleanupInterval);
    }

    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        let removed = 0;
        
        this.cache.forEach((value, key) => {
            if (value.expiresAt < now) {
                this.cache.delete(key);
                removed++;
            }
        });
        
        this.stats.size = this.cache.size;
        this.stats.lastCleanup = new Date();
        
        if (removed > 0) {
            console.log(`🧹 [CompanyMapper] Cleaned up ${removed} expired cache entries`);
        }
    }

    /**
     * Generate cache key for phone number
     * @param {string} phoneNumber - Phone number
     * @returns {string} Cache key
     */
    getCacheKey(phoneNumber) {
        // Normalize phone number: remove all non-digits
        const normalized = phoneNumber.replace(/\D/g, '');
        return `phone:${normalized}`;
    }

    /**
     * Normalize phone number for consistent lookup
     * @param {string} phoneNumber - Phone number
     * @returns {string} Normalized phone number
     */
    /**
 * Normalize phone number for consistent lookup
 * @param {string|object} phoneNumber - Phone number (could be string or object)
 * @returns {string} Normalized phone number
 */
normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // ✅ CRITICAL: Convert to string first (handles objects, numbers, etc.)
    const phoneStr = String(phoneNumber);
    
    // ✅ Remove all non-digits using the string version
    let normalized = phoneStr.replace(/\D/g, '');
    
    // Handle Indian numbers (with or without 91)
    if (normalized.length === 12 && normalized.startsWith('91')) {
        normalized = normalized.substring(2);
    } else if (normalized.length === 11 && normalized.startsWith('0')) {
        normalized = normalized.substring(1);
    }
    
    // Ensure we have 10 digits
    if (normalized.length === 10) {
        return normalized;
    } else if (normalized.length > 10) {
        // Take last 10 digits
        return normalized.slice(-10);
    }
    
    return normalized;
}

    /**
     * Extract data from API response
     */
    extractData(responseData) {
        if (!responseData) return null;
        
        if (responseData.success && responseData.data !== undefined) {
            return responseData.data;
        }
        
        return responseData;
    }

    /**
     * Get company ID by phone number via API
     * @param {string} phoneNumber - WhatsApp phone number
     * @returns {Promise<Object|null>} Company data or null
     */
    async fetchCompanyByPhone(phoneNumber) {
        try {
            const normalized = this.normalizePhoneNumber(phoneNumber);
            
            if (!normalized) {
                return null;
            }

            console.log(`🔍 [CompanyMapper] Fetching company for phone: ${normalized} via API`);

            // Call Next.js API endpoint to find company by WhatsApp number
            const response = await this.apiClient.get(`/api/companies/by-whatsapp?phone=${normalized}`);
            
            const companyData = this.extractData(response.data);
            
            if (companyData && companyData._id) {
                console.log(`✅ [CompanyMapper] API found company: ${companyData._id} for phone: ${normalized}`);
                return companyData;
            }
            
            console.log(`❌ [CompanyMapper] No company found via API for phone: ${normalized}`);
            return null;

        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`ℹ️ [CompanyMapper] No company found for phone: ${phoneNumber}`);
            } else {
                console.error(`❌ [CompanyMapper] API error fetching company by phone:`, {
                    phone: phoneNumber,
                    status: error.response?.status,
                    message: error.message
                });
            }
            return null;
        }
    }

    /**
     * Get company ID by phone number
     * @param {string} phoneNumber - WhatsApp phone number
     * @param {Object} options - Options (skipCache, useRedis)
     * @returns {Promise<string|null>} Company ID or null
     */
    async getCompanyIdByPhone(phoneNumber, options = {}) {
        try {
            const normalized = this.normalizePhoneNumber(phoneNumber);
            
            if (!normalized) {
                console.log(`⚠️ [CompanyMapper] Invalid phone number: ${phoneNumber}`);
                return null;
            }
            
            const cacheKey = this.getCacheKey(normalized);
            
            // ===== CHECK CACHE (In-Memory) =====
            if (!options.skipCache) {
                const cached = this.cache.get(cacheKey);
                if (cached && cached.expiresAt > Date.now()) {
                    this.stats.hits++;
                    console.log(`✅ [CompanyMapper] Cache hit for ${normalized} -> ${cached.companyId}`);
                    return cached.companyId;
                }
            }
            
            // ===== CHECK REDIS (if enabled) =====
            if (this.config.redisEnabled && !options.skipRedis && this.redisGet) {
                try {
                    const redisValue = await this.redisGet(`${this.config.redisPrefix}${normalized}`);
                    if (redisValue) {
                        const { companyId, expiresAt } = JSON.parse(redisValue);
                        
                        // Update in-memory cache
                        this.cache.set(cacheKey, { companyId, expiresAt });
                        
                        this.stats.hits++;
                        console.log(`✅ [CompanyMapper] Redis cache hit for ${normalized} -> ${companyId}`);
                        return companyId;
                    }
                } catch (redisError) {
                    console.error('❌ [CompanyMapper] Redis error:', redisError.message);
                }
            }
            
            // ===== API LOOKUP (instead of direct DB) =====
            this.stats.misses++;
            console.log(`🔍 [CompanyMapper] Cache miss for ${normalized}, calling API...`);
            
            const company = await this.fetchCompanyByPhone(normalized);
            
            if (!company) {
                return null;
            }
            
            const companyId = company._id.toString();
            const expiresAt = Date.now() + this.config.cacheTTL;
            
            // ===== UPDATE CACHES =====
            
            // Update in-memory cache
            this.cache.set(cacheKey, { companyId, expiresAt });
            
            // Update reverse cache
            if (!this.companyPhoneCache.has(companyId)) {
                this.companyPhoneCache.set(companyId, new Set());
            }
            this.companyPhoneCache.get(companyId).add(normalized);
            
            // Update Redis if enabled
            if (this.config.redisEnabled && this.redisSet) {
                try {
                    await this.redisSet(
                        `${this.config.redisPrefix}${normalized}`,
                        this.config.cacheTTL / 1000,
                        JSON.stringify({ companyId, expiresAt })
                    );
                } catch (redisError) {
                    console.error('❌ [CompanyMapper] Redis set error:', redisError.message);
                }
            }
            
            // Update statistics
            this.stats.size = this.cache.size;
            
            console.log(`✅ [CompanyMapper] Mapped phone ${normalized} to company ${companyId}`);
            
            return companyId;
            
        } catch (error) {
            console.error('❌ [CompanyMapper] Error getting company by phone:', error);
            return null;
        }
    }

    /**
     * Get company ID from message object
     * @param {Object} message - WhatsApp message object
     * @returns {Promise<string|null>} Company ID or null
     */
    async getCompanyIdFromMessage(message) {
        if (!message || !message.to) {  // Use message.to (the number they messaged) not message.from
            console.log('⚠️ [CompanyMapper] Invalid message object, missing message.to');
            return null;
        }
        
        // Extract phone number from message.to (format: 919876543210@c.us)
        // This is the COMPANY'S WhatsApp number that the customer messaged
        const phoneNumber = message.to.split('@')[0];
        
        console.log(`📞 [CompanyMapper] Extracting company from message.to: ${phoneNumber}`);
        
        return this.getCompanyIdByPhone(phoneNumber);
    }

    /**
     * Get all phone numbers for a company via API
     * @param {string} companyId - Company ID
     * @returns {Promise<Array>} Array of phone numbers
     */
    async fetchCompanyPhoneNumbers(companyId) {
        try {
            console.log(`🔍 [CompanyMapper] Fetching phone numbers for company: ${companyId} via API`);
            
            const response = await this.apiClient.get(`/api/companies/${companyId}/whatsapp-numbers`);
            
            const data = this.extractData(response.data);
            
            if (data && Array.isArray(data.phoneNumbers)) {
                return data.phoneNumbers.map(p => this.normalizePhoneNumber(p));
            }
            
            return [];

        } catch (error) {
            console.error(`❌ [CompanyMapper] API error fetching phone numbers for ${companyId}:`, error.message);
            return [];
        }
    }

    /**
     * Get all phone numbers for a company
     * @param {string} companyId - Company ID
     * @returns {Promise<Array>} Array of phone numbers
     */
    async getCompanyPhoneNumbers(companyId) {
        try {
            // Check reverse cache first
            if (this.companyPhoneCache.has(companyId)) {
                return Array.from(this.companyPhoneCache.get(companyId));
            }
            
            // Fetch from API
            const numbers = await this.fetchCompanyPhoneNumbers(companyId);
            
            // Update reverse cache
            if (numbers.length > 0) {
                this.companyPhoneCache.set(companyId, new Set(numbers));
            }
            
            return numbers;
            
        } catch (error) {
            console.error(`❌ [CompanyMapper] Error getting phone numbers for ${companyId}:`, error);
            return [];
        }
    }

    /**
     * Register a company's phone number in cache (no API call needed)
     * @param {string} companyId - Company ID
     * @param {string} phoneNumber - Phone number
     * @param {number} ttl - Cache TTL in ms (optional)
     */
    async registerCompanyPhone(companyId, phoneNumber, ttl = this.config.cacheTTL) {
        try {
            const normalized = this.normalizePhoneNumber(phoneNumber);
            const cacheKey = this.getCacheKey(normalized);
            const expiresAt = Date.now() + ttl;
            
            // Update in-memory cache
            this.cache.set(cacheKey, { companyId, expiresAt });
            
            // Update reverse cache
            if (!this.companyPhoneCache.has(companyId)) {
                this.companyPhoneCache.set(companyId, new Set());
            }
            this.companyPhoneCache.get(companyId).add(normalized);
            
            // Update Redis if enabled
            if (this.config.redisEnabled && this.redisSet) {
                await this.redisSet(
                    `${this.config.redisPrefix}${normalized}`,
                    ttl / 1000,
                    JSON.stringify({ companyId, expiresAt })
                );
            }
            
            console.log(`✅ [CompanyMapper] Registered ${normalized} -> ${companyId} in cache`);
            
            // Emit event for other services
            this.emit('phone-registered', { companyId, phoneNumber: normalized });
            
        } catch (error) {
            console.error('❌ [CompanyMapper] Error registering phone:', error);
        }
    }

    /**
     * Register multiple phone numbers for a company
     * @param {string} companyId - Company ID
     * @param {Array} phoneNumbers - Array of phone numbers
     */
    async registerCompanyPhones(companyId, phoneNumbers) {
        const promises = phoneNumbers.map(phone => 
            this.registerCompanyPhone(companyId, phone)
        );
        await Promise.all(promises);
    }

    /**
     * Refresh cache for a company (call when company updates numbers)
     * @param {string} companyId - Company ID
     */
    async refreshCompanyMapping(companyId) {
        try {
            console.log(`🔄 [CompanyMapper] Refreshing mapping for company ${companyId}`);
            
            // Get current phone numbers from API
            const numbers = await this.getCompanyPhoneNumbers(companyId);
            
            // Clear existing cache entries for this company
            await this.clearCompanyCache(companyId);
            
            // Register new numbers
            if (numbers.length > 0) {
                await this.registerCompanyPhones(companyId, numbers);
                console.log(`✅ [CompanyMapper] Refreshed mapping for company ${companyId} with ${numbers.length} numbers`);
            } else {
                console.log(`⚠️ [CompanyMapper] No phone numbers found for company ${companyId}`);
            }
            
            // Emit event
            this.emit('mapping-refreshed', { companyId, numbers });
            
        } catch (error) {
            console.error(`❌ [CompanyMapper] Error refreshing mapping for ${companyId}:`, error);
        }
    }

    /**
     * Clear cache for a specific phone number
     * @param {string} phoneNumber - Phone number
     */
    async clearPhoneCache(phoneNumber) {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        const cacheKey = this.getCacheKey(normalized);
        
        // Clear in-memory cache
        this.cache.delete(cacheKey);
        
        // Clear Redis if enabled
        if (this.config.redisEnabled && this.redisDel) {
            try {
                await this.redisDel(`${this.config.redisPrefix}${normalized}`);
            } catch (error) {
                console.error('❌ [CompanyMapper] Redis delete error:', error);
            }
        }
        
        console.log(`🗑️ [CompanyMapper] Cleared cache for ${normalized}`);
    }

    /**
     * Clear all cache entries for a company
     * @param {string} companyId - Company ID
     */
    async clearCompanyCache(companyId) {
        // Get all phone numbers for this company from reverse cache
        const numbers = this.companyPhoneCache.get(companyId);
        
        if (numbers) {
            // Clear each number
            for (const number of numbers) {
                await this.clearPhoneCache(number);
            }
            
            // Remove from reverse cache
            this.companyPhoneCache.delete(companyId);
            
            console.log(`🗑️ [CompanyMapper] Cleared cache for company ${companyId} (${numbers.size} numbers)`);
        } else {
            console.log(`ℹ️ [CompanyMapper] No cache found for company ${companyId}`);
        }
    }

    /**
     * Clear entire cache
     */
    async clearAllCache() {
        this.cache.clear();
        this.companyPhoneCache.clear();
        
        if (this.config.redisEnabled && this.redisClient) {
            // Clear all Redis keys with prefix
            const keys = await this.redisClient.keys(`${this.config.redisPrefix}*`);
            if (keys.length > 0) {
                await this.redisClient.del(keys);
                console.log(`🗑️ [CompanyMapper] Cleared ${keys.length} Redis keys`);
            }
        }
        
        console.log('🗑️ [CompanyMapper] Cleared all cache');
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100)
            : 0;
        
        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            cacheSize: this.cache.size,
            reverseCacheSize: this.companyPhoneCache.size,
            redisEnabled: this.config.redisEnabled,
            apiUrl: this.apiBaseUrl
        };
    }

    /**
     * Get all current mappings
     * @returns {Array} Array of mappings
     */
    getAllMappings() {
        const mappings = [];
        
        this.cache.forEach((value, key) => {
            mappings.push({
                cacheKey: key,
                companyId: value.companyId,
                expiresAt: new Date(value.expiresAt).toISOString(),
                timeLeft: Math.round((value.expiresAt - Date.now()) / 1000) + 's'
            });
        });
        
        return mappings;
    }

    /**
     * Warm up cache with all active companies via API
     */
    async warmUpCache() {
        try {
            console.log('🔥 [CompanyMapper] Warming up cache via API...');
            
            // Get all active companies with WhatsApp numbers from API
            const response = await this.apiClient.get('/api/companies/with-whatsapp');
            const companies = this.extractData(response.data) || [];
            
            let totalNumbers = 0;
            
            for (const company of companies) {
                const numbers = company.whatsappNumbers || [];
                
                if (numbers.length > 0) {
                    await this.registerCompanyPhones(company._id.toString(), numbers);
                    totalNumbers += numbers.length;
                    console.log(`   ✅ Company ${company._id}: ${numbers.length} numbers`);
                }
            }
            
            console.log(`✅ [CompanyMapper] Cache warmed up with ${companies.length} companies, ${totalNumbers} phone numbers`);
            
        } catch (error) {
            console.error('❌ [CompanyMapper] Cache warm-up failed:', error.message);
        }
    }

    /**
     * Validate if a phone number belongs to a company
     * @param {string} phoneNumber - Phone number
     * @param {string} companyId - Company ID
     * @returns {Promise<boolean>} True if valid
     */
    async validatePhoneForCompany(phoneNumber, companyId) {
        const foundCompanyId = await this.getCompanyIdByPhone(phoneNumber);
        return foundCompanyId === companyId;
    }

    /**
     * Get primary phone number for a company via API
     * @param {string} companyId - Company ID
     * @returns {Promise<string|null>} Primary phone number
     */
    async getPrimaryPhoneForCompany(companyId) {
        try {
            console.log(`🔍 [CompanyMapper] Fetching primary phone for company: ${companyId}`);
            
            const response = await this.apiClient.get(`/api/companies/${companyId}/primary-whatsapp`);
            
            const data = this.extractData(response.data);
            
            if (data && data.phoneNumber) {
                return data.phoneNumber;
            }
            
            return null;
            
        } catch (error) {
            console.error(`❌ [CompanyMapper] Error getting primary phone for ${companyId}:`, error.message);
            return null;
        }
    }

    /**
     * Check API health
     */
    async healthCheck() {
        try {
            const response = await this.apiClient.get('/api/health');
            return {
                status: 'healthy',
                apiUrl: this.apiBaseUrl,
                response: response.data
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                apiUrl: this.apiBaseUrl,
                error: error.message
            };
        }
    }
}

// Create singleton instance
let mapperInstance = null;

export function getCompanyMapper() {
    if (!mapperInstance) {
        mapperInstance = new CompanyMapper();
    }
    return mapperInstance;
}

export default getCompanyMapper;