import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createServerlessHandler } from '../../src/serverless.js';
import { adapters, emptyApp, listenerCounts } from './helpers.mjs';

test('serverless coalesces initialization and liveness does not connect to dependencies', async () => {
    const deps = adapters({ databaseReady: false });
    let calls = 0;
    const before = listenerCounts();
    const handler = createServerlessHandler({ initialize: async () => {
        calls++;
        return { ...deps, app: await emptyApp(deps) };
    } });
    await Promise.all(Array.from({ length: 5 }, () => request(handler).get('/api/v1/health/live').expect(200)));
    assert.equal(calls, 1);
    assert.equal(deps.database.connects, 0);
    assert.deepEqual(listenerCounts(), before);
    await request(handler).get('/api/v1/health/ready').expect(200);
    assert.equal(deps.database.connects, 1);
});

test('serverless retries failed initialization and suppresses sensitive errors', async () => {
    const deps = adapters();
    let calls = 0;
    const handler = createServerlessHandler({ initialize: async () => {
        if (++calls === 1) throw new Error('mongodb://private:password@internal');
        return { ...deps, app: await emptyApp(deps) };
    } });
    const response = await request(handler).get('/api/v1/health/live').expect(503);
    assert.doesNotMatch(response.text, /password|mongodb|internal/);
    await request(handler).get('/api/v1/health/live').expect(200);
    assert.equal(calls, 2);
});

test('serverless refuses API traffic on database/required Redis connection failure', async () => {
    const deps = adapters({ databaseReady: false });
    deps.database.connect = async () => { throw new Error('sensitive connection string'); };
    const handler = createServerlessHandler({ initialize: async () => ({ ...deps, app: await emptyApp(deps), redisRequired: true }) });
    const response = await request(handler).get('/api/v1/auth/me').expect(503);
    assert.doesNotMatch(response.text, /sensitive/);
    deps.database.ready = true;
    await request(handler).get('/api/v1/auth/me').expect(503);
    deps.redis.ready = true;
    await request(handler).get('/api/v1/health/ready').expect(200);
});
