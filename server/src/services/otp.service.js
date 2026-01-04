/**
 * OTP Service
 * Handles OTP generation, hashing, and verification
 * SECURITY: Uses cryptographically secure random number generation
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

// OTP Configuration
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10; // Changed from 5 to 10 minutes
const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS) || 3; // Changed from 5 to 3 attempts

/**
 * Generate cryptographically secure 6-digit OTP
 * SECURITY: Uses crypto.randomInt() instead of Math.random()
 */
export function generateOTP() {
    // Generate random number between 100000 and 999999 (6 digits)
    const otp = crypto.randomInt(100000, 1000000).toString();

    logger.debug('OTP generated', {
        length: otp.length,
        timestamp: new Date().toISOString()
    });

    return otp;
}

/**
 * Hash OTP before storing in database
 * Uses bcrypt for secure one-way hashing
 */
export async function hashOTP(otp) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(otp, salt);

    logger.debug('OTP hashed successfully');

    return hashed;
}

/**
 * Verify OTP against hashed version
 */
export async function verifyOTP(plainOTP, hashedOTP) {
    const isValid = await bcrypt.compare(plainOTP, hashedOTP);

    logger.debug('OTP verification attempt', {
        isValid,
        timestamp: new Date().toISOString()
    });

    return isValid;
}

/**
 * Get OTP expiry time (10 minutes from now)
 */
export function getOTPExpiry() {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiryDate) {
    if (!expiryDate) return true;
    return new Date() > new Date(expiryDate);
}

/**
 * Check if max OTP attempts exceeded (3 attempts)
 */
export function isMaxAttemptsExceeded(attempts) {
    return attempts >= MAX_OTP_ATTEMPTS;
}

/**
 * Generate secure random token for other purposes
 */
export function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Get OTP configuration (for logging/monitoring)
 */
export function getOTPConfig() {
    return {
        expiryMinutes: OTP_EXPIRY_MINUTES,
        maxAttempts: MAX_OTP_ATTEMPTS
    };
}

