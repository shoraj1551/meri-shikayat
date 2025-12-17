/**
 * Authentication Validation Schemas
 * Comprehensive input validation for auth endpoints using Joi
 */

import Joi from 'joi';

/**
 * User Registration Validation
 */
export const registerSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            'string.pattern.base': 'First name can only contain letters and spaces',
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters'
        }),

    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Last name can only contain letters and spaces'
        }),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),

    phone: Joi.string()
        .trim()
        .pattern(/^[6-9]\d{9}$/)
        .required()
        .messages({
            'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number'
        }),

    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'string.min': 'Password must be at least 8 characters long'
        }),

    userType: Joi.string()
        .valid('general_user', 'contractor')
        .default('general_user')
}).strict(); // Reject unknown fields

/**
 * User Login Validation
 */
export const loginSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Email or phone number is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        }),

    rememberMe: Joi.boolean()
        .default(false)
}).strict();

/**
 * Password Reset Request Validation
 */
export const passwordResetRequestSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .required()
        .messages({
            'any.required': 'Email or phone number is required'
        })
}).strict();

/**
 * OTP Verification Validation
 */
export const otpVerificationSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .required(),

    otp: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers'
        })
}).strict();

/**
 * Password Reset Validation
 */
export const passwordResetSchema = Joi.object({
    identifier: Joi.string()
        .trim()
        .required(),

    otp: Joi.string()
        .length(6)
        .pattern(/^\d{6}$/)
        .required(),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        })
}).strict();

export default {
    registerSchema,
    loginSchema,
    passwordResetRequestSchema,
    otpVerificationSchema,
    passwordResetSchema
};
