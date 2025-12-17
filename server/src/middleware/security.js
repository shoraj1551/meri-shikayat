/**
 * Security Middleware
 * Comprehensive security configuration using helmet, rate limiting, and sanitization
 */

import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

// Global API rate limiter
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security headers middleware - TASK-012: Strengthened
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'nonce-{NONCE}'"], // Use nonces instead of unsafe-inline
            scriptSrc: ["'self'", "'nonce-{NONCE}'"], // Use nonces instead of unsafe-inline
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
            workerSrc: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            upgradeInsecureRequests: []
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny' // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    permittedCrossDomainPolicies: {
        permittedPolicies: 'none'
    },
    dnsPrefetchControl: {
        allow: false
    }
});

// MongoDB query sanitization
export const mongoSanitization = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potentially malicious key: ${key}`);
    }
});

// Request size limits
export const requestSizeLimits = {
    json: { limit: '10mb' },
    urlencoded: { extended: true, limit: '10mb' }
};
