/**
 * Production Readiness Test Script
 * Tests all critical services before production deployment
 */

import { getRedisClient, isRedisAvailable } from './src/config/redis.js';
import { testEmailConfig } from './src/services/email.service.js';
import { testSMSConfig } from './src/services/sms.service.js';
import mongoose from 'mongoose';
import logger from './src/utils/logger.js';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

async function testMongoDB() {
    log.info('Testing MongoDB connection...');
    try {
        if (!process.env.MONGODB_URI) {
            log.error('MONGODB_URI not set in environment');
            return false;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        log.success('MongoDB connected successfully');

        // Test write operation
        const testDoc = await mongoose.connection.db.collection('test').insertOne({ test: true });
        await mongoose.connection.db.collection('test').deleteOne({ _id: testDoc.insertedId });
        log.success('MongoDB write/delete operations successful');

        await mongoose.disconnect();
        return true;
    } catch (error) {
        log.error(`MongoDB connection failed: ${error.message}`);
        return false;
    }
}

async function testRedis() {
    log.info('Testing Redis connection...');
    try {
        const available = await isRedisAvailable();
        if (!available) {
            log.warn('Redis not available - rate limiting will use memory store');
            return false;
        }

        const client = getRedisClient();

        // Test SET
        await client.set('test:production:key', 'test-value', 'EX', 60);
        log.success('Redis SET operation successful');

        // Test GET
        const value = await client.get('test:production:key');
        if (value !== 'test-value') {
            throw new Error('Redis GET returned unexpected value');
        }
        log.success('Redis GET operation successful');

        // Test DEL
        await client.del('test:production:key');
        log.success('Redis DEL operation successful');

        return true;
    } catch (error) {
        log.error(`Redis test failed: ${error.message}`);
        return false;
    }
}

async function testEmail() {
    log.info('Testing Email service...');
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            log.warn('Email not configured - EMAIL_USER or EMAIL_PASSWORD missing');
            return false;
        }

        const result = await testEmailConfig();
        if (result) {
            log.success('Email service configured and ready');
            return true;
        } else {
            log.error('Email service test failed');
            return false;
        }
    } catch (error) {
        log.error(`Email test failed: ${error.message}`);
        return false;
    }
}

async function testSMS() {
    log.info('Testing SMS service...');
    try {
        const result = await testSMSConfig();
        if (result) {
            log.success('SMS service configured');
            return true;
        } else {
            log.warn('SMS service not configured (optional)');
            return false;
        }
    } catch (error) {
        log.warn(`SMS test failed: ${error.message} (optional)`);
        return false;
    }
}

function testEnvironmentVariables() {
    log.info('Checking environment variables...');

    const required = {
        'MONGODB_URI': process.env.MONGODB_URI,
        'JWT_SECRET': process.env.JWT_SECRET,
        'NODE_ENV': process.env.NODE_ENV
    };

    const optional = {
        'EMAIL_USER': process.env.EMAIL_USER,
        'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
        'REDIS_HOST': process.env.REDIS_HOST,
        'FAST2SMS_API_KEY': process.env.FAST2SMS_API_KEY,
        'SENTRY_DSN': process.env.SENTRY_DSN
    };

    let allRequired = true;

    console.log('\n📋 Required Variables:');
    for (const [key, value] of Object.entries(required)) {
        if (value) {
            log.success(`${key}: Set`);
        } else {
            log.error(`${key}: Missing`);
            allRequired = false;
        }
    }

    console.log('\n📋 Optional Variables:');
    for (const [key, value] of Object.entries(optional)) {
        if (value) {
            log.success(`${key}: Set`);
        } else {
            log.warn(`${key}: Not set`);
        }
    }

    // Check JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
        log.error('JWT_SECRET is too short (minimum 64 characters)');
        allRequired = false;
    }

    return allRequired;
}

async function runAllTests() {
    console.log('\n🚀 Production Readiness Test\n');
    console.log('='.repeat(50));

    const results = {
        envVars: false,
        mongodb: false,
        redis: false,
        email: false,
        sms: false
    };

    // Test environment variables
    console.log('\n1️⃣  Environment Variables');
    console.log('-'.repeat(50));
    results.envVars = testEnvironmentVariables();

    // Test MongoDB
    console.log('\n2️⃣  MongoDB Database');
    console.log('-'.repeat(50));
    results.mongodb = await testMongoDB();

    // Test Redis
    console.log('\n3️⃣  Redis Cache');
    console.log('-'.repeat(50));
    results.redis = await testRedis();

    // Test Email
    console.log('\n4️⃣  Email Service');
    console.log('-'.repeat(50));
    results.email = await testEmail();

    // Test SMS
    console.log('\n5️⃣  SMS Service');
    console.log('-'.repeat(50));
    results.sms = await testSMS();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary\n');

    const critical = results.envVars && results.mongodb;
    const recommended = results.redis && results.email;
    const optional = results.sms;

    console.log('Critical Services:');
    log[results.envVars ? 'success' : 'error'](`Environment Variables: ${results.envVars ? 'PASS' : 'FAIL'}`);
    log[results.mongodb ? 'success' : 'error'](`MongoDB: ${results.mongodb ? 'PASS' : 'FAIL'}`);

    console.log('\nRecommended Services:');
    log[results.redis ? 'success' : 'warn'](`Redis: ${results.redis ? 'PASS' : 'NOT CONFIGURED'}`);
    log[results.email ? 'success' : 'warn'](`Email: ${results.email ? 'PASS' : 'NOT CONFIGURED'}`);

    console.log('\nOptional Services:');
    log[results.sms ? 'success' : 'warn'](`SMS: ${results.sms ? 'PASS' : 'NOT CONFIGURED'}`);

    console.log('\n' + '='.repeat(50));

    if (critical) {
        log.success('✅ CRITICAL SERVICES: READY');
    } else {
        log.error('❌ CRITICAL SERVICES: NOT READY');
    }

    if (recommended) {
        log.success('✅ RECOMMENDED SERVICES: READY');
    } else {
        log.warn('⚠️  RECOMMENDED SERVICES: INCOMPLETE');
    }

    console.log('\n' + '='.repeat(50));

    if (critical && recommended) {
        console.log(`\n${colors.green}🎉 PRODUCTION READY!${colors.reset}`);
        console.log('All critical and recommended services are configured.\n');
        process.exit(0);
    } else if (critical) {
        console.log(`\n${colors.yellow}⚠️  PARTIALLY READY${colors.reset}`);
        console.log('Critical services ready, but recommended services need configuration.\n');
        console.log('Configure Email and Redis for full functionality.\n');
        process.exit(1);
    } else {
        console.log(`\n${colors.red}❌ NOT READY FOR PRODUCTION${colors.reset}`);
        console.log('Please fix critical service issues before deployment.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests().catch((error) => {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
});
