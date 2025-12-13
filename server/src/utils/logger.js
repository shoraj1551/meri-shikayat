/**
 * Winston Logger Configuration
 * Environment-based logging with proper levels and no sensitive data exposure
 */

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// Determine log level based on environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
const logger = winston.createLogger({
    level,
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Console transport for development
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            ),
            silent: process.env.NODE_ENV === 'test' // Silence logs during testing
        }),
        // File transport for errors (always enabled)
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // File transport for all logs (production only)
        ...(process.env.NODE_ENV === 'production' ? [
            new winston.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })
        ] : [])
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false
});

// Helper function to sanitize sensitive data from logs
const sanitizeLogData = (data) => {
    if (typeof data !== 'object' || data === null) {
        return data;
    }

    const sensitiveFields = ['password', 'token', 'refreshToken', 'otp', 'secret', 'apiKey'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
};

// Export logger with sanitization wrapper
export default {
    error: (message, meta) => logger.error(message, sanitizeLogData(meta)),
    warn: (message, meta) => logger.warn(message, sanitizeLogData(meta)),
    info: (message, meta) => logger.info(message, sanitizeLogData(meta)),
    http: (message, meta) => logger.http(message, sanitizeLogData(meta)),
    debug: (message, meta) => logger.debug(message, sanitizeLogData(meta))
};
