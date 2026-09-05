import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import express from 'express';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { adapters, listenerCounts } from './helpers.mjs';

// Disable a legacy SMS package's update notifier in isolated tests.
process.env.NO_UPDATE_NOTIFIER = '1';

test('entrypoint/factory/serverless/dependency imports neither connect nor install process handlers', () => {
    const child = spawnSync(process.execPath, [fileURLToPath(new URL('./import.fixture.mjs', import.meta.url))], { encoding: 'utf8', timeout: 10000 });
    assert.equal(child.status, 0, child.stderr + child.stdout);
    assert.match(child.stdout, /IMPORT_SAFE/);
});

test('factory health is non-sensitive, uncached, and does not initialize dependencies', async () => {
    const deps = adapters({ databaseReady: false });
    const before = listenerCounts();
    const app = await createApp({ ...deps, routes: [] });
    assert.deepEqual(listenerCounts(), before);
    for (const path of ['/api/v1/health', '/api/v1/health/live', '/api/health']) {
        const response = await request(app).get(path).expect(200);
        assert.equal(response.headers['cache-control'], 'no-store');
        assert.deepEqual(response.body, { status: 'OK', service: 'meri-shikayat-api' });
    }
    const response = await request(app).get('/api/v1/health/ready').expect(503);
    assert.equal(response.body.dependencies.database, 'unavailable');
    assert.equal(deps.database.connects, 0);
    assert.equal(deps.redis.connects, 0);
    await request(app).get('/api/v1/example').expect(503);
});

test('readiness changes on dependency loss, required Redis loss, and drain', async () => {
    const deps = adapters();
    let draining = false;
    const app = await createApp({ ...deps, routes: [], isDraining: () => draining });
    await request(app).get('/api/v1/health/ready').expect(200);
    deps.database.ready = false;
    await request(app).get('/api/v1/health/ready').expect(503);
    deps.database.ready = true;
    draining = true;
    await request(app).get('/api/v1/health/ready').expect(503);
    await request(app).get('/api/v1/anything').expect(503).expect('Connection', 'close');
    await request(app).get('/api/v1/health/live').expect(200);
    const required = await createApp({ ...deps, routes: [], redisRequired: true });
    await request(required).get('/api/v1/health/ready').expect(503);
    deps.redis.ready = true;
    await request(required).get('/api/v1/health/ready').expect(200);
    deps.redis.isReady = () => { throw new Error('private infrastructure address'); };
    const response = await request(required).get('/api/v1/health/ready').expect(503);
    assert.doesNotMatch(response.text, /private infrastructure/);
});

test('factory preserves parsing, sanitization, security headers, CORS and route mounting', async () => {
    const router = express.Router();
    router.post('/echo', (req, res) => res.json(req.body));
    const app = await createApp({ ...adapters(), routes: [['/sample', router]] });
    const response = await request(app).post('/api/v1/sample/echo')
        .set('Origin', 'http://localhost:5173').send({ normal: 1, '$where': 'unsafe', nested: { 'x.y': 2 } }).expect(200);
    assert.deepEqual(response.body, { normal: 1, _where: 'unsafe', nested: { x_y: 2 } });
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(response.headers['x-powered-by'], undefined);
    await request(app).get('/unknown').expect(404);
    await request(app).post('/api/v1/sample/echo').set('Content-Type', 'application/json').send('{').expect(400);
});

test('rate limit state belongs to each app and cannot suppress health probes', async () => {
    const router = express.Router();
    router.get('/', (req, res) => res.sendStatus(204));
    const first = await createApp({ ...adapters(), routes: [['/sample', router]] });
    for (let i = 0; i < 100; i++) await request(first).get('/api/v1/sample').expect(204);
    await request(first).get('/api/v1/sample').expect(429);
    await request(first).get('/api/v1/health/ready').expect(200);
    const second = await createApp({ ...adapters(), routes: [] });
    await request(second).get('/api/v1/unknown').expect(404);
});

test('real routes mount without connection side effects and reject unauthenticated/invalid input', async () => {
    process.env.JWT_SECRET = randomBytes(64).toString('hex');
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    const deps = adapters();
    const before = listenerCounts();
    const originalListen = http.Server.prototype.listen;
    const originalConnect = net.Socket.prototype.connect;
    const forbidden = () => { throw new Error('App creation attempted network I/O'); };
    http.Server.prototype.listen = forbidden;
    net.Socket.prototype.connect = forbidden;
    let app;
    try { app = await createApp(deps); } finally {
        http.Server.prototype.listen = originalListen;
        net.Socket.prototype.connect = originalConnect;
    }
    assert.deepEqual(listenerCounts(), before);
    await request(app).get('/api/v1/auth/me').expect(401);
    await request(app).post('/api/v1/auth/login').send({}).expect(400);
    assert.equal(deps.database.connects, 0);
    assert.equal(deps.redis.connects, 0);
});
