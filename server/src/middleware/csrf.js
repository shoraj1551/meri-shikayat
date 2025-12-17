/**
 * CSRF Protection Middleware
 * Prevents Cross-Site Request Forgery attacks on state-changing operations
 */

import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import logger from '../utils/logger.js';

// CSRF protection configuration
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 3600000 // 1 hour
    }
});

/**
 * CSRF token generation endpoint
 */
export const generateCsrfToken = (req, res) => {
    res.json({
        success: true,
        csrfToken: req.csrfToken()
    });
};

/**
 * CSRF error handler
 */
export const csrfErrorHandler = (err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }

    logger.security('CSRF token validation failed', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method
    });

    res.status(403).json({
        success: false,
        message: 'Invalid CSRF token. Please refresh the page and try again.',
        code: 'CSRF_VALIDATION_FAILED'
    });
};

export { csrfProtection, cookieParser };

export default {
    csrfProtection,
    generateCsrfToken,
    csrfErrorHandler,
    cookieParser
};
