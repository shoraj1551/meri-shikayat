import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import adminRouter from '../../src/routes/admin.routes.js';
import { protectAdmin, requirePermission } from '../../src/middleware/auth.js';
import Admin from '../../src/models/Admin.js';
import Complaint from '../../src/models/Complaint.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

function routePolicy(path, method) {
    const layer = adminRouter.stack.find(item => item.route?.path === path && item.route.methods[method]);
    assert.ok(layer, `route ${method.toUpperCase()} ${path} must exist`);
    return layer.route.stack.map(item => item.handle);
}

test('every admin complaint route has authentication followed by the correct permission guard', () => {
    const policies = [
        ['/complaints', 'get', 'viewComplaints'],
        ['/complaints/:id', 'get', 'viewComplaints'],
        ['/complaints/:id/status', 'put', 'editComplaints'],
        ['/complaints/:id/assign', 'put', 'editComplaints'],
        ['/complaints/:id/notes', 'post', 'editComplaints'],
        ['/complaints/:id/priority', 'put', 'editComplaints']
    ];

    for (const [path, method, permission] of policies) {
        const handlers = routePolicy(path, method);
        assert.equal(handlers[0], protectAdmin);
        assert.equal(handlers[1].requiredPermission, permission);
        assert.equal(handlers.length, 3, `${method.toUpperCase()} ${path} should have exactly auth, permission and controller handlers`);
    }
});

test('permission middleware fails closed and grants only explicit permissions or super-admin access', () => {
    const guard = requirePermission('editComplaints');

    let nextCalled = false;
    const unauthenticated = responseRecorder();
    guard({}, unauthenticated, () => { nextCalled = true; });
    assert.equal(unauthenticated.statusCode, 401);
    assert.equal(nextCalled, false);

    const viewer = responseRecorder();
    guard({ admin: { role: 'viewer', permissions: { editComplaints: false } } }, viewer, () => { nextCalled = true; });
    assert.equal(viewer.statusCode, 403);
    assert.equal(nextCalled, false);

    const missingPermissions = responseRecorder();
    guard({ admin: { role: 'manager' } }, missingPermissions, () => { nextCalled = true; });
    assert.equal(missingPermissions.statusCode, 403);
    assert.equal(nextCalled, false);

    guard({ admin: { role: 'moderator', permissions: { editComplaints: true } } }, responseRecorder(), () => { nextCalled = true; });
    assert.equal(nextCalled, true);

    nextCalled = false;
    guard({ admin: { role: 'super_admin', permissions: {} } }, responseRecorder(), () => { nextCalled = true; });
    assert.equal(nextCalled, true);
});

test('denied admins cannot reach any complaint controller or complaint database operation', async () => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const originalAdminFindById = Admin.findById;
    const originalComplaintFind = Complaint.find;
    const originalComplaintFindById = Complaint.findById;
    const originalComplaintCount = Complaint.countDocuments;
    let adminLookups = 0;
    let complaintOperations = 0;

    const deniedAdmin = {
        _id: '507f1f77bcf86cd799439011',
        status: 'active',
        role: 'viewer',
        permissions: { viewComplaints: false, editComplaints: false }
    };
    Admin.findById = () => {
        adminLookups += 1;
        return { select: async () => deniedAdmin };
    };
    const reachedComplaintLayer = () => {
        complaintOperations += 1;
        throw new Error('permission denial must happen before complaint database access');
    };
    Complaint.find = reachedComplaintLayer;
    Complaint.findById = reachedComplaintLayer;
    Complaint.countDocuments = reachedComplaintLayer;

    const app = express();
    app.use(express.json());
    app.use('/api/v1/admin', adminRouter);
    const token = jwt.sign({ id: deniedAdmin._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const authorization = `Bearer ${token}`;
    const id = '507f1f77bcf86cd799439012';

    try {
        await request(app).get('/api/v1/admin/complaints').set('Authorization', authorization).expect(403);
        await request(app).get(`/api/v1/admin/complaints/${id}`).set('Authorization', authorization).expect(403);
        await request(app).put(`/api/v1/admin/complaints/${id}/status`).set('Authorization', authorization).send({ status: 'resolved' }).expect(403);
        await request(app).put(`/api/v1/admin/complaints/${id}/assign`).set('Authorization', authorization).send({ assignedTo: deniedAdmin._id }).expect(403);
        await request(app).post(`/api/v1/admin/complaints/${id}/notes`).set('Authorization', authorization).send({ note: 'must not be written' }).expect(403);
        await request(app).put(`/api/v1/admin/complaints/${id}/priority`).set('Authorization', authorization).send({ priority: 'high' }).expect(403);
    } finally {
        Admin.findById = originalAdminFindById;
        Complaint.find = originalComplaintFind;
        Complaint.findById = originalComplaintFindById;
        Complaint.countDocuments = originalComplaintCount;
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
    }

    assert.equal(adminLookups, 6);
    assert.equal(complaintOperations, 0);
});
