/**
 * JWT Token Service
 * Handles token generation, verification, and refresh
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Validate JWT_SECRET exists and is secure
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_PREVIOUS; // For secret rotation
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

// Critical security validation
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Application cannot start without a secure JWT secret.');
}

if (JWT_SECRET.length < 64) {
    throw new Error('FATAL: JWT_SECRET must be at least 64 characters long for security. Current length: ' + JWT_SECRET.length);
}

// Check for insecure default secrets
const INSECURE_SECRETS = [
    'your-super-secret-jwt-key-change-in-production',
    'secret',
    'changeme',
    'default',
    'test',
    'development'
];

if (INSECURE_SECRETS.some(insecure => JWT_SECRET.toLowerCase().includes(insecure.toLowerCase()))) {
    throw new Error('FATAL: JWT_SECRET contains an insecure default value. Please generate a secure random secret.');
}

logger.info('JWT_SECRET validation passed');
if (JWT_SECRET_PREVIOUS) {
    logger.info('Secret rotation enabled with JWT_SECRET_PREVIOUS');
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(user) {
    const payload = {
        userId: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRY
    });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(user) {
    const tokenId = crypto.randomBytes(32).toString('hex');

    const payload = {
        userId: user._id,
        tokenId,
        type: 'refresh'
    };

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRY
    });

    return { token, tokenId };
}

/**
 * Verify access token
 * Supports secret rotation - tries current secret first, then previous
 */
export function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        // Try previous secret if rotation is in progress
        if (JWT_SECRET_PREVIOUS) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET_PREVIOUS);

                if (decoded.type !== 'access') {
                    throw new Error('Invalid token type');
                }

                logger.warn('Token verified with previous secret - rotation in progress');
                return decoded;
            } catch (rotationError) {
                // Both secrets failed
                throw new Error('Invalid or expired token');
            }
        }

        throw new Error('Invalid or expired token');
    }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * Generate temporary reset token (for password reset)
 */
export function generateResetToken(userId) {
    const payload = {
        userId,
        type: 'reset',
        timestamp: Date.now()
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '10m' // 10 minutes for password reset
    });
}

/**
 * Verify reset token
 */
export function verifyResetToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== 'reset') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired reset token');
    }
}

/**
 * Calculate token expiry date
 */
export function getTokenExpiryDate(expiryString = JWT_REFRESH_EXPIRY) {
    const match = expiryString.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return new Date(Date.now() + value * multipliers[unit]);
}
