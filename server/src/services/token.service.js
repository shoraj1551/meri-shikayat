/**
 * JWT Token Service
 * Handles token generation, verification, and refresh
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

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
 */
export function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
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
