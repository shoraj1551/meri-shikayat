/**
 * Comprehensive Input Validation Middleware using Joi
 * Prevents injection attacks, XSS, and data corruption
 */

import Joi from 'joi';
import sanitizeHtml from 'sanitize-html';
import logger from '../utils/logger.js';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
const sanitizeHtmlContent = (value) => {
    return sanitizeHtml(value, {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {},
        disallowedTagsMode: 'discard'
    });
};

/**
 * Custom Joi string validator with HTML sanitization
 */
const sanitizedString = () => Joi.string().custom((value, helpers) => {
    const sanitized = sanitizeHtmlContent(value);
    if (sanitized !== value) {
        logger.security('HTML content detected and sanitized', {
            original: value.substring(0, 100),
            sanitized: sanitized.substring(0, 100)
        });
    }
    return sanitized;
});

/**
 * Validation middleware factory
 */
export const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
            convert: true // Type conversion
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            logger.warn('Validation failed', {
                errors,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                endpoint: req.path
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

// ==================== AUTH SCHEMAS ====================

export const registerSchema = Joi.object({
    firstName: sanitizedString()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required'
        }),

    lastName: sanitizedString()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required'
        }),

    dateOfBirth: Joi.date()
        .max('now')
        .required()
        .custom((value, helpers) => {
            const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 13) {
                return helpers.error('any.invalid', { message: 'You must be at least 13 years old' });
            }
            if (age > 120) {
                return helpers.error('any.invalid', { message: 'Invalid date of birth' });
            }
            return value;
        })
        .messages({
            'date.max': 'Date of birth cannot be in the future',
            'any.required': 'Date of birth is required'
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } }) // Allow all TLDs
        .lowercase()
        .trim()
        .max(255)
        .optional()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 255 characters'
        }),

    phone: Joi.string()
        .pattern(/^[6-9][0-9]{9}$/) // Indian phone number format
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid 10-digit Indian phone number starting with 6-9'
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required'
        }),

    gender: Joi.string()
        .valid('male', 'female', 'other', 'prefer-not-to-say')
        .optional(),

    address: sanitizedString()
        .max(500)
        .optional()
}).or('email', 'phone').messages({
    'object.missing': 'Either email or phone number is required'
});

export const loginSchema = Joi.object({
    identifier: Joi.string()
        .required()
        .custom((value, helpers) => {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            const isPhone = /^[6-9][0-9]{9}$/.test(value);
            if (!isEmail && !isPhone) {
                return helpers.error('any.invalid');
            }
            return value;
        })
        .messages({
            'any.required': 'Email or phone number is required',
            'any.invalid': 'Please provide a valid email or 10-digit phone number'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

export const otpVerificationSchema = Joi.object({
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers',
            'any.required': 'OTP is required'
        })
});

// ==================== COMPLAINT SCHEMAS ====================

export const complaintSchema = Joi.object({
    title: sanitizedString()
        .min(10)
        .max(200)
        .required()
        .messages({
            'string.min': 'Title must be at least 10 characters',
            'string.max': 'Title cannot exceed 200 characters',
            'any.required': 'Title is required'
        }),

    description: sanitizedString()
        .min(20)
        .max(5000)
        .required()
        .messages({
            'string.min': 'Description must be at least 20 characters',
            'string.max': 'Description cannot exceed 5000 characters',
            'any.required': 'Description is required'
        }),

    category: Joi.string()
        .valid(
            'infrastructure',
            'public-service',
            'utilities',
            'safety',
            'environment',
            'health',
            'education',
            'transport',
            'other'
        )
        .required()
        .messages({
            'any.only': 'Invalid category',
            'any.required': 'Category is required'
        }),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium'),

    location: Joi.object({
        address: sanitizedString().max(500).required(),
        city: sanitizedString().max(100).required(),
        state: sanitizedString().max(100).required(),
        pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required(),
        coordinates: Joi.object({
            latitude: Joi.number().min(-90).max(90).optional(),
            longitude: Joi.number().min(-180).max(180).optional()
        }).optional()
    }).optional(),

    isAnonymous: Joi.boolean().default(false)
});

export const guestComplaintSchema = Joi.object({
    title: sanitizedString().min(10).max(200).required(),
    description: sanitizedString().min(20).max(5000).required(),
    category: Joi.string().valid('infrastructure', 'public-service', 'utilities', 'safety', 'environment', 'health', 'education', 'transport', 'other').required(),
    guestName: sanitizedString().min(2).max(100).required(),
    guestEmail: Joi.string().email().optional(),
    guestPhone: Joi.string().pattern(/^[6-9][0-9]{9}$/).optional(),
    location: Joi.object({
        address: sanitizedString().max(500).required(),
        city: sanitizedString().max(100).required(),
        state: sanitizedString().max(100).required(),
        pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required()
    }).optional()
}).or('guestEmail', 'guestPhone');

// ==================== ADMIN SCHEMAS ====================

export const adminRegisterSchema = Joi.object({
    firstName: sanitizedString().min(2).max(50).required(),
    lastName: sanitizedString().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    phone: Joi.string().pattern(/^[6-9][0-9]{9}$/).required(),
    password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
    department: sanitizedString().max(100).optional(),
    designation: sanitizedString().max(100).optional(),
    employeeId: sanitizedString().max(50).optional()
});

export const updateComplaintStatusSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'in_progress', 'resolved', 'rejected', 'closed')
        .required(),
    statusComment: sanitizedString().min(10).max(1000).optional(),
    internalNotes: sanitizedString().max(2000).optional()
});

// ==================== USER PROFILE SCHEMAS ====================

export const updateProfileSchema = Joi.object({
    firstName: sanitizedString().min(2).max(50).optional(),
    lastName: sanitizedString().min(2).max(50).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').optional(),
    address: sanitizedString().max(500).optional(),
    city: sanitizedString().max(100).optional(),
    state: sanitizedString().max(100).optional(),
    pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).optional(),
    bio: sanitizedString().max(500).optional()
}).min(1); // At least one field must be provided

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .invalid(Joi.ref('currentPassword'))
        .messages({
            'any.invalid': 'New password must be different from current password'
        })
});

// ==================== COMMENT SCHEMAS ====================

export const commentSchema = Joi.object({
    content: sanitizedString()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'string.min': 'Comment cannot be empty',
            'string.max': 'Comment cannot exceed 1000 characters',
            'any.required': 'Comment content is required'
        })
});

// ==================== QUERY PARAMETER SCHEMAS ====================

export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title', 'status', 'priority').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const searchSchema = Joi.object({
    q: sanitizedString().min(1).max(200).required(),
    category: Joi.string().valid('infrastructure', 'public-service', 'utilities', 'safety', 'environment', 'health', 'education', 'transport', 'other').optional(),
    status: Joi.string().valid('pending', 'in_progress', 'resolved', 'rejected', 'closed').optional()
});

// ==================== ID VALIDATION ====================

export const mongoIdSchema = Joi.object({
    id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid ID format',
            'any.required': 'ID is required'
        })
});

export default {
    validateRequest,
    registerSchema,
    loginSchema,
    otpVerificationSchema,
    complaintSchema,
    guestComplaintSchema,
    adminRegisterSchema,
    updateComplaintStatusSchema,
    updateProfileSchema,
    changePasswordSchema,
    commentSchema,
    paginationSchema,
    searchSchema,
    mongoIdSchema
};
