/**
 * Secrets Management Configuration
 * TASK-007: Integrate with AWS Secrets Manager or environment-based secrets
 * 
 * IMPORTANT: For production, use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
 * This implementation provides a foundation with environment variable fallback
 */

import logger from '../utils/logger.js';

// Secrets configuration
const secrets = {
    // Database
    mongodbUri: process.env.MONGODB_URI,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtSecretPrevious: process.env.JWT_SECRET_PREVIOUS,
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',

    // Redis
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: process.env.REDIS_PORT || 6379,
    redisPassword: process.env.REDIS_PASSWORD,

    // SMS (Fast2SMS)
    fast2smsApiKey: process.env.FAST2SMS_API_KEY,

    // Email
    emailService: process.env.EMAIL_SERVICE || 'gmail',
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASSWORD,

    // OTP
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
    otpLength: parseInt(process.env.OTP_LENGTH) || 6,

    // ML Service
    mlServiceUrl: process.env.ML_SERVICE_URL,
    mlServiceEnabled: process.env.ML_SERVICE_ENABLED === 'true',

    // CORS
    corsOrigin: process.env.CORS_ORIGIN,

    // File Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 20971520, // 20MB
    uploadPath: process.env.UPLOAD_PATH || './uploads'
};

/**
 * Validate that all required secrets are present
 */
export const validateSecrets = () => {
    const required = [
        'mongodbUri',
        'jwtSecret'
    ];

    const missing = [];

    for (const key of required) {
        if (!secrets[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        logger.error('Missing required secrets', { missing });
        throw new Error(`Missing required secrets: ${missing.join(', ')}`);
    }

    // Validate JWT secret strength
    if (secrets.jwtSecret.length < 64) {
        logger.error('JWT_SECRET is too short', { length: secrets.jwtSecret.length });
        throw new Error('JWT_SECRET must be at least 64 characters for security');
    }

    logger.info('All required secrets validated successfully');
};

/**
 * Get a secret value
 * @param {string} key - Secret key
 * @returns {any} Secret value
 */
export const getSecret = (key) => {
    if (!(key in secrets)) {
        logger.warn('Attempted to access non-existent secret', { key });
        return undefined;
    }
    return secrets[key];
};

/**
 * Check if a secret exists
 * @param {string} key - Secret key
 * @returns {boolean} True if secret exists
 */
export const hasSecret = (key) => {
    return key in secrets && secrets[key] !== undefined && secrets[key] !== '';
};

/**
 * Get all secret keys (for debugging - does not expose values)
 * @returns {string[]} Array of secret keys
 */
export const getSecretKeys = () => {
    return Object.keys(secrets);
};

/**
 * Get secrets status (for health checks - does not expose values)
 * @returns {Object} Status of each secret (present/missing)
 */
export const getSecretsStatus = () => {
    const status = {};
    for (const key of Object.keys(secrets)) {
        status[key] = secrets[key] ? 'present' : 'missing';
    }
    return status;
};

// TODO: AWS Secrets Manager Integration (for production)
/**
 * Load secrets from AWS Secrets Manager
 * Uncomment and configure when deploying to AWS
 */
/*
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "us-east-1"
});

export const loadSecretsFromAWS = async (secretName) => {
    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT"
            })
        );
        
        const secretString = response.SecretString;
        const awsSecrets = JSON.parse(secretString);
        
        // Merge AWS secrets with environment secrets
        Object.assign(secrets, awsSecrets);
        
        logger.info('Secrets loaded from AWS Secrets Manager');
        return true;
    } catch (error) {
        logger.error('Failed to load secrets from AWS', { error: error.message });
        throw error;
    }
};
*/

export default {
    validateSecrets,
    getSecret,
    hasSecret,
    getSecretKeys,
    getSecretsStatus
};
