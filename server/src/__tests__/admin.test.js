import { it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { integrationHarness } from '../../test/harness/integration.mjs';
import { api, registration, complaintData } from '../../test/harness/fixtures.mjs';
import Admin from '../models/Admin.js';
import Complaint from '../models/Complaint.js';
import { hashOTP } from '../services/otp.service.js';
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
it('rejects an authenticated viewer without editComplaints on the mounted mutation route', async () => {
    const viewer = await Admin.create({ firstName: 'Read', lastName: 'Only', email: 'viewer@example.com',
        phone: '9876543213', password: 'Viewer@1234', adminId: 'TEST-VIEWER', status: 'active', role: 'viewer',
        permissions: { viewComplaints: true, editComplaints: false } });
    const viewerToken = jwt.sign({ id: viewer.id }, process.env.JWT_SECRET, { expiresIn: '5m' });
    await api(context, 'put', '/admin/complaints/' + complaint._id + '/status')
        .set('Authorization', 'Bearer ' + viewerToken).send({ status: 'resolved' }).expect(403);
    assert.equal((await Complaint.findById(complaint._id)).status, 'pending');
});
it('consumes a real stored admin OTP through the mounted route, returns a usable token and rejects replay', async () => {
    const admin = await Admin.findOne({ adminId: 'TEST-ADMIN' });
    admin.loginOtp = await hashOTP('654321');
    admin.loginOtpExpires = new Date(Date.now() + 60_000);
    admin.loginOtpAttempts = 0;
    await admin.save();

    const verified = await api(context, 'post', '/admin/auth/verify-otp')
        .send({ adminId: admin.id, otp: '654321' }).expect(200);
    assert.equal(typeof verified.body.token, 'string');
    await api(context, 'get', '/admin/auth/me')
        .set('Authorization', 'Bearer ' + verified.body.token).expect(200);
    await api(context, 'post', '/admin/auth/verify-otp')
        .send({ adminId: admin.id, otp: '654321' }).expect(400);
});
