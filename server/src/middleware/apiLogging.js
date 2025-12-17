/**
 * API Request/Response Logging Middleware
 * TASK-014: Comprehensive API logging for debugging and monitoring
 */

import logger from '../utils/logger.js';
import { auditLog } from '../utils/auditLog.js';

/**
 * Log API request details
 */
export const logRequest = (req, res, next) => {
    const startTime = Date.now();

    // Store original end function
    const originalEnd = res.end;

    // Capture response body
    let responseBody = '';
    const originalWrite = res.write;
    const originalSend = res.send;

    res.write = function (chunk, ...args) {
        if (chunk) {
            responseBody += chunk.toString();
        }
        return originalWrite.apply(res, [chunk, ...args]);
    };

    res.send = function (data) {
        responseBody = data;
        return originalSend.apply(res, [data]);
    };

    // Override end to log after response
    res.end = function (...args) {
        const duration = Date.now() - startTime;

        // Sanitize sensitive data
        const sanitizedBody = sanitizeRequestBody(req.body);
        const sanitizedQuery = sanitizeQueryParams(req.query);

        // Log request/response
        const logData = {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id || req.user?._id?.toString(),
            query: sanitizedQuery,
            bodyKeys: req.body ? Object.keys(req.body) : [],
            responseSize: responseBody.length
        };

        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error('API Request Failed', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('API Request Error', logData);
        } else {
            logger.http('API Request', logData);
        }

        // Call original end
        originalEnd.apply(res, args);
    };

    next();
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeRequestBody = (body) => {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'otp', 'creditCard', 'ssn'];

    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
};

/**
 * Sanitize query parameters
 */
const sanitizeQueryParams = (query) => {
    if (!query || typeof query !== 'object') {
        return query;
    }

    const sanitized = { ...query };
    const sensitiveParams = ['token', 'apiKey', 'password'];

    for (const param of sensitiveParams) {
        if (param in sanitized) {
            sanitized[param] = '[REDACTED]';
        }
    }

    return sanitized;
};

/**
 * Log slow API requests
 */
export const logSlowRequests = (threshold = 1000) => {
    return (req, res, next) => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;

            if (duration > threshold) {
                logger.warn('Slow API Request', {
                    method: req.method,
                    path: req.path,
                    duration: `${duration}ms`,
                    threshold: `${threshold}ms`,
                    userId: req.user?.id
                });
            }
        });

        next();
    };
};

export default {
    logRequest,
    logSlowRequests
};
