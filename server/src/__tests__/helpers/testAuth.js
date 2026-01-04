/**
 * Test Authentication Helper
 * Utilities for authentication in tests
 */

import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../../services/token.service.js';

/**
 * Generate test JWT token for a user
 */
export function generateTestToken(user) {
    return generateAccessToken(user);
}

/**
 * Generate test refresh token
 */
export function generateTestRefreshToken(user) {
    return generateRefreshToken(user);
}

/**
 * Create authorization header
 */
export function createAuthHeader(token) {
    return { Authorization: `Bearer ${token}` };
}

/**
 * Extract user ID from token
 */
export function extractUserIdFromToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
}

/**
 * Create test user credentials
 */
export function createTestCredentials(overrides = {}) {
    return {
        email: `test${Date.now()}@example.com`,
        password: 'Test@123456',
        ...overrides
    };
}

/**
 * Create test registration data
 */
export function createTestRegistrationData(overrides = {}) {
    return {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: `98765${Math.floor(Math.random() * 100000)}`,
        password: 'Test@123456',
        location: {
            address: 'Test Address, Mumbai',
            pincode: '400001',
            city: 'Mumbai',
            state: 'Maharashtra',
            coordinates: {
                latitude: 19.0760,
                longitude: 72.8777
            }
        },
        ...overrides
    };
}

export default {
    generateTestToken,
    generateTestRefreshToken,
    createAuthHeader,
    extractUserIdFromToken,
    createTestCredentials,
    createTestRegistrationData
};
