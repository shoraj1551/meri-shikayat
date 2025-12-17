/**
 * Rate Limiting Middleware
 * Comprehensive rate limiting for different endpoint types
 * Uses Redis for distributed rate limiting across multiple instances
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import getRedisClient, { isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';

// Check if Redis is available, fallback to memory store if not
let useRedisStore = false;

// Initialize Redis store check
(async () => {
    useRedisStore = await isRedisAvailable();
    if (useRedisStore) {
        logger.info('✅ Rate limiting using Redis store (distributed)');
    } else {
        logger.warn('⚠️ Rate limiting using memory store (single instance only)');
    }
})();

/**
 * Create rate limiter with Redis or memory store
 */
const createRateLimiter = (options) => {
    const config = {
        standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers

        // Custom handler for rate limit exceeded
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('user-agent'),
                userId: req.user?.id
            });

            res.status(429).json({
                success: false,
                message: options.message || 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || options.windowMs / 1000
            });
        },

        // Skip successful requests (optional, based on config)
        skipSuccessfulRequests: options.skipSuccessfulRequests || false,

        // Skip failed requests (optional, based on config)
        skipFailedRequests: options.skipFailedRequests || false,

        ...options
    };

    // Add Redis store if available
    if (useRedisStore) {
        try {
            const redisClient = getRedisClient();
            config.store = new RedisStore({
                client: redisClient,
                prefix: options.prefix || 'rl:',
                sendCommand: (...args) => redisClient.call(...args)
            });
        } catch (error) {
            logger.error('Failed to create Redis store for rate limiter', {
                error: error.message,
                prefix: options.prefix
            });
            // Will fall back to memory store
        }
    }

    return rateLimit(config);
};

/**
 * Global API Rate Limiter
 * Applies to all API endpoints
 * 50 requests per 15 minutes per IP
 */
export const globalRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Reduced from 100 for better security
    message: 'Too many requests from this IP. Please try again later.',
    prefix: 'rl:global:',
    standardHeaders: true
});

/**
 * Authentication Rate Limiter
 * For login/register endpoints
 * 5 requests per 15 minutes per IP
 * Prevents brute force attacks
 */
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Very strict - only 5 login attempts
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    prefix: 'rl:auth:',
    skipSuccessfulRequests: true, // Don't count successful logins
    skipFailedRequests: false // Count failed attempts
});

/**
 * OTP Rate Limiter
 * For OTP generation endpoints
 * 3 requests per hour per IP
 * Prevents OTP spam and abuse
 */
export const otpRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 OTP requests per hour
    message: 'Too many OTP requests. Please try again in 1 hour.',
    prefix: 'rl:otp:',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

/**
 * File Upload Rate Limiter
 * For file upload endpoints
 * 20 requests per hour per IP
 * Prevents upload abuse
 */
export const uploadRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: 'Too many file uploads. Please try again later.',
    prefix: 'rl:upload:',
    skipSuccessfulRequests: false,
    skipFailedRequests: true // Don't count failed uploads
});

/**
 * Password Reset Rate Limiter
 * For password reset endpoints
 * 3 requests per hour per IP
 * Prevents password reset abuse
 */
export const passwordResetRateLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 password reset requests per hour
    message: 'Too many password reset requests. Please try again in 1 hour.',
    prefix: 'rl:password-reset:',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

/**
 * API Read Rate Limiter
 * For GET endpoints (less strict)
 * 100 requests per 15 minutes per IP
 */
export const readRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // More generous for read operations
    message: 'Too many requests. Please try again later.',
    prefix: 'rl:read:',
    skipSuccessfulRequests: false,
    skipFailedRequests: true
});

/**
 * API Write Rate Limiter
 * For POST/PUT/DELETE endpoints (stricter)
 * 30 requests per 15 minutes per IP
 */
export const writeRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Stricter for write operations
    message: 'Too many write requests. Please try again later.',
    prefix: 'rl:write:',
    skipSuccessfulRequests: false,
    skipFailedRequests: true
});

/**
 * Admin Rate Limiter
 * For admin endpoints (moderate)
 * 50 requests per 15 minutes per IP
 */
export const adminRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Moderate limit for admin operations
    message: 'Too many admin requests. Please try again later.',
    prefix: 'rl:admin:',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

/**
 * Create custom rate limiter with specific options
 * @param {Object} options - Rate limiter options
 * @returns {Function} Rate limiter middleware
 */
export const createCustomRateLimiter = (options) => {
    return createRateLimiter(options);
};

/**
 * Rate limiter for specific user (by user ID)
 * Useful for per-user rate limiting
 */
export const createUserRateLimiter = (options) => {
    return createRateLimiter({
        ...options,
        keyGenerator: (req) => {
            // Use user ID if authenticated, otherwise fall back to IP
            return req.user?.id || req.ip;
        }
    });
};

// Export all rate limiters
export default {
    global: globalRateLimiter,
    auth: authRateLimiter,
    otp: otpRateLimiter,
    upload: uploadRateLimiter,
    passwordReset: passwordResetRateLimiter,
    read: readRateLimiter,
    write: writeRateLimiter,
    admin: adminRateLimiter,
    createCustom: createCustomRateLimiter,
    createUser: createUserRateLimiter
};
