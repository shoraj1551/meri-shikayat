/**
 * Enhanced Winston Logger Configuration
 * Comprehensive logging with structured data, request tracking, and security audit
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured JSON logging
const structuredFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    winston.format.json()
);

// Custom format for console (human-readable)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;

        // Add metadata if present
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }

        return msg;
    })
);

// Determine log level based on environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
const logger = winston.createLogger({
    level,
    format: structuredFormat,
    defaultMeta: {
        service: 'meri-shikayat-api',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Console transport (development)
        new winston.transports.Console({
            format: consoleFormat,
            silent: process.env.NODE_ENV === 'test'
        }),

        // Error log file
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 10,
            tailable: true
        }),

        // Combined log file
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 10,
            tailable: true
        }),

        // Security audit log file
        new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            level: 'warn',
            maxsize: 10485760, // 10MB
            maxFiles: 20, // Keep more security logs
            tailable: true
        }),

        // HTTP request log file
        new winston.transports.File({
            filename: path.join(logsDir, 'http.log'),
            level: 'http',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        })
    ],
    exitOnError: false
});

// Helper function to sanitize sensitive data
const sanitizeData = (data) => {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveFields = [
        'password', 'newPassword', 'currentPassword', 'oldPassword',
        'token', 'refreshToken', 'accessToken',
        'otp', 'code',
        'secret', 'apiKey', 'privateKey',
        'authorization', 'cookie'
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
        const lowerKey = key.toLowerCase();

        // Check if field is sensitive
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
        }
        // Recursively sanitize nested objects
        else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }

    return sanitized;
};

// Enhanced logging methods with automatic sanitization
const enhancedLogger = {
    /**
     * Log error messages
     */
    error: (message, metadata = {}) => {
        logger.error(message, sanitizeData(metadata));
    },

    /**
     * Log warning messages
     */
    warn: (message, metadata = {}) => {
        logger.warn(message, sanitizeData(metadata));
    },

    /**
     * Log info messages
     */
    info: (message, metadata = {}) => {
        logger.info(message, sanitizeData(metadata));
    },

    /**
     * Log HTTP requests
     */
    http: (message, metadata = {}) => {
        logger.http(message, sanitizeData(metadata));
    },

    /**
     * Log debug messages
     */
    debug: (message, metadata = {}) => {
        logger.debug(message, sanitizeData(metadata));
    },

    /**
     * Log security events (authentication, authorization, etc.)
     */
    security: (message, metadata = {}) => {
        logger.warn(`[SECURITY] ${message}`, {
            ...sanitizeData(metadata),
            securityEvent: true,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log audit trail (user actions, data changes)
     */
    audit: (action, metadata = {}) => {
        logger.info(`[AUDIT] ${action}`, {
            ...sanitizeData(metadata),
            auditEvent: true,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log performance metrics
     */
    performance: (operation, duration, metadata = {}) => {
        logger.info(`[PERFORMANCE] ${operation}`, {
            ...sanitizeData(metadata),
            duration,
            performanceEvent: true,
            timestamp: new Date().toISOString()
        });
    }
};

export default enhancedLogger;
