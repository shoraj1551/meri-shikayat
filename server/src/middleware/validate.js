/**
 * Validation Middleware
 * Validates request data against Joi schemas
 */

import logger from '../utils/logger.js';

/**
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {String} property - Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first
            stripUnknown: true, // Remove unknown fields
            convert: true // Type coercion
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            logger.warn('Validation failed', {
                property,
                errors,
                userId: req.user?.id,
                ip: req.ip,
                path: req.path
            });

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Replace request data with validated and sanitized data
        req[property] = value;
        next();
    };
};

export default validate;
