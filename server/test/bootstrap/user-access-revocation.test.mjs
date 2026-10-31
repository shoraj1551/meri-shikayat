import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User.js';
import AuditLog from '../../src/models/AuditLog.js';
import { protect } from '../../src/middleware/auth.js';
import { logout } from '../../src/controllers/auth.controller.js';
import { changePassword } from '../../src/controllers/user.controller.js';

const SECRET = 'user-revocation-contract-0123456789abcdef0123456789abcdef0123456789abcdef';
const USER_ID = '507f1f77bcf86cd799439011';

function appFor(user) {
    const app = express();
    User.findById = () => ({ select: async () => user });
    app.get('/protected', protect, (_req, res) => res.json({ success: true }));
    return app;
}

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('protected HTTP routes deny every non-active or deleted user immediately', async () => {
    const previousSecret = process.env.JWT_SECRET;
    const originalFindById = User.findById;
    process.env.JWT_SECRET = SECRET;
    const token = jwt.sign({ id: USER_ID, tokenVersion: 0 }, SECRET, { expiresIn: '7d' });

    try {
        for (const account of [
            { status: 'pending' },
            { status: 'suspended' },
            { status: 'rejected' },
            { status: 'active', isDeleted: true }
        ]) {
            await request(appFor({ _id: USER_ID, tokenVersion: 0, ...account }))
                .get('/protected')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        }
    } finally {
        User.findById = originalFindById;
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    }
});

test('token version mismatch revokes an otherwise valid unexpired access token', async () => {
    const previousSecret = process.env.JWT_SECRET;
    const originalFindById = User.findById;
    process.env.JWT_SECRET = SECRET;
    const token = jwt.sign({ id: USER_ID, tokenVersion: 0 }, SECRET, { expiresIn: '7d' });

    try {
        await request(appFor({ _id: USER_ID, status: 'active', tokenVersion: 1 }))
            .get('/protected')
            .set('Authorization', `Bearer ${token}`)
            .expect(401);
    } finally {
        User.findById = originalFindById;
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    }
});

test('logout advances token version and clears refresh credentials', async () => {
    const originalFindById = User.findById;
    const originalAuditCreate = AuditLog.create;
    const user = {
        _id: USER_ID,
        status: 'active',
        tokenVersion: 0,
        refreshTokens: [{ token: 'stored-refresh-id' }],
        save: async () => undefined
    };
    User.findById = async () => user;
    AuditLog.create = async entry => ({ _id: 'audit-test-id', ...entry });

    try {
        const res = responseRecorder();
        await logout({
            user: { id: USER_ID },
            body: {},
            headers: {},
            ip: '127.0.0.1',
            get: () => 'security-test'
        }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(user.tokenVersion, 1);
        assert.deepEqual(user.refreshTokens, []);
    } finally {
        User.findById = originalFindById;
        AuditLog.create = originalAuditCreate;
    }
});

test('password change advances token version and clears every refresh token', async () => {
    const originalFindById = User.findById;
    const user = {
        _id: USER_ID,
        status: 'active',
        tokenVersion: 3,
        refreshTokens: [{ token: 'stored-refresh-id' }],
        comparePassword: async () => true,
        save: async () => undefined
    };
    User.findById = () => ({ select: async () => user });

    try {
        const res = responseRecorder();
        await changePassword({ user: { id: USER_ID }, body: { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(user.tokenVersion, 4);
        assert.deepEqual(user.refreshTokens, []);
        assert.ok(user.lastPasswordChange instanceof Date);
    } finally {
        User.findById = originalFindById;
    }
});
