import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../../src/utils/validateEnv.js';

const required = {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
    JWT_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    EMAIL_USER: 'mailer@example.test',
    EMAIL_PASSWORD: 'test-app-password',
    VAPID_PUBLIC_KEY: 'B'.repeat(87),
    VAPID_PRIVATE_KEY: 'C'.repeat(43),
    VAPID_MAILTO: 'mailto:admin@example.test'
};

async function withEnvironment(values, callback) {
    const keys = [...new Set([...Object.keys(required), ...Object.keys(values)])];
    const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
    Object.assign(process.env, required, values);
    for (const [key, value] of Object.entries(values)) if (value === undefined) delete process.env[key];
    try { await callback(); } finally {
        for (const key of keys) {
            if (previous[key] === undefined) delete process.env[key];
            else process.env[key] = previous[key];
        }
    }
}

test('enabled ML requires an explicit valid service URL', async () => {
    await withEnvironment({ ML_SERVICE_ENABLED: 'true', ML_SERVICE_URL: undefined }, () => {
        assert.throws(validateEnvironment, /Invalid environment configuration/);
    });
    await withEnvironment({ ML_SERVICE_ENABLED: 'true', ML_SERVICE_URL: 'file:///tmp/ml' }, () => {
        assert.throws(validateEnvironment, /Invalid environment configuration/);
    });
    await withEnvironment({ ML_SERVICE_ENABLED: 'true', ML_SERVICE_URL: 'https://ml.example.test' }, () => {
        assert.doesNotThrow(validateEnvironment);
    });
});

test('production requires an email transport for administrator OTP delivery', async () => {
    await withEnvironment({ NODE_ENV: 'production', EMAIL_USER: undefined, EMAIL_PASSWORD: undefined }, () => {
        assert.throws(validateEnvironment, /Invalid environment configuration/);
    });
    await withEnvironment({ NODE_ENV: 'production' }, () => {
        assert.doesNotThrow(validateEnvironment);
    });
});

test('production requires valid Web Push VAPID configuration', async () => {
    await withEnvironment({ NODE_ENV: 'production', VAPID_PUBLIC_KEY: undefined, VAPID_PRIVATE_KEY: undefined }, () => {
        assert.throws(validateEnvironment, /Invalid environment configuration/);
    });
    await withEnvironment({ VAPID_PUBLIC_KEY: 'not-valid', VAPID_PRIVATE_KEY: 'also-invalid' }, () => {
        assert.throws(validateEnvironment, /Invalid environment configuration/);
    });
    await withEnvironment({ NODE_ENV: 'production' }, () => {
        assert.doesNotThrow(validateEnvironment);
    });
});
