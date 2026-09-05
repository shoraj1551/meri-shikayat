import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';

process.env.JWT_SECRET = randomBytes(64).toString('hex');
process.env.NO_UPDATE_NOTIFIER = '1';
delete process.env.EMAIL_USER;
delete process.env.EMAIL_PASSWORD;
let databaseChecks = 0;
const app = await createApp({
    database: { isReady() { databaseChecks++; return false; } },
    redis: { isReady: () => false }
});
const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
test('default or configured invitation cannot create privileged accounts, with or without a bearer token', async () => {
    process.env.SUPER_ADMIN_INVITATION_CODE = 'operator-configured-invitation';
    const before = databaseChecks;
    for (const invitationCode of ['SUPER_ADMIN_2024', process.env.SUPER_ADMIN_INVITATION_CODE, undefined]) {
        for (const bearer of [undefined, token]) {
            let call = request(app).post('/api/v1/auth/register/super-admin').send({ invitationCode, userType: 'super_admin' });
            if (bearer) call = call.set('Authorization', 'Bearer ' + bearer);
            const response = await call.expect(403);
            assert.equal(response.body.code, 'BETA_FEATURE_DISABLED');
            assert.equal(response.headers['cache-control'], 'no-store');
        }
    }
    assert.equal(databaseChecks, before);
});
test('guest submission is denied before multipart storage or database access', async () => {
    const before = await readdir('uploads', { recursive: true });
    const checks = databaseChecks;
    const response = await request(app).post('/api/v1/complaints/guest')
        .field('description', 'A complaint supplied by an unauthenticated visitor')
        .attach('media', Buffer.from('not-a-real-image'), 'sample.png').expect(403);
    assert.equal(response.body.code, 'BETA_FEATURE_DISABLED');
    assert.deepEqual(await readdir('uploads', { recursive: true }), before);
    assert.equal(databaseChecks, checks);
});
test('a known complaint ID cannot be claimed by any bearer or method', async () => {
    const checks = databaseChecks;
    for (const method of ['post', 'put', 'get']) {
        for (const bearer of [undefined, token]) {
            let call = request(app)[method]('/api/v1/complaints/MSK-2026-000001/claim');
            if (bearer) call = call.set('Authorization', 'Bearer ' + bearer);
            await call.expect(403);
        }
    }
    assert.equal(databaseChecks, checks);
});
test('privilege injection is rejected on each public registration family before DB access', async () => {
    const checks = databaseChecks;
    for (const path of ['/auth/register', '/auth/register/general-user', '/auth/register/admin',
        '/auth/register/contractor', '/admin/auth/register']) {
        for (const body of [{ role: 'super_admin' }, { userType: 'super_admin' }, { status: 'active' },
            { permissions: { manageAdmins: true } }, { adminProfile: { role: 'super_admin' } }]) {
            const response = await request(app).post('/api/v1' + path).send(body).expect(403);
            assert.equal(response.body.code, 'PRIVILEGED_FIELDS_FORBIDDEN');
        }
    }
    assert.equal(databaseChecks, checks);
});
test('retired seed commands fail before database access and never print a password', () => {
    for (const script of ['src/scripts/seedSuperAdmin.js', 'src/seeds/seed.js']) {
        const child = spawnSync(process.execPath, [fileURLToPath(new URL('../../' + script, import.meta.url))], {
            env: { ...process.env, MONGODB_URI: 'mongodb://127.0.0.1:1/forbidden' }, encoding: 'utf8', timeout: 5000
        });
        assert.equal(child.status, 1);
        assert.match(child.stderr, /disabled/);
        assert.doesNotMatch(child.stdout + child.stderr, /adminpassword123|MongoDB Connected/);
    }
});
