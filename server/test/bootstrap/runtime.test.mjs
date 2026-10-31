import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once, EventEmitter } from 'node:events';
import express from 'express';
import request from 'supertest';
import { io as connectSocket } from 'socket.io-client';
import { Adapter } from 'socket.io-adapter';
import WebSocket from 'ws';
import { startServer, installProcessHandlers } from '../../src/runtime/server.js';
import { createAdminSocketAuthorizer, extractSocketToken } from '../../src/runtime/socket.js';
import { emitNewComplaint, emitComplaintStatusUpdate } from '../../src/services/complaint-events.service.js';
import jwt from 'jsonwebtoken';
import { adapters, emptyApp, listenerCounts } from './helpers.mjs';

const testAdmin = { _id: 'admin-test-id', role: 'viewer', status: 'active' };
const start = options => startServer({
    ...adapters(),
    createApplication: emptyApp,
    authorizeSocketAdmin: async () => testAdmin,
    port: 0,
    host: '127.0.0.1',
    shutdownTimeoutMs: 1000,
    ...options
});

test('admin socket authorization accepts only valid tokens for active admin roles', async () => {
    const secret = 'socket-test-secret';
    const activeAdmin = { _id: '507f1f77bcf86cd799439011', role: 'manager', status: 'active' };
    const authorize = createAdminSocketAuthorizer({
        secret,
        findAdminById: async id => id === activeAdmin._id ? activeAdmin : null
    });
    const token = jwt.sign({ id: activeAdmin._id }, secret, { expiresIn: '5m' });
    const socket = { handshake: { auth: { token }, headers: {} } };

    assert.equal(extractSocketToken(socket), token);
    assert.equal((await authorize(socket)).admin, activeAdmin);
    await assert.rejects(authorize({ handshake: { auth: {}, headers: {} } }), /Unauthorized/);
    await assert.rejects(authorize({ handshake: { auth: { token: jwt.sign({ id: 'missing' }, secret) }, headers: {} } }), /Unauthorized/);

    const bearerSocket = { handshake: { auth: {}, headers: { authorization: `Bearer ${token}` } } };
    assert.equal(extractSocketToken(bearerSocket), token);
    assert.equal((await authorize(bearerSocket)).admin, activeAdmin);

    for (const rejectedToken of [
        'not-a-jwt',
        jwt.sign({ id: activeAdmin._id }, 'wrong-secret'),
        jwt.sign({ id: activeAdmin._id }, secret, { expiresIn: -1 }),
        jwt.sign({ role: 'manager' }, secret)
    ]) {
        await assert.rejects(
            authorize({ handshake: { auth: { token: rejectedToken }, headers: {} } })
        );
    }

    const suspended = createAdminSocketAuthorizer({ secret, findAdminById: async () => ({ ...activeAdmin, status: 'suspended' }) });
    await assert.rejects(suspended(socket), /Unauthorized/);
    const invalidRole = createAdminSocketAuthorizer({ secret, findAdminById: async () => ({ ...activeAdmin, role: 'citizen' }) });
    await assert.rejects(invalidRole(socket), /Unauthorized/);
});

test('Socket.IO rejects unauthenticated clients and automatically joins authorized admins', { timeout: 10000 }, async t => {
    const runtime = await start({
        authorizeSocketAdmin: async socket => {
            if (socket.handshake.auth?.token !== 'valid-admin-token') throw new Error('Unauthorized');
            return testAdmin;
        }
    });
    t.after(() => runtime.stop());
    const origin = 'http://127.0.0.1:' + runtime.server.address().port;

    const denied = connectSocket(origin, { transports: ['websocket'], reconnection: false });
    t.after(() => denied.close());
    const [deniedError] = await once(denied, 'connect_error');
    assert.equal(deniedError.message, 'Unauthorized');

    const allowed = connectSocket(origin, {
        transports: ['websocket'],
        reconnection: false,
        auth: { token: 'valid-admin-token' }
    });
    t.after(() => allowed.close());
    await once(allowed, 'connect');
    const serverSocket = [...runtime.io.sockets.sockets.values()][0];
    assert.equal(serverSocket.data.admin.id, testAdmin._id);
    assert.equal(serverSocket.rooms.has('admin_notifications'), true);
});

test('complaint lifecycle events reach authorized admin sockets through the protected room', { timeout: 10000 }, async t => {
    const runtime = await start();
    t.after(() => runtime.stop());
    const origin = 'http://127.0.0.1:' + runtime.server.address().port;
    const socket = connectSocket(origin, { transports: ['websocket'], reconnection: false });
    t.after(() => socket.close());
    await once(socket, 'connect');

    const newComplaint = once(socket, 'new_complaint');
    emitNewComplaint({ app: runtime.app }, {
        _id: 'complaint-id', complaintId: 'CMP-2026-0001', title: 'Road damage', status: 'submitted'
    });
    const [createdPayload] = await newComplaint;
    assert.equal(createdPayload.id, 'complaint-id');
    assert.equal(createdPayload.title, 'Road damage');

    const statusUpdate = once(socket, 'complaint_status_update');
    emitComplaintStatusUpdate({ app: runtime.app }, {
        _id: 'complaint-id', complaintId: 'CMP-2026-0001', status: 'resolved'
    });
    const [updatedPayload] = await statusUpdate;
    assert.equal(updatedPayload.id, 'complaint-id');
    assert.equal(updatedPayload.status, 'resolved');
});

test('Socket.IO evicts an admin when the handshake token authorization expires', { timeout: 10000 }, async t => {
    const runtime = await start({
        authorizeSocketAdmin: async () => ({ admin: testAdmin, expiresAt: Date.now() + 75 })
    });
    t.after(() => runtime.stop());
    const origin = 'http://127.0.0.1:' + runtime.server.address().port;
    const socket = connectSocket(origin, { transports: ['websocket'], reconnection: false });
    t.after(() => socket.close());
    await once(socket, 'connect');
    const [reason] = await once(socket, 'disconnect');
    assert.equal(reason, 'io server disconnect');
    assert.equal(runtime.io.sockets.sockets.size, 0);
});

test('Socket.IO evicts an admin whose database authorization is revoked after connection', { timeout: 10000 }, async t => {
    let authorized = true;
    const runtime = await start({
        socketAuthRevalidateMs: 20,
        authorizeSocketAdmin: async () => {
            if (!authorized) throw new Error('Unauthorized');
            return testAdmin;
        }
    });
    t.after(() => runtime.stop());
    const origin = 'http://127.0.0.1:' + runtime.server.address().port;
    const socket = connectSocket(origin, { transports: ['websocket'], reconnection: false });
    t.after(() => socket.close());
    await once(socket, 'connect');
    authorized = false;
    const [reason] = await once(socket, 'disconnect');
    assert.equal(reason, 'io server disconnect');
    assert.equal(runtime.io.sockets.sockets.size, 0);
});
test('production runtime listens and closes HTTP, Socket.IO and dependencies once', { timeout: 10000 }, async t => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    t.after(() => { if (oldEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldEnv; });
    const deps = adapters();
    const before = listenerCounts();
    const runtime = await start(deps);
    t.after(() => runtime.stop());
    const origin = 'http://127.0.0.1:' + runtime.server.address().port;
    await request(origin).get('/api/v1/health/ready').expect(200);
    const socket = connectSocket(origin, { transports: ['websocket'], reconnection: false });
    t.after(() => socket.close());
    await once(socket, 'connect');
    const disconnected = once(socket, 'disconnect');
    const first = runtime.stop();
    assert.equal(runtime.stop(), first);
    assert.equal((await first).timedOut, false);
    await disconnected;
    assert.equal(runtime.server.listening, false);
    assert.equal(deps.database.closes, 1);
    assert.equal(deps.redis.closes, 1);
    assert.deepEqual(listenerCounts(), before);
});

test('shutdown closes WebSocket clients that have not joined a Socket.IO namespace', { timeout: 10000 }, async t => {
    const runtime = await start();
    t.after(() => runtime.stop());
    const socket = new WebSocket('ws://127.0.0.1:' + runtime.server.address().port + '/socket.io/?EIO=4&transport=websocket');
    t.after(() => socket.close());
    await once(socket, 'open');
    const closed = once(socket, 'close');
    assert.equal((await runtime.stop()).timedOut, false);
    await closed;
});

test('shutdown drains an in-flight response before closing dependencies', { timeout: 10000 }, async t => {
    let finish;
    let entered;
    const started = new Promise(resolve => { entered = resolve; });
    const deps = adapters();
    const runtime = await start({ ...deps, createApplication: async options => {
        const app = await emptyApp(options);
        // Insert test request before the app's not-found middleware using a wrapper.
        const wrapper = express();
        wrapper.get('/slow', (req, res) => { finish = () => res.end('completed'); entered(); });
        wrapper.use(app);
        return wrapper;
    } });
    t.after(() => runtime.stop());
    const pending = request(runtime.server).get('/slow').then(r => r);
    await started;
    const stopping = runtime.stop();
    assert.equal(runtime.isDraining(), true);
    assert.equal(deps.database.closes, 0);
    await request(runtime.app).get('/api/v1/health/ready').expect(503);
    finish();
    assert.equal((await pending).text, 'completed');
    assert.equal((await stopping).timedOut, false);
    assert.equal(deps.database.closes, 1);
});

test('shutdown force-closes stalled HTTP requests within its deadline', { timeout: 10000 }, async t => {
    let entered;
    const started = new Promise(resolve => { entered = resolve; });
    const runtime = await start({ shutdownTimeoutMs: 75, createApplication: async () => {
        const app = express();
        app.use((req, res) => entered());
        return app;
    } });
    t.after(() => runtime.stop());
    const outgoing = http.get('http://127.0.0.1:' + runtime.server.address().port);
    const failed = once(outgoing, 'error');
    await started;
    const result = await runtime.stop();
    assert.equal(result.timedOut, true);
    await failed;
});

test('optional Redis outage starts; required Redis/database failure rolls back', async () => {
    const optional = adapters();
    optional.redis.connect = async () => { throw new Error('offline'); };
    const runtime = await start(optional);
    assert.equal(runtime.server.listening, true);
    await runtime.stop();
    const required = adapters();
    await assert.rejects(start({ ...required, redisRequired: true }), /Required Redis/);
    assert.equal(required.database.closes, 1);
    assert.equal(required.redis.closes, 1);
    const broken = adapters();
    broken.database.connect = async () => { throw new Error('database offline'); };
    await assert.rejects(start(broken), /database offline/);
    assert.equal(broken.database.closes, 1);
    assert.equal(broken.redis.closes, 1);
});

test('horizontal Socket.IO mode fails closed without Redis or an adapter', async () => {
    const offline = adapters();
    await assert.rejects(start({ ...offline, socketHorizontalScaling: true }), /requires an available Redis/);

    const online = adapters({ redisReady: true });
    await assert.rejects(start({
        ...online,
        socketHorizontalScaling: true,
        createSocketAdapter: async () => ({})
    }), /requires a Redis adapter/);
});

test('horizontal Socket.IO mode installs its adapter, enforces WebSocket transport and closes it', async t => {
    let adapterClosed = 0;
    class TestAdapter extends Adapter {}
    const runtime = await start({
        ...adapters({ redisReady: true }),
        socketHorizontalScaling: true,
        createSocketAdapter: async () => ({
            adapter: TestAdapter,
            transports: ['websocket'],
            close: async () => { adapterClosed++; }
        })
    });
    t.after(() => runtime.stop());
    assert.equal(runtime.io.of('/').adapter.constructor, TestAdapter);
    assert.deepEqual(runtime.io.engine.opts.transports.map(value => value.name || value), ['websocket']);
    await runtime.stop();
    assert.equal(adapterClosed, 1);
});

test('bind failure releases connected dependencies', async t => {
    const first = await start();
    t.after(() => first.stop());
    const deps = adapters();
    await assert.rejects(start({ ...deps, port: first.server.address().port }), { code: 'EADDRINUSE' });
    assert.equal(deps.database.closes, 1);
    assert.equal(deps.redis.closes, 1);
});

test('dependency close errors still close the other dependency; hung close is bounded', async () => {
    const deps = adapters();
    deps.database.close = () => { throw new Error('close failed'); };
    const runtime = await start(deps);
    const result = await runtime.stop();
    assert.equal(result.errors.length, 1);
    assert.equal(deps.redis.closes, 1);
    const hung = adapters();
    hung.database.close = () => new Promise(() => {});
    const second = await start({ ...hung, shutdownTimeoutMs: 25 });
    assert.equal((await second.stop()).timedOut, true);
    assert.equal(hung.redis.closes, 1);
});

test('signal/fatal handlers drain, choose exit status, and can be removed', async () => {
    for (const [event, result, exitCode] of [
        ['SIGTERM', { timedOut: false, errors: [] }, 0],
        ['SIGINT', { timedOut: true, errors: [] }, 1],
        ['unhandledRejection', { timedOut: false, errors: [] }, 1],
        ['uncaughtException', { timedOut: false, errors: [] }, 1]
    ]) {
        const target = new EventEmitter();
        let stopped = 0;
        let exited;
        const remove = installProcessHandlers({ stop: async () => { stopped++; return result; } },
            { target, exit: code => { exited = code; }, report: () => {} });
        target.emit(event, new Error('fixture'));
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(stopped, 1);
        assert.equal(exited, exitCode);
        remove();
        assert.equal(target.eventNames().length, 0);
    }
});
