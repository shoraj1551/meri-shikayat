import { createHash } from 'node:crypto';

export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const recordKey = record => record.store + ':' + record.id;

// The report intentionally omits passwords, tokens, contact details and complaint content.
export function auditSnapshot(database, { users, admins, complaints }) {
    const identities = [
        ...users.map(u => ({ store: 'User', id: String(u._id), type: u.userType,
            role: u.adminProfile?.role || null, status: u.status, updatedAt: u.updatedAt || null,
            knownSeedIdentity: u.email === 'admin@merishikayat.com' })),
        ...admins.map(a => ({ store: 'Admin', id: String(a._id), type: 'legacy_admin',
            role: a.role, status: a.status, updatedAt: a.updatedAt || null,
            knownSeedIdentity: a.email === 'admin@merishikayat.com' }))
    ];
    const legacyGuests = complaints.map(c => ({ store: 'Complaint', id: String(c._id),
        isGuest: c.isGuest === true, owner: c.user ? String(c.user) : null, updatedAt: c.updatedAt || null,
        requiresOwnershipReview: true }));
    return { database, identities: identities.sort((a, b) => recordKey(a).localeCompare(recordKey(b))),
        legacyGuests: legacyGuests.sort((a, b) => a.id.localeCompare(b.id)) };
}
export function createAuditReport(snapshot, now = new Date()) {
    const report = { schemaVersion: 1, generatedAt: now.toISOString(), snapshot };
    return { ...report, sha256: digest(report) };
}
export function validateProvisioning(input, snapshot, now = new Date()) {
    const { audit, approval, account } = input || {};
    if (!audit || !approval || !account) throw new Error('Audit, operator approval and account are required');
    const payload = { schemaVersion: audit.schemaVersion, generatedAt: audit.generatedAt, snapshot: audit.snapshot };
    const age = now - new Date(audit.generatedAt);
    if (audit.schemaVersion !== 1 || !Number.isFinite(age) || age < 0 || age > 24 * 60 * 60 * 1000 ||
        digest(payload) !== audit.sha256 || approval.auditSha256 !== audit.sha256 ||
        digest(audit.snapshot) !== digest(snapshot)) throw new Error('Audit is stale, changed or not approved');
    if (![approval.operator, approval.ticket].every(v => typeof v === 'string' && v.trim().length >= 3 && v.length <= 200)) {
        throw new Error('Operator identity and approval ticket are required');
    }
    // Every privileged identity and legacy guest record needs a recorded disposition.
    const records = [...snapshot.identities, ...snapshot.legacyGuests];
    if (!Array.isArray(approval.review) || approval.review.length !== records.length) throw new Error('Every audit record requires an operator review');
    const decisions = new Map(approval.review.map(r => [r.key, r]));
    for (const record of records) {
        const decision = decisions.get(recordKey(record));
        if (!decision || !['verified', 'hold'].includes(decision.decision) ||
            typeof decision.reason !== 'string' || decision.reason.trim().length < 5) throw new Error('Missing record decision or reason');
        if (decision.decision === 'hold') throw new Error('Held/suspicious records require resolution and a fresh audit before provisioning');
    }
    if (!['User', 'Admin'].includes(account.store)) throw new Error('Choose User or legacy Admin explicitly; identities are not migrated here');
    if (![account.firstName, account.lastName].every(v => typeof v === 'string' && /^[A-Za-z ]{2,50}$/.test(v)) ||
        typeof account.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email) ||
        typeof account.phone !== 'string' || !/^[6-9][0-9]{9}$/.test(account.phone)) throw new Error('Invalid account fields');
    if (typeof account.password !== 'string' || account.password.length < 20 || account.password.length > 72 ||
        !/[a-z]/.test(account.password) || !/[A-Z]/.test(account.password) || !/[0-9]/.test(account.password) ||
        !/[@$!%*?&]/.test(account.password) || !/^[\x21-\x7e]+$/.test(account.password)) throw new Error('Use a unique random 20–72 character ASCII password with upper/lowercase, digits and a supported symbol');
    if (Object.keys(account).some(k => !['store', 'firstName', 'lastName', 'email', 'phone', 'password'].includes(k))) throw new Error('Unexpected account fields');
    return { store: account.store, firstName: account.firstName.trim(), lastName: account.lastName.trim(),
        email: account.email.toLowerCase().trim(), phone: account.phone, password: account.password };
}

export async function readInventory(db, session) {
    const options = { session };
    const users = await db.collection('users').find({ $or: [{ userType: { $in: ['admin', 'super_admin'] } }, { 'adminProfile.role': 'super_admin' }] },
        { ...options, projection: { _id: 1, userType: 1, adminProfile: 1, status: 1, updatedAt: 1, email: 1 } }).limit(10001).toArray();
    const admins = await db.collection('admins').find({}, { ...options, projection: { _id: 1, role: 1, status: 1, updatedAt: 1, email: 1 } }).limit(10001).toArray();
    const complaints = await db.collection('complaints').find({ $or: [{ isGuest: true }, { user: null },
        { 'guestContact.name': { $exists: true, $ne: '' } }, { 'guestContact.email': { $exists: true, $ne: '' } },
        { 'guestContact.phone': { $exists: true, $ne: '' } }] },
        { ...options, projection: { _id: 1, isGuest: 1, user: 1, updatedAt: 1 } }).limit(10001).toArray();
    if ([users, admins, complaints].some(rows => rows.length > 10000)) throw new Error('Audit exceeds 10,000 records per category; operator must arrange a complete export');
    return auditSnapshot(db.databaseName, { users, admins, complaints });
}
