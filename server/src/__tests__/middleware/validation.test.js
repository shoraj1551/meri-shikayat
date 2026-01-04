/**
 * Validation Middleware Tests
 * Tests for Joi validation schemas
 */

import { validateRequest, registerSchema, loginSchema, complaintSchema } from '../../../src/middleware/validation.js';

describe('Validation Middleware', () => {
    describe('registerSchema', () => {
        it('should validate valid registration data', () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '9876543210',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            };

            const { error } = registerSchema.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should reject password without special characters', () => {
            const invalidData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                password: 'Test1234'
            };

            const { error } = registerSchema.validate(invalidData);
            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('special character');
        });

        it('should reject users under 13 years old', () => {
            const invalidData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                password: 'Test@1234'
            };

            const { error } = registerSchema.validate(invalidData);
            expect(error).toBeDefined();
        });

        it('should require either email or phone', () => {
            const invalidData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            };

            const { error } = registerSchema.validate(invalidData);
            expect(error).toBeDefined();
            expect(error.message).toContain('email or phone');
        });

        it('should sanitize HTML in input', () => {
            const dataWithHTML = {
                firstName: '<script>alert("xss")</script>John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            };

            const { error, value } = registerSchema.validate(dataWithHTML);
            expect(error).toBeUndefined();
            expect(value.firstName).not.toContain('<script>');
        });
    });

    describe('loginSchema', () => {
        it('should validate email login', () => {
            const validData = {
                identifier: 'john@example.com',
                password: 'Test@1234'
            };

            const { error } = loginSchema.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should validate phone login', () => {
            const validData = {
                identifier: '9876543210',
                password: 'Test@1234'
            };

            const { error } = loginSchema.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should reject invalid identifier', () => {
            const invalidData = {
                identifier: 'invalid',
                password: 'Test@1234'
            };

            const { error } = loginSchema.validate(invalidData);
            expect(error).toBeDefined();
        });
    });

    describe('complaintSchema', () => {
        it('should validate valid complaint', () => {
            const validData = {
                title: 'Road pothole issue',
                description: 'There is a large pothole on Main Street causing traffic problems',
                category: 'infrastructure'
            };

            const { error } = complaintSchema.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should reject short title', () => {
            const invalidData = {
                title: 'Short',
                description: 'There is a large pothole on Main Street',
                category: 'infrastructure'
            };

            const { error } = complaintSchema.validate(invalidData);
            expect(error).toBeDefined();
        });

        it('should reject invalid category', () => {
            const invalidData = {
                title: 'Road pothole issue',
                description: 'There is a large pothole on Main Street',
                category: 'invalid-category'
            };

            const { error } = complaintSchema.validate(invalidData);
            expect(error).toBeDefined();
        });
    });
});
