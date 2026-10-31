import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import Redis from 'ioredis';
import { io as connectSocket } from 'socket.io-client';
import { startServer } from '../../runtime/server.js';
import { createRedisSocketAdapter } from '../../runtime/socket.js';
import { adapters, emptyApp } from '../../../test/bootstrap/helpers.mjs';

test('two API instances deliver protected-room events through Redis', { timeout: 15000 }, async t => {
    const redisBase = process.env.TEST_REDIS_BASE_URI;
    assert.match(redisBase || '', /^redis:\/\/127\.0\.0\.1:\d+\/0$/);
    const baseClient = new Redis(redisBase, { lazyConnect: false, maxRetriesPerRequest: 1 });
    const key = `ms-test-socket:${process.env.MS_TEST_RUN_ID}:${process.pid}`;
    const runtimes = [];
    t.after(async () => {
        await Promise.allSettled(runtimes.map(runtime => runtime.stop()));
        if (baseClient.status === 'ready') await baseClient.quit();
        else baseClient.disconnect();
    });

    const start = async () => {
        const runtime = await startServer({
            ...adapters({ redisReady: true }),
            createApplication: emptyApp,
            authorizeSocketAdmin: async () => ({ _id: 'scale-admin', role: 'manager', status: 'active' }),
            socketHorizontalScaling: true,
            createSocketAdapter: () => createRedisSocketAdapter({ redisClient: baseClient, key }),
            port: 0,
            host: '127.0.0.1'
        });
        runtimes.push(runtime);
        return runtime;
    };

    const [first, second] = await Promise.all([start(), start()]);
    const socket = connectSocket(`http://127.0.0.1:${second.server.address().port}`, {
        transports: ['websocket'], reconnection: false
    });
    t.after(() => socket.close());
    await once(socket, 'connect');

    // Redis subscriptions are asynchronous, so allow both adapter subscriptions
    // to settle before sending the cross-instance room event.
    await new Promise(resolve => setTimeout(resolve, 100));
    const received = once(socket, 'scaled_event');
    first.io.to('admin_notifications').emit('scaled_event', { complaintId: 'CMP-SCALE-1' });
    const [payload] = await received;
    assert.equal(payload.complaintId, 'CMP-SCALE-1');
});
