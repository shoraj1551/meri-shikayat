import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentity } from './identity.mjs';
import { createScopedRedis } from './scoped-redis.mjs';
const base = { mode: 'test', runId: 'c'.repeat(24), workerId: 1, suite: 'redis-fixture',
    mongoBase: 'mongodb://127.0.0.1:27017/', redisBase: 'redis://127.0.0.1:6379/0' };
process.env.MS_TEST_RUN_ID = base.runId;
function fakeClient(values) {
    return {
        on() {}, async connect() {}, disconnect() { this.disconnected = true; },
        async set(key, value, ...options) {
            if (options.includes('NX') && values.has(key)) return null;
            values.set(key, value); return 'OK';
        },
        async get(key) { return values.get(key) ?? null; },
        async del(key) { values.delete(key); },
        async scan(cursor, match, pattern) { return ['0', [...values.keys()].filter(key => key.startsWith(pattern.slice(0, -1)))]; }
    };
}
test('Redis namespaces cannot read or clear another worker keys', async () => {
    const values = new Map([['production:key', 'untouched']]);
    const first = await createScopedRedis(createIdentity(base), { client: fakeClient(values) });
    const second = await createScopedRedis(createIdentity({ ...base, workerId: 2 }), { client: fakeClient(values) });
    await first.set('same-key', 'first');
    await second.set('same-key', 'second');
    assert.equal(await first.get('same-key'), 'first');
    assert.equal(await second.get('same-key'), 'second');
    assert.throws(() => first.set('../escape', 'bad'));
    await first.clear();
    assert.equal(await first.get('same-key'), null);
    assert.equal(await second.get('same-key'), 'second');
    await first.close();
    await second.close();
    assert.deepEqual([...values], [['production:key', 'untouched']]);
});
test('Redis cleanup refuses a changed owner, preserving all keys and disconnecting', async () => {
    const identity = createIdentity(base);
    const values = new Map();
    const client = fakeClient(values);
    const fixture = await createScopedRedis(identity, { client });
    await fixture.set('data', 'preserve');
    values.set(identity.prefix + '__owner', 'another-owner');
    await assert.rejects(fixture.close(), /ownership/);
    assert.equal(client.disconnected, true);
    assert.equal(values.get(identity.prefix + 'data'), 'preserve');
});
test('Redis claim cannot overwrite an existing ownership lease', async () => {
    const identity = createIdentity(base);
    const values = new Map([[identity.prefix + '__owner', 'existing']]);
    const client = fakeClient(values);
    await assert.rejects(createScopedRedis(identity, { client }), /existing Redis namespace/);
    assert.equal(values.get(identity.prefix + '__owner'), 'existing');
    assert.equal(client.disconnected, true);
});
