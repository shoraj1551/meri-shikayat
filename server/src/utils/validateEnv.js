/**
 * Environment Variable Validation
 * Ensures critical environment variables are set and secure
 */

import logger from './logger.js';

export const validateEnvironment = () => {
    const errors = [];
    const warnings = [];

    // Check for required variables
    const required = ['MONGODB_URI', 'JWT_SECRET'];
    required.forEach(varName => {
        if (!process.env[varName]) {
            errors.push(`Missing required environment variable: ${varName}`);
        }
    });

    // Check for insecure JWT_SECRET in production
    if (process.env.NODE_ENV === 'production') {
        const insecureSecrets = [
            'meri-shikayat-secret-key-change-this-in-production-2024',
            'your-super-secret-jwt-key-change-in-production',
            'secret',
            'changeme',
            'default',
            'test',
            'development'
        ];

        if (insecureSecrets.some(secret => process.env.JWT_SECRET?.toLowerCase().includes(secret.toLowerCase()))) {
            errors.push('CRITICAL: Default or insecure JWT_SECRET detected in production! Generate a secure random secret using: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
        }

        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
            errors.push('CRITICAL: JWT_SECRET must be at least 64 characters long for production. Current length: ' + process.env.JWT_SECRET.length);
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            errors.push('EMAIL_USER and EMAIL_PASSWORD are required in production for administrator OTP delivery');
        }

        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            errors.push('VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are required in production for push notifications');
        }
    } else {
        // Even in development, warn about weak secrets
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
            warnings.push('JWT_SECRET should be at least 64 characters long. Current length: ' + process.env.JWT_SECRET.length);
        }
    }

    const base64Url = /^[A-Za-z0-9_-]+$/;
    if (process.env.VAPID_PUBLIC_KEY &&
        (process.env.VAPID_PUBLIC_KEY.length !== 87 || !base64Url.test(process.env.VAPID_PUBLIC_KEY))) {
        errors.push('VAPID_PUBLIC_KEY must be a valid base64url-encoded VAPID public key');
    }
    if (process.env.VAPID_PRIVATE_KEY &&
        (process.env.VAPID_PRIVATE_KEY.length !== 43 || !base64Url.test(process.env.VAPID_PRIVATE_KEY))) {
        errors.push('VAPID_PRIVATE_KEY must be a valid base64url-encoded VAPID private key');
    }
    if (process.env.VAPID_MAILTO && !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.VAPID_MAILTO)) {
        errors.push('VAPID_MAILTO must be a valid mailto: address');
    }

    // Check CORS configuration in production
    if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
        warnings.push('CORS_ORIGIN not set in production. Using default localhost origins.');
    }

    if (process.env.ML_SERVICE_ENABLED === 'true') {
        if (!process.env.ML_SERVICE_URL) {
            errors.push('ML_SERVICE_URL is required when ML_SERVICE_ENABLED=true');
        } else {
            try {
                const url = new URL(process.env.ML_SERVICE_URL);
                if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
            } catch {
                errors.push('ML_SERVICE_URL must be a valid HTTP(S) URL');
            }
        }
    }

    // Display errors and warnings
    if (errors.length > 0) {
        logger.error('ENVIRONMENT VALIDATION ERRORS');
        errors.forEach(err => logger.error(`  ${err}`));
        throw new Error('Invalid environment configuration');
    }

    if (warnings.length > 0) {
        logger.warn('ENVIRONMENT VALIDATION WARNINGS');
        warnings.forEach(warn => logger.warn(`  ${warn}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
        logger.info('Environment validation passed');
    }
};
