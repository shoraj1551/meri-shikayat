import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { initializeRedis } from '../../src/config/redis.js';

function client(status) {
    return Object.assign(new EventEmitter(), {
        status, disconnects: 0,
        disconnect() { this.disconnects++; this.status = 'end'; this.emit('end'); },
        async connect() { queueMicrotask(() => { this.status = 'ready'; this.emit('ready'); }); }
    });
}
test('Redis startup resolves immediately when ready', async () => {
    const redis = client('ready');
    assert.equal(await initializeRedis({ client: redis }), true);
    assert.equal(redis.disconnects, 0);
});
test('Redis startup waits for readiness and removes temporary listeners', async () => {
    const redis = client('connecting');
    const pending = initializeRedis({ client: redis });
    redis.emit('ready');
    assert.equal(await pending, true);
    assert.deepEqual(redis.eventNames(), []);
});
test('Redis startup timeout disconnects without recursive end callbacks', async () => {
    const redis = client('connecting');
    assert.equal(await initializeRedis({ client: redis, timeoutMs: 20 }), false);
    assert.equal(redis.disconnects, 1);
    assert.deepEqual(redis.eventNames(), []);
});
test('Redis can reconnect after a prior ended connection', async () => {
    const redis = client('end');
    assert.equal(await initializeRedis({ client: redis }), true);
    assert.deepEqual(redis.eventNames(), []);
});
