/**
 * OTP Service
 * Handles OTP generation, hashing, and verification
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const MAX_OTP_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS) || 5;

/**
 * Generate 6-digit OTP
 */
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP before storing
 */
export async function hashOTP(otp) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
}

/**
 * Verify OTP
 */
export async function verifyOTP(plainOTP, hashedOTP) {
    return await bcrypt.compare(plainOTP, hashedOTP);
}

/**
 * Get OTP expiry time
 */
export function getOTPExpiry() {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
}

/**
 * Check if max OTP attempts exceeded
 */
export function isMaxAttemptsExceeded(attempts) {
    return attempts >= MAX_OTP_ATTEMPTS;
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}
