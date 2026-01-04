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
    } else {
        // Even in development, warn about weak secrets
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
            warnings.push('JWT_SECRET should be at least 64 characters long. Current length: ' + process.env.JWT_SECRET.length);
        }
    }

    // Check CORS configuration in production
    if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
        warnings.push('CORS_ORIGIN not set in production. Using default localhost origins.');
    }

    // Display errors and warnings
    if (errors.length > 0) {
        logger.error('ENVIRONMENT VALIDATION ERRORS');
        errors.forEach(err => logger.error(`  ${err}`));
        process.exit(1);
    }

    if (warnings.length > 0) {
        logger.warn('ENVIRONMENT VALIDATION WARNINGS');
        warnings.forEach(warn => logger.warn(`  ${warn}`));
    }

    if (errors.length === 0 && warnings.length === 0) {
        logger.info('Environment validation passed');
    }
};
