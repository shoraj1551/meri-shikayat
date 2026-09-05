import { it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { integrationHarness } from '../../test/harness/integration.mjs';
import { api, registration, complaintData } from '../../test/harness/fixtures.mjs';
import Admin from '../models/Admin.js';
import Complaint from '../models/Complaint.js';
const context = integrationHarness(import.meta.url);
let userToken, adminToken, complaint;
beforeEach(async () => {
    const user = await api(context, 'post', '/auth/register').send(registration()).expect(201);
    userToken = user.body.token;
    const created = await api(context, 'post', '/complaints').set('Authorization', 'Bearer ' + userToken).send(complaintData()).expect(201);
    complaint = created.body.data;
    // Fixture setup uses the Admin model that protectAdmin actually queries; not an SMS/OTP bypass in application code.
    const admin = await Admin.create({ firstName: 'Test', lastName: 'Admin', email: 'admin@example.com',
        phone: '9876543211', password: 'Admin@1234', adminId: 'TEST-ADMIN', status: 'active', role: 'manager',
        permissions: { editComplaints: true } });
    adminToken = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '5m' });
});
it('allows an active Admin to update status through the actual PUT route', async () => {
    const response = await api(context, 'put', '/admin/complaints/' + complaint._id + '/status')
        .set('Authorization', 'Bearer ' + adminToken).send({ status: 'in_progress' }).expect(200);
    assert.equal(response.body.data.status, 'in_progress');
    assert.equal((await Complaint.findById(complaint._id)).status, 'in_progress');
});
it('rejects an ordinary User token at an Admin-only route without changing data', async () => {
    await api(context, 'put', '/admin/complaints/' + complaint._id + '/status')
        .set('Authorization', 'Bearer ' + userToken).send({ status: 'resolved' }).expect(401);
    assert.equal((await Complaint.findById(complaint._id)).status, 'pending');
});
