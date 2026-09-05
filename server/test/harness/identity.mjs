import { createHash, randomBytes } from 'node:crypto';
const loopback = '(127\\.0\\.0\\.1|\\[::1\\])';
export function serviceAddress(uri, scheme) {
    const match = new RegExp('^' + scheme + '://' + loopback + ':([1-9][0-9]{0,4})/' + (scheme === 'redis' ? '0' : '') + '$').exec(uri || '');
    if (!match || Number(match[2]) > 65535) throw new Error('Test services must use an explicit loopback port, no credentials/options, and no Mongo database name');
    return { host: match[1].replace(/[\[\]]/g, ''), port: Number(match[2]) };
}
export function createIdentity({ runId, workerId, suite, mongoBase, redisBase, mode = process.env.NODE_ENV }) {
    if (mode !== 'test' || !/^[a-f0-9]{24}$/.test(runId || '') || !/^[1-9][0-9]{0,9}$/.test(String(workerId)) || !suite) {
        throw new Error('Missing or invalid test-run identity');
    }
    const mongo = serviceAddress(mongoBase, 'mongodb');
    serviceAddress(redisBase, 'redis');
    const suiteId = createHash('sha256').update(suite).digest('hex').slice(0, 12);
    const database = 'ms_test_' + runId + '_w' + workerId + '_s' + suiteId;
    const prefix = 'ms_test:' + runId + ':w' + workerId + ':s' + suiteId + ':';
    return Object.freeze({ runId, workerId: String(workerId), suiteId, database, prefix,
        mongoUri: mongoBase + database, redisBase, host: mongo.host, port: mongo.port,
        lease: randomBytes(16).toString('hex') });
}
export function assertTarget(connection, identity) {
    assertIdentity(identity);
    if (connection.readyState !== 1 || connection.name !== identity.database ||
        connection.host !== identity.host || connection.port !== identity.port) {
        throw new Error('Refusing unsafe test database operation');
    }
}
export function assertIdentity(identity) {
    if (process.env.NODE_ENV !== 'test' || !identity || identity.runId !== process.env.MS_TEST_RUN_ID ||
        !/^[a-f0-9]{24}$/.test(identity.runId) || !/^[1-9][0-9]{0,9}$/.test(identity.workerId) ||
        !/^[a-f0-9]{12}$/.test(identity.suiteId) || !/^[a-f0-9]{32}$/.test(identity.lease) ||
        !['127.0.0.1', '::1'].includes(identity.host) || !Number.isInteger(identity.port) || identity.port < 1 || identity.port > 65535 ||
        identity.database !== 'ms_test_' + identity.runId + '_w' + identity.workerId + '_s' + identity.suiteId ||
        identity.prefix !== 'ms_test:' + identity.runId + ':w' + identity.workerId + ':s' + identity.suiteId + ':') {
        throw new Error('Refusing operation outside the current test-run identity');
    }
}
export async function assertOwner(connection, identity) {
    assertTarget(connection, identity);
    const marker = await connection.db.collection('__test_owner').findOne({ _id: 'owner' });
    if (!marker || marker.runId !== identity.runId || marker.lease !== identity.lease ||
        marker.workerId !== identity.workerId || marker.suiteId !== identity.suiteId) {
        throw new Error('Refusing cleanup: test ownership marker mismatch');
    }
}
export async function claimDatabase(connection, identity) {
    assertTarget(connection, identity);
    if (await connection.db.listCollections({}, { nameOnly: true }).hasNext()) throw new Error('Refusing to claim a nonempty database');
    await connection.db.collection('__test_owner').insertOne({ _id: 'owner',
        runId: identity.runId, workerId: identity.workerId, suiteId: identity.suiteId, lease: identity.lease });
}
export async function clearDatabase(connection, identity) {
    await assertOwner(connection, identity);
    const collections = await connection.db.listCollections({}, { nameOnly: true }).toArray();
    for (const { name } of collections) {
        if (name === '__test_owner' || name.startsWith('system.')) continue;
        await assertOwner(connection, identity);
        await connection.db.collection(name).deleteMany({});
    }
}
export async function dropDatabase(connection, identity) {
    await assertOwner(connection, identity);
    await connection.dropDatabase();
}
