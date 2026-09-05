import { it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { integrationHarness } from '../../../test/harness/integration.mjs';
import { api, registration, complaintData } from '../../../test/harness/fixtures.mjs';
import { readInventory, createAuditReport } from '../../operations/privilegedAccess.js';
const context = integrationHarness(import.meta.url);

it('denies anonymous and real citizen privilege/guest requests without changing legacy records', async () => {
    const citizen = await api(context, 'post', '/auth/register').send(registration()).expect(201);
    const db = mongoose.connection.db;
    // Raw legacy fixture deliberately bypasses current model requirements.
    await db.collection('complaints').insertOne({ ...complaintData(), complaintId: 'MSK-LEGACY-TEST',
        isGuest: true, user: null, guestContact: { name: 'Legacy Guest' } });
    const before = await db.collection('complaints').findOne({ complaintId: 'MSK-LEGACY-TEST' });
    const usersBefore = await db.collection('users').countDocuments();
    const adminsBefore = await db.collection('admins').countDocuments();
    for (const token of [null, citizen.body.token]) {
        for (const [path, body] of [
            ['/auth/register/super-admin', { ...registration(), invitationCode: 'SUPER_ADMIN_2024' }],
            ['/complaints/guest', complaintData()],
            ['/complaints/MSK-LEGACY-TEST/claim', {}],
            ['/auth/register', { ...registration(), role: 'super_admin' }]
        ]) {
            const request = api(context, 'post', path);
            if (token) request.set('Authorization', 'Bearer ' + token);
            await request.send(body).expect(403);
        }
    }
    assert.deepEqual(await db.collection('complaints').findOne({ _id: before._id }), before);
    assert.equal(await db.collection('users').countDocuments(), usersBefore);
    assert.equal(await db.collection('admins').countDocuments(), adminsBefore);
    const audit = createAuditReport(await readInventory(db));
    assert.ok(audit.snapshot.legacyGuests.some(record => record.id === String(before._id)));
    assert.deepEqual(await db.collection('complaints').findOne({ _id: before._id }), before);
});
