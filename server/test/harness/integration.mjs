import { before, beforeEach, after } from 'node:test';
import mongoose from 'mongoose';
import { createIdentity, claimDatabase, clearDatabase, dropDatabase } from './identity.mjs';
import { createScopedRedis } from './scoped-redis.mjs';

// No application .env files are loaded. Each Node test file is a separate process.
mongoose.set('autoCreate', false);
mongoose.set('autoIndex', false);
mongoose.set('bufferCommands', false);
export function integrationHarness(suite) {
    if (process.env.MS_TEST_MODE !== 'integration' || process.env.MONGODB_URI) {
        throw new Error('Use the integration launcher; inherited application database URIs are forbidden');
    }
    const identity = createIdentity({
        runId: process.env.MS_TEST_RUN_ID, workerId: process.pid, suite,
        mongoBase: process.env.TEST_MONGODB_BASE_URI, redisBase: process.env.TEST_REDIS_BASE_URI
    });
    process.env.MONGODB_URI = identity.mongoUri;
    // Application Redis remains disconnected: no test may accidentally initialize
    // an unscoped Redis client. The scoped fixture below uses the explicit test service.
    process.env.REDIS_HOST = '127.0.0.1';
    process.env.REDIS_PORT = '1';
    const context = { identity, app: undefined, redis: undefined };
    let testNumber = 0;
    let claimed = false;
    before(async () => {
        await mongoose.connect(identity.mongoUri, { serverSelectionTimeoutMS: 3000 });
        await claimDatabase(mongoose.connection, identity);
        claimed = true;
        context.redis = await createScopedRedis(identity);
        const { createApp } = await import('../../src/app.js');
        context.app = await createApp();
        // Simulate a trusted local proxy with a distinct client IP per test.
        // Real rate-limit middleware stays enabled; counters cannot bleed across tests.
        context.app.set('trust proxy', 1);
        // Explicit collections prevent background initialization racing cleanup.
        // Index migration/conflicts are B10; this harness does not certify indexes.
        for (const model of Object.values(mongoose.models)) await model.createCollection();
    });
    beforeEach(async () => {
        context.ip = '198.18.0.' + (++testNumber);
        await clearDatabase(mongoose.connection, identity);
        await context.redis.clear();
    });
    after(async () => {
        const errors = [];
        try { if (claimed) await dropDatabase(mongoose.connection, identity); } catch (error) { errors.push(error); }
        try { await context.redis?.close(); } catch (error) { errors.push(error); }
        try { await mongoose.disconnect(); } catch (error) { errors.push(error); }
        if (errors.length) throw new AggregateError(errors, 'Isolated integration cleanup failed');
    });
    return context;
}
