/**
 * Request Signing Middleware
 * TASK-013: Implement request signing for API security
 * Ensures request integrity and prevents replay attacks
 */

import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Generate signature for request
 * @param {Object} payload - Request payload
 * @param {string} secret - Signing secret
 * @param {number} timestamp - Request timestamp
 * @returns {string} HMAC signature
 */
export const generateSignature = (payload, secret, timestamp) => {
    const data = JSON.stringify(payload) + timestamp;
    return crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('hex');
};

/**
 * Verify request signature
 * @param {Object} req - Express request
 * @param {string} secret - Signing secret
 * @returns {boolean} True if signature is valid
 */
export const verifySignature = (req, secret) => {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!signature || !timestamp) {
        return false;
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - requestTime);

    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
        logger.security('Request signature expired', {
            timeDiff,
            ip: req.ip
        });
        return false;
    }

    // Generate expected signature
    const expectedSignature = generateSignature(req.body, secret, timestamp);

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

/**
 * Middleware to require request signing
 * @param {string} secret - Signing secret (optional, uses env var if not provided)
 */
export const requireSignature = (secret = process.env.API_SIGNING_SECRET) => {
    return (req, res, next) => {
        if (!secret) {
            logger.error('API_SIGNING_SECRET not configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        if (!verifySignature(req, secret)) {
            logger.security('Invalid request signature', {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('user-agent')
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid or expired request signature'
            });
        }

        next();
    };
};

export default {
    generateSignature,
    verifySignature,
    requireSignature
};
