/**
 * Two-Factor Authentication (2FA)
 * TASK-030: Implement 2FA for admin accounts
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import logger from '../utils/logger.js';

/**
 * Generate 2FA secret for user
 */
export const generate2FASecret = async (userEmail) => {
    const secret = speakeasy.generateSecret({
        name: `Meri Shikayat (${userEmail})`,
        issuer: 'Meri Shikayat',
        length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    logger.info('2FA secret generated', { email: userEmail });

    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        otpauth_url: secret.otpauth_url
    };
};

/**
 * Verify 2FA token
 */
export const verify2FAToken = (secret, token) => {
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time steps before/after
    });

    if (verified) {
        logger.info('2FA token verified successfully');
    } else {
        logger.warn('2FA token verification failed');
    }

    return verified;
};

/**
 * Middleware to require 2FA
 */
export const require2FA = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Check if user has 2FA enabled
    if (!req.user.twoFactorEnabled) {
        return next(); // 2FA not required for this user
    }

    // Check if 2FA was verified in this session
    if (req.session && req.session.twoFactorVerified) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: '2FA verification required',
        require2FA: true
    });
};

/**
 * Generate backup codes
 */
export const generateBackupCodes = (count = 10) => {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = speakeasy.generateSecret({ length: 8 }).base32.slice(0, 8);
        codes.push(code);
    }

    logger.info('Backup codes generated', { count });
    return codes;
};

export default {
    generate2FASecret,
    verify2FAToken,
    require2FA,
    generateBackupCodes
};
