/**
 * Complaint Validation Schemas
 */

import Joi from 'joi';

/**
 * Create Complaint Validation
 */
export const createComplaintSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(10)
        .max(200)
        .required()
        .messages({
            'string.min': 'Title must be at least 10 characters',
            'string.max': 'Title cannot exceed 200 characters'
        }),

    description: Joi.string()
        .trim()
        .min(20)
        .max(2000)
        .required()
        .messages({
            'string.min': 'Description must be at least 20 characters',
            'string.max': 'Description cannot exceed 2000 characters'
        }),

    category: Joi.string()
        .valid('roads', 'water', 'electricity', 'sanitation', 'public_safety', 'other')
        .required(),

    location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array()
            .items(Joi.number())
            .length(2)
            .required()
            .messages({
                'array.length': 'Coordinates must contain exactly 2 numbers [longitude, latitude]'
            }),
        address: Joi.string().trim().max(500)
    }).required(),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .default('medium')
}).strict();

/**
 * Update Complaint Validation
 */
export const updateComplaintSchema = Joi.object({
    title: Joi.string().trim().min(10).max(200),
    description: Joi.string().trim().min(20).max(2000),
    category: Joi.string().valid('roads', 'water', 'electricity', 'sanitation', 'public_safety', 'other'),
    status: Joi.string().valid('pending', 'in_progress', 'resolved', 'rejected')
}).min(1).strict(); // At least one field required

export default {
    createComplaintSchema,
    updateComplaintSchema
};
