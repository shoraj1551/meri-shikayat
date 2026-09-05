import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { auditSnapshot, createAuditReport, validateProvisioning, recordKey } from '../../src/operations/privilegedAccess.js';
import { runOperatorCommand } from '../../src/scripts/privilegedAccess.js';
import RoleSelector from '../../../client/src/js/components/role-selector.js';

const now = new Date('2026-09-05T12:00:00Z');
const snapshot = auditSnapshot('isolated', {
    users: [{ _id: 'u1', userType: 'super_admin', status: 'active', email: 'private@example.com', password: 'never-export', refreshTokens: ['private-token'] }],
    admins: [{ _id: 'a1', role: 'super_admin', status: 'active', email: 'admin@merishikayat.com' }],
    complaints: [{ _id: 'c1', isGuest: true, description: 'private complaint', guestContact: { phone: 'private-phone' } }]
});
function valid() {
    const audit = createAuditReport(snapshot, now);
    return { audit, approval: { operator: 'operator-one', ticket: 'BETA-123', auditSha256: audit.sha256,
        review: [...snapshot.identities, ...snapshot.legacyGuests].map(r => ({ key: recordKey(r), decision: 'verified', reason: 'Reviewed evidence in secure case record' })) },
        account: { store: 'User', firstName: 'Beta', lastName: 'Operator', email: 'operator@example.com', phone: '9876543210',
            password: randomBytes(24).toString('hex') + 'Aa1!' } };
}
test('audit inventory is deterministic and exports no credentials, contacts or complaint text', () => {
    const text = JSON.stringify(snapshot);
    assert.doesNotMatch(text, /never-export|private-token|private-phone|private@example|private complaint/);
    assert.equal(snapshot.identities.find(r => r.store === 'Admin').knownSeedIdentity, true);
    assert.equal(snapshot.legacyGuests[0].requiresOwnershipReview, true);
    assert.deepEqual(createAuditReport(snapshot, now), createAuditReport(snapshot, now));
});
test('valid reviewed provisioning input explicitly selects an identity store', () => {
    assert.equal(validateProvisioning(valid(), snapshot, now).store, 'User');
    const input = valid();
    input.account.store = 'Admin';
    assert.equal(validateProvisioning(input, snapshot, now).store, 'Admin');
});
test('provisioning fails for stale, tampered, unapproved or changed inventory', () => {
    const stale = valid();
    assert.throws(() => validateProvisioning(stale, snapshot, new Date(now.getTime() + 25 * 60 * 60 * 1000)), /stale/);
    const changed = valid();
    changed.audit.snapshot = { ...snapshot, database: 'other' };
    assert.throws(() => validateProvisioning(changed, snapshot, now), /stale/);
    const unapproved = valid();
    unapproved.approval.auditSha256 = 'wrong';
    assert.throws(() => validateProvisioning(unapproved, snapshot, now), /approved/);
    assert.throws(() => validateProvisioning(valid(), { ...snapshot, legacyGuests: [] }, now), /changed/);
});
test('every privileged/guest record requires a decision and held records block provisioning', () => {
    const missing = valid();
    missing.approval.review.pop();
    assert.throws(() => validateProvisioning(missing, snapshot, now), /Every/);
    const held = valid();
    held.approval.review[0].decision = 'hold';
    assert.throws(() => validateProvisioning(held, snapshot, now), /Held/);
    const duplicate = valid();
    duplicate.approval.review[1] = duplicate.approval.review[0];
    assert.throws(() => validateProvisioning(duplicate, snapshot, now), /Missing/);
});
test('provisioning rejects implicit identity store, weak/default password and extra privilege fields', () => {
    for (const change of [{ store: undefined }, { password: 'adminpassword123' }, { role: 'super_admin' }, { status: 'active' }]) {
        const input = valid();
        Object.assign(input.account, change);
        assert.throws(() => validateProvisioning(input, snapshot, now));
    }
});
test('operator command rejects unknown modes without touching the database', async () => {
    await assert.rejects(runOperatorCommand('reset-password', {}, { connect() { assert.fail('Must not connect'); } }), /Use audit/);
});
test('public role selector no longer offers super-admin signup', () => {
    assert.doesNotMatch(new RoleSelector().render(), /data-role="super_admin"/);
});

test('operator connection failure still disconnects without logging credentials', async () => {
    let disconnected = false;
    await assert.rejects(runOperatorCommand('audit', undefined, {
        set() {},
        async connect() { throw new Error('connection unavailable'); },
        async disconnect() { disconnected = true; }
    }), /connection unavailable/);
    assert.equal(disconnected, true);
});
