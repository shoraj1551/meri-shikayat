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
            'secret',
            'changeme',
            'default'
        ];

        if (insecureSecrets.some(secret => process.env.JWT_SECRET?.includes(secret))) {
            errors.push('CRITICAL: Default or insecure JWT_SECRET detected in production! Generate a secure random secret.');
        }

        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            warnings.push('JWT_SECRET should be at least 32 characters long for production');
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
