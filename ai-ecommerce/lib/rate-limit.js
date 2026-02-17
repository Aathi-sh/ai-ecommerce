/**
 * Simple rate limiter for API endpoints
 */

const rateLimit = (options) => {
  const requests = new Map();

  return {
    check: (limit, token) =>
      new Promise((resolve, reject) => {
        const now = Date.now();
        const windowStart = now - options.interval;

        // Get or create request history for this token
        const requestHistory = requests.get(token) || [];
        
        // Filter requests within current window
        const requestsWithinWindow = requestHistory.filter(
          (timestamp) => timestamp > windowStart
        );

        // Check if limit exceeded
        if (requestsWithinWindow.length >= limit) {
          reject(new Error('Rate limit exceeded'));
        } else {
          // Add current request
          requestsWithinWindow.push(now);
          requests.set(token, requestsWithinWindow);
          resolve();
        }

        // Clean up old entries periodically
        if (now % options.interval === 0) {
          for (const [key, timestamps] of requests.entries()) {
            const validTimestamps = timestamps.filter(
              (timestamp) => timestamp > windowStart
            );
            if (validTimestamps.length === 0) {
              requests.delete(key);
            } else {
              requests.set(key, validTimestamps);
            }
          }
        }
      }),
  };
};

export default rateLimit;