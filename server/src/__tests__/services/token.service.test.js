/**
 * Token Service Tests
 * Tests for JWT token generation and verification
 */

import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateResetToken,
    verifyResetToken,
    getTokenExpiryDate
} from '../../services/token.service.js';

describe('Token Service Tests', () => {
    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        phone: '9876543210',
        role: 'user'
    };

    describe('Access Token Generation and Verification', () => {
        it('should generate a valid access token', () => {
            const token = generateAccessToken(mockUser);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        it('should verify a valid access token', () => {
            const token = generateAccessToken(mockUser);
            const decoded = verifyAccessToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(mockUser._id);
            expect(decoded.email).toBe(mockUser.email);
            expect(decoded.type).toBe('access');
        });

        it('should reject an invalid access token', () => {
            const invalidToken = 'invalid.token.here';

            expect(() => {
                verifyAccessToken(invalidToken);
            }).toThrow();
        });

        it('should reject an expired access token', () => {
            jest.useFakeTimers();
            const token = generateAccessToken(mockUser);
            jest.advanceTimersByTime(16 * 60 * 1000);
            expect(() => verifyAccessToken(token)).toThrow('Invalid or expired token');
        });
    });

    describe('Refresh Token Generation and Verification', () => {
        it('should generate a valid refresh token with tokenId', () => {
            const { token, tokenId } = generateRefreshToken(mockUser);

            expect(token).toBeDefined();
            expect(tokenId).toBeDefined();
            expect(typeof token).toBe('string');
            expect(typeof tokenId).toBe('string');
            expect(tokenId).toHaveLength(64); // 32 bytes in hex = 64 chars
        });

        it('should verify a valid refresh token', () => {
            const { token } = generateRefreshToken(mockUser);
            const decoded = verifyRefreshToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(mockUser._id);
            expect(decoded.type).toBe('refresh');
            expect(decoded.tokenId).toBeDefined();
        });

        it('should reject an invalid refresh token', () => {
            const invalidToken = 'invalid.refresh.token';

            expect(() => {
                verifyRefreshToken(invalidToken);
            }).toThrow();
        });
    });

    describe('Reset Token Generation and Verification', () => {
        it('should generate a valid reset token', () => {
            const token = generateResetToken(mockUser._id);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should verify a valid reset token', () => {
            const token = generateResetToken(mockUser._id);
            const decoded = verifyResetToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(mockUser._id);
            expect(decoded.type).toBe('reset');
            expect(decoded.timestamp).toBeDefined();
        });

        it('should reject an invalid reset token', () => {
            const invalidToken = 'invalid.reset.token';

            expect(() => {
                verifyResetToken(invalidToken);
            }).toThrow();
        });
    });

    describe('Token Expiry Date Calculation', () => {
        it('should calculate correct expiry date for seconds', () => {
            const now = Date.now();
            const expiryDate = getTokenExpiryDate('60s');
            const expectedTime = now + (60 * 1000);

            expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedTime - 100);
            expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
        });

        it('should calculate correct expiry date for minutes', () => {
            const now = Date.now();
            const expiryDate = getTokenExpiryDate('15m');
            const expectedTime = now + (15 * 60 * 1000);

            expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedTime - 100);
            expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
        });

        it('should calculate correct expiry date for hours', () => {
            const now = Date.now();
            const expiryDate = getTokenExpiryDate('2h');
            const expectedTime = now + (2 * 60 * 60 * 1000);

            expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedTime - 100);
            expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
        });

        it('should calculate correct expiry date for days', () => {
            const now = Date.now();
            const expiryDate = getTokenExpiryDate('30d');
            const expectedTime = now + (30 * 24 * 60 * 60 * 1000);

            expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedTime - 100);
            expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
        });

        it('should return default 30 days for invalid format', () => {
            const now = Date.now();
            const expiryDate = getTokenExpiryDate('invalid');
            const expectedTime = now + (30 * 24 * 60 * 60 * 1000);

            expect(expiryDate.getTime()).toBeGreaterThanOrEqual(expectedTime - 100);
            expect(expiryDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
        });
    });

    describe('Token Security', () => {
        it('should change access tokens when the issued-at second changes', () => {
            jest.useFakeTimers();
            const token1 = generateAccessToken(mockUser);
            jest.advanceTimersByTime(1000);
            const token2 = generateAccessToken(mockUser);

            // Tokens should be different due to different iat (issued at) timestamps
            expect(token1).not.toBe(token2);
        });

        it('should generate different tokenIds for refresh tokens', () => {
            const { tokenId: id1 } = generateRefreshToken(mockUser);
            const { tokenId: id2 } = generateRefreshToken(mockUser);

            expect(id1).not.toBe(id2);
        });

        it('should include user information in token payload', () => {
            const token = generateAccessToken(mockUser);
            const decoded = verifyAccessToken(token);

            expect(decoded.userId).toBe(mockUser._id);
            expect(decoded.email).toBe(mockUser.email);
            expect(decoded.phone).toBe(mockUser.phone);
            expect(decoded.role).toBe(mockUser.role);
        });
    });
});
import { jest } from '@jest/globals';
