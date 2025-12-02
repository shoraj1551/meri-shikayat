/**
 * Validation utilities
 */

import { body, validationResult } from 'express-validator';

// Validation middleware
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const registerValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('dateOfBirth')
        .notEmpty().withMessage('Date of birth is required')
        .isISO8601().withMessage('Please provide a valid date')
        .custom((value) => {
            const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 13) {
                throw new Error('You must be at least 13 years old to register');
            }
            return true;
        }),
    body('email')
        .optional()
        .isEmail().withMessage('Please provide a valid email'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // Custom validator to ensure at least one contact method
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.phone) {
            throw new Error('Either email or phone number is required');
        }
        return true;
    })
];

// User login validation
export const loginValidation = [
    body('identifier')
        .notEmpty().withMessage('Email or phone number is required')
        .custom((value) => {
            const isEmail = /^\S+@\S+\.\S+$/.test(value);
            const isPhone = /^[0-9]{10}$/.test(value);
            if (!isEmail && !isPhone) {
                throw new Error('Please provide a valid email or 10-digit phone number');
            }
            return true;
        }),
    body('password').notEmpty().withMessage('Password is required')
];

// Complaint creation validation
export const complaintValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['infrastructure', 'public-service', 'utilities', 'safety', 'environment', 'other'])
        .withMessage('Invalid category')
];

// Admin registration validation
export const adminRegisterValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email')
        .isEmail().withMessage('Please provide a valid email'),
    body('phone')
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('department').optional().trim(),
    body('designation').optional().trim()
];

// Admin login validation
export const adminLoginValidation = [
    body('identifier')
        .notEmpty().withMessage('Email or phone number is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Permission request validation
export const permissionRequestValidation = [
    body('requestedPermissions')
        .isArray({ min: 1 }).withMessage('At least one permission must be requested'),
    body('reason')
        .trim()
        .isLength({ min: 20 }).withMessage('Reason must be at least 20 characters providing justification')
];
