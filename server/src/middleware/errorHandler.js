/**
 * Centralized Error Handler Middleware
 * Handles all errors in a consistent, secure manner
 */

import crypto from 'crypto';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

/**
 * Generate unique error ID for tracking
 */
const generateErrorId = () => {
    return crypto.randomBytes(8).toString('hex');
};

/**
 * Determine if error should be exposed to client
 */
const isOperationalError = (error) => {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
};

/**
 * Format error response for client
 */
const formatErrorResponse = (error, errorId, isDevelopment) => {
    const response = {
        success: false,
        message: error.message || 'An error occurred',
        errorId
    };

    // Add validation errors if present
    if (error.errors) {
        response.errors = error.errors;
    }

    // In development, include stack trace and additional details
    if (isDevelopment) {
        response.stack = error.stack;
        response.name = error.name;
    }

    return response;
};

/**
 * Log error with full context
 */
const logError = (error, req, errorId) => {
    const errorLog = {
        errorId,
        message: error.message,
        name: error.name,
        statusCode: error.statusCode || 500,
        stack: error.stack,
        isOperational: isOperationalError(error),
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id,
            body: sanitizeRequestBody(req.body),
            query: req.query,
            params: req.params
        },
        timestamp: new Date().toISOString()
    };

    // Log based on severity
    if (error.statusCode >= 500) {
        logger.error('Server error occurred', errorLog);
    } else if (error.statusCode >= 400) {
        logger.warn('Client error occurred', errorLog);
    } else {
        logger.info('Error occurred', errorLog);
    }
};

/**
 * Sanitize request body to remove sensitive data from logs
 */
const sanitizeRequestBody = (body) => {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token', 'otp', 'secret'];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

/**
 * Handle specific error types
 */
const handleSpecificErrors = (error) => {
    // MongoDB duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        error.message = `${field} already exists`;
        error.statusCode = 409;
    }

    // MongoDB cast error (invalid ObjectId)
    if (error.name === 'CastError') {
        error.message = 'Invalid ID format';
        error.statusCode = 400;
    }

    // MongoDB validation error
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message
        }));
        error.message = 'Validation failed';
        error.errors = errors;
        error.statusCode = 400;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (error.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    // Multer errors (file upload)
    if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FILE_SIZE') {
            error.message = 'File size exceeds maximum allowed size';
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            error.message = 'Too many files uploaded';
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            error.message = 'Unexpected file field';
        }
        error.statusCode = 400;
    }

    return error;
};

/**
 * Main error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Generate unique error ID
    const errorId = generateErrorId();

    // Handle specific error types
    let error = handleSpecificErrors(err);

    // Set default status code if not set
    error.statusCode = error.statusCode || 500;

    // Log the error
    logError(error, req, errorId);

    // Determine environment
    const isDevelopment = process.env.NODE_ENV === 'development';

    // For non-operational errors in production, send generic message
    if (!isDevelopment && !isOperationalError(error)) {
        error.message = 'An unexpected error occurred. Please try again later.';
    }

    // Format and send response
    const response = formatErrorResponse(error, errorId, isDevelopment);

    res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors (route not found)
 */
export const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Promise Rejection', {
            reason: reason instanceof Error ? reason.message : reason,
            stack: reason instanceof Error ? reason.stack : undefined,
            promise
        });

        // In production, you might want to exit the process
        if (process.env.NODE_ENV === 'production') {
            console.error('UNHANDLED REJECTION! Shutting down...');
            process.exit(1);
        }
    });
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception', {
            message: error.message,
            stack: error.stack
        });

        console.error('UNCAUGHT EXCEPTION! Shutting down...');
        process.exit(1);
    });
};

export default {
    errorHandler,
    notFoundHandler,
    handleUnhandledRejection,
    handleUncaughtException
};
