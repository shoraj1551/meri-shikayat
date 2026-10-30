import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../../src/utils/validateEnv.js';

const required = {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
    JWT_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
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
