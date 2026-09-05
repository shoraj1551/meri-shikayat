import { serviceAddress, assertIdentity } from './identity.mjs';
export async function createScopedRedis(identity, { client } = {}) {
    assertIdentity(identity);
    serviceAddress(identity.redisBase, 'redis');
    if (!client) {
        const { default: Redis } = await import('ioredis');
        client = new Redis(identity.redisBase, { lazyConnect: true, retryStrategy: null, maxRetriesPerRequest: 1, connectTimeout: 3000 });
    }
    client.on('error', () => {});
    try {
        await client.connect();
        if (await client.set(identity.prefix + '__owner', identity.lease, 'EX', 3600, 'NX') !== 'OK') {
            throw new Error('Refusing to claim an existing Redis namespace');
        }
    } catch (error) { client.disconnect(); throw error; }
    const keyFor = key => {
        if (!/^[a-zA-Z0-9_-]+$/.test(key) || key === '__owner') throw new Error('Invalid test Redis key');
        return identity.prefix + key;
    };
    async function clear({ includeOwner = false } = {}) {
        assertIdentity(identity);
        if (process.env.NODE_ENV !== 'test' || !/^ms_test:[a-f0-9]{24}:w[1-9][0-9]{0,9}:s[a-f0-9]{12}:$/.test(identity.prefix) ||
            await client.get(identity.prefix + '__owner') !== identity.lease) {
            throw new Error('Refusing Redis cleanup: ownership mismatch');
        }
        let cursor = '0';
        do {
            const [next, keys] = await client.scan(cursor, 'MATCH', identity.prefix + '*', 'COUNT', 100);
            cursor = next;
            for (const key of keys) {
                if (!key.startsWith(identity.prefix)) throw new Error('Redis scan escaped test namespace');
                if (key !== identity.prefix + '__owner') await client.del(key);
            }
        } while (cursor !== '0');
        if (includeOwner) await client.del(identity.prefix + '__owner');
    }
    return {
        get: key => client.get(keyFor(key)),
        set: (key, value) => client.set(keyFor(key), value, 'EX', 3600),
        clear,
        async close() {
            try { await clear({ includeOwner: true }); } finally { client.disconnect(); }
        }
    };
}
