/**
 * Custom Error Classes
 * Standardized error handling across the application
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, 403);
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(message, 429);
    }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error', isOperational = false) {
        super(message, 500, isOperational);
    }
}

export default {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    InternalServerError
};
