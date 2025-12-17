/**
 * Request Logging Middleware
 * Comprehensive HTTP request/response logging with performance tracking
 */

import { randomUUID } from 'crypto';
import logger from '../utils/logger.js';

/**
 * Generate unique request ID for tracking
 */
const generateRequestId = () => {
    return randomUUID();
};

/**
 * Request logging middleware
 * Logs all HTTP requests with timing, status, and metadata
 */
export const requestLogger = (req, res, next) => {
    // Generate and attach request ID
    const requestId = generateRequestId();
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    // Capture request start time
    const startTime = Date.now();

    // Log incoming request
    logger.http('Incoming request', {
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
        query: req.query,
        params: req.params
    });

    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
        res.send = originalSend;

        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Determine log level based on status code
        const logLevel = statusCode >= 500 ? 'error' :
            statusCode >= 400 ? 'warn' :
                'http';

        // Log response
        logger[logLevel]('Request completed', {
            requestId,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode,
            duration,
            ip: req.ip,
            userId: req.user?.id,
            contentLength: res.get('content-length')
        });

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            logger.performance('Slow request detected', duration, {
                requestId,
                method: req.method,
                url: req.originalUrl || req.url,
                userId: req.user?.id
            });
        }

        return originalSend.call(this, data);
    };

    next();
};

/**
 * Error request logging
 * Logs requests that result in errors
 */
export const errorRequestLogger = (err, req, res, next) => {
    logger.error('Request error', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        ip: req.ip
    });

    next(err);
};

export default {
    requestLogger,
    errorRequestLogger
};
