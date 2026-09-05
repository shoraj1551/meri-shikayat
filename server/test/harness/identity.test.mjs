import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdentity, assertTarget, claimDatabase, clearDatabase, dropDatabase, serviceAddress } from './identity.mjs';

const options = { mode: 'test', runId: 'a'.repeat(24), workerId: 1, suite: 'suite-A',
    mongoBase: 'mongodb://127.0.0.1:27017/', redisBase: 'redis://127.0.0.1:6379/0' };
process.env.MS_TEST_RUN_ID = options.runId;
function fake(identity, changes = {}) {
    let deletes = 0;
    let drops = 0;
    let marker = { runId: identity.runId, workerId: identity.workerId, suiteId: identity.suiteId, lease: identity.lease };
    const connection = { readyState: 1, name: identity.database, host: identity.host, port: identity.port,
        db: {
            collection: name => ({
                findOne: async () => marker, insertOne: async value => { marker = value; },
                deleteMany: async () => { deletes++; }
            }),
            listCollections: () => ({ hasNext: async () => false, toArray: async () => [{ name: '__test_owner' }, { name: 'users' }] })
        },
        dropDatabase: async () => { drops++; },
        ...changes
    };
    return { connection, setMarker: value => { marker = value; }, counts: () => ({ deletes, drops }) };
}
test('allocates distinct suite/worker/run databases and Redis namespaces', () => {
    const identities = [createIdentity(options), createIdentity({ ...options, workerId: 2 }),
        createIdentity({ ...options, suite: 'suite-B' }), createIdentity({ ...options, runId: 'b'.repeat(24) })];
    assert.equal(new Set(identities.map(i => i.database)).size, 4);
    assert.equal(new Set(identities.map(i => i.prefix)).size, 4);
    assert.ok(identities.every(i => i.database.length < 64));
});
test('rejects production-like, remote, credentialed, encoded and option-bearing Mongo URIs', () => {
    for (const mongoBase of ['mongodb://127.0.0.1:27017/production', 'mongodb+srv://cluster/production',
        'mongodb://db.example.com:27017/', 'mongodb://user:password@127.0.0.1:27017/',
        'mongodb://127.0.0.1:27017/?authSource=admin', 'mongodb://127.0.0.1:27017/%70roduction',
        'mongodb://127.0.0.1:99999/', 'mongodb://127.0.0.1:27017,prod:27017/']) {
        assert.throws(() => createIdentity({ ...options, mongoBase }));
    }
});
test('rejects missing run identity and invalid Redis targets', () => {
    assert.throws(() => createIdentity({ ...options, runId: undefined }));
    assert.throws(() => createIdentity({ ...options, mode: 'production' }));
    assert.throws(() => createIdentity({ ...options, workerId: '../production' }));
    assert.throws(() => createIdentity({ ...options, redisBase: 'redis://remote:6379/0' }));
    assert.deepEqual(serviceAddress('mongodb://[::1]:27017/', 'mongodb'), { host: '::1', port: 27017 });
});
test('cleanup is refused before any mutation for wrong target, host, worker or ownership', async () => {
    const identity = createIdentity(options);
    for (const changes of [{ name: 'production' }, { host: 'production.example.com' }, { port: 27018 }, { readyState: 0 }]) {
        const db = fake(identity, changes);
        await assert.rejects(clearDatabase(db.connection, identity));
        await assert.rejects(dropDatabase(db.connection, identity));
        assert.deepEqual(db.counts(), { deletes: 0, drops: 0 });
    }
    for (const marker of [null, { runId: identity.runId, lease: 'other' },
        { ...identity, workerId: '2' }]) {
        const db = fake(identity);
        db.setMarker(marker);
        await assert.rejects(clearDatabase(db.connection, identity), /ownership/);
        await assert.rejects(dropDatabase(db.connection, identity), /ownership/);
        assert.deepEqual(db.counts(), { deletes: 0, drops: 0 });
    }
});
test('owned cleanup preserves marker and only drops its exact database', async () => {
    const identity = createIdentity(options);
    const db = fake(identity);
    await clearDatabase(db.connection, identity);
    assert.deepEqual(db.counts(), { deletes: 1, drops: 0 });
    await dropDatabase(db.connection, identity);
    assert.deepEqual(db.counts(), { deletes: 1, drops: 1 });
});
test('claim refuses an existing nonempty database', async () => {
    const identity = createIdentity(options);
    const db = fake(identity);
    db.connection.db.listCollections = () => ({ hasNext: async () => true });
    await assert.rejects(claimDatabase(db.connection, identity), /nonempty/);
    assert.deepEqual(db.counts(), { deletes: 0, drops: 0 });
});
test('cleanup rejects a valid-looking identity from a different run before mutation', async () => {
    const identity = createIdentity({ ...options, runId: 'b'.repeat(24) });
    const db = fake(identity);
    await assert.rejects(dropDatabase(db.connection, identity), /current test-run/);
    assert.deepEqual(db.counts(), { deletes: 0, drops: 0 });
});
