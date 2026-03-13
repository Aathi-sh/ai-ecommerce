// /**
//  * Simple rate limiter for API endpoints
//  */

// const rateLimit = (options) => {
//   const requests = new Map();

//   return {
//     check: (limit, token) =>
//       new Promise((resolve, reject) => {
//         const now = Date.now();
//         const windowStart = now - options.interval;

//         // Get or create request history for this token
//         const requestHistory = requests.get(token) || [];
        
//         // Filter requests within current window
//         const requestsWithinWindow = requestHistory.filter(
//           (timestamp) => timestamp > windowStart
//         );

//         // Check if limit exceeded
//         if (requestsWithinWindow.length >= limit) {
//           reject(new Error('Rate limit exceeded'));
//         } else {
//           // Add current request
//           requestsWithinWindow.push(now);
//           requests.set(token, requestsWithinWindow);
//           resolve();
//         }

//         // Clean up old entries periodically
//         if (now % options.interval === 0) {
//           for (const [key, timestamps] of requests.entries()) {
//             const validTimestamps = timestamps.filter(
//               (timestamp) => timestamp > windowStart
//             );
//             if (validTimestamps.length === 0) {
//               requests.delete(key);
//             } else {
//               requests.set(key, validTimestamps);
//             }
//           }
//         }
//       }),
//   };
// };

// export default rateLimit;

















/**
 * Professional rate limiter for API endpoints
 * Uses memory store with auto-cleanup and atomic operations
 */

class RateLimiter {
  constructor(options = {}) {
    this.requests = new Map();
    this.interval = options.interval || 60 * 1000; // Default 1 minute
    this.maxRequests = options.maxRequests || 100; // Default 100 per interval
    
    // Auto cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if request is allowed
   * @param {string} key - Unique identifier (IP, user ID, etc.)
   * @param {number} limit - Max requests per interval
   * @returns {Promise<{success: boolean, remaining: number, reset: number}>}
   */
  async check(key, limit = this.maxRequests) {
    const now = Date.now();
    const windowStart = now - this.interval;

    // Get or initialize request history
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }

    const history = this.requests.get(key);
    
    // Filter requests within current window
    const validRequests = history.filter(ts => ts > windowStart);
    
    // Update history with valid requests
    this.requests.set(key, validRequests);

    const remaining = Math.max(0, limit - validRequests.length);
    const reset = windowStart + this.interval;

    if (validRequests.length >= limit) {
      return {
        success: false,
        remaining: 0,
        reset,
        limit
      };
    }

    // Add current request atomically
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      success: true,
      remaining: remaining - 1,
      reset,
      limit
    };
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.interval;
    
    for (const [key, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter(ts => ts > windowStart);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key, limit = this.maxRequests) {
    const now = Date.now();
    const windowStart = now - this.interval;
    const history = this.requests.get(key) || [];
    const validCount = history.filter(ts => ts > windowStart).length;
    
    return Math.max(0, limit - validCount);
  }

  /**
   * Reset limit for a key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Destroy limiter (cleanup interval)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Create singleton instance
const limiter = new RateLimiter();

/**
 * Rate limit middleware for API routes
 * @param {Object} options - { limit, interval, keyGenerator }
 */
export function rateLimit(options = {}) {
  const {
    limit = 100,
    interval = 60 * 1000,
    keyGenerator = (req) => {
      // Default: use IP address
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
      return ip;
    }
  } = options;

  return async (req) => {
    try {
      const key = keyGenerator(req);
      const result = await limiter.check(key, limit);

      // Add rate limit headers
      const headers = {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
      };

      if (!result.success) {
        return {
          success: false,
          headers,
          error: 'Too many requests, please try again later.',
          status: 429
        };
      }

      return {
        success: true,
        headers
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      return {
        success: false,
        error: 'Rate limiting error',
        status: 500
      };
    }
  };
}

// For backwards compatibility with your current code
const createRateLimiter = (options) => {
  const instance = new RateLimiter(options);
  
  return {
    check: (limit, token) => 
      instance.check(token, limit).then(result => {
        if (!result.success) {
          throw new Error('Rate limit exceeded');
        }
      })
  };
};

export default createRateLimiter;

// Export singleton for direct use
export { limiter };