/**
 * Rate Limiting Middleware
 * Prevents abuse of authentication endpoints
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for forgot password requests
 * Max 3 requests per hour per IP
 */
export const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset requests from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for login attempts
 * Max 10 requests per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limiter for OTP verification
 * Max 10 requests per 15 minutes per IP
 */
export const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many OTP verification attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for registration
 * Max 5 requests per hour per IP
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many registration attempts from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
