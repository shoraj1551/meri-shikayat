/**
 * Environment Variable Validation
 * Ensures critical environment variables are set and secure
 */

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
        console.error('\n🚨 ENVIRONMENT VALIDATION ERRORS:');
        errors.forEach(err => console.error(`  ❌ ${err}`));
        console.error('\n');
        process.exit(1);
    }

    if (warnings.length > 0) {
        console.warn('\n⚠️  ENVIRONMENT VALIDATION WARNINGS:');
        warnings.forEach(warn => console.warn(`  ⚠️  ${warn}`));
        console.warn('\n');
    }

    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ Environment validation passed\n');
    }
};
