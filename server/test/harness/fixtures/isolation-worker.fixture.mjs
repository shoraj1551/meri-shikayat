import mongoose from 'mongoose';
import { createIdentity, claimDatabase, clearDatabase, dropDatabase } from '../identity.mjs';
import { createScopedRedis } from '../scoped-redis.mjs';
const identity = createIdentity({
    runId: process.env.MS_TEST_RUN_ID, workerId: process.argv[2], suite: import.meta.url,
    mongoBase: process.env.TEST_MONGODB_BASE_URI, redisBase: process.env.TEST_REDIS_BASE_URI
});
const connection = await mongoose.createConnection(identity.mongoUri, {
    autoCreate: false, autoIndex: false, serverSelectionTimeoutMS: 3000
}).asPromise();
let redis;
let claimed = false;
let closed = false;
async function close() {
    if (closed) return;
    closed = true;
    try {
        if (claimed) await dropDatabase(connection, identity);
    } finally {
        try { await redis?.close(); } finally { await connection.close(); }
    }
}
try {
    await claimDatabase(connection, identity);
    claimed = true;
    redis = await createScopedRedis(identity);
    await connection.db.collection('witness').insertOne({ _id: 'same-key', value: process.argv[2] });
    await redis.set('same-key', process.argv[2]);
    let queue = Promise.resolve();
    process.on('message', ({ command, id }) => {
        queue = queue.then(async () => {
            if (command === 'clear') { await clearDatabase(connection, identity); await redis.clear(); }
            if (command === 'close') {
                await close();
                process.send({ id, closed: true }, () => process.disconnect());
                return;
            }
            const row = await connection.db.collection('witness').findOne({ _id: 'same-key' });
            process.send({ id, mongo: row?.value ?? null, redis: await redis.get('same-key') });
        }).catch(async error => {
            process.send({ id, error: error.message });
            await close();
            process.exitCode = 1;
            process.disconnect();
        });
    });
    process.send({ ready: true, database: identity.database, prefix: identity.prefix });
} catch (error) {
    await close();
    throw error;
}
