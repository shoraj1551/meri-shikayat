import test from 'node:test';
import assert from 'node:assert/strict';
import Admin from '../../src/models/Admin.js';
import User from '../../src/models/User.js';
import { registerAdmin } from '../../src/controllers/registration.controller.js';
import { migrateAdminUsersToAdmins } from '../../src/migrations/migrate-admin-users-to-admins.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

const selectable = value => ({ select: async () => value });

test('multi-role administrator registration creates the canonical pending Admin identity', async () => {
    const originals = {
        adminFindOne: Admin.findOne,
        adminCreate: Admin.create,
        userFindOne: User.findOne,
        userCreate: User.create
    };
    let adminFindCalls = 0;
    let created;
    let userCreates = 0;
    Admin.findOne = () => {
        adminFindCalls += 1;
        if (adminFindCalls === 1) return selectable(null);
        return { sort: async () => null };
    };
    User.findOne = () => selectable(null);
    User.create = async () => { userCreates += 1; };
    Admin.create = async value => {
        created = value;
        return { _id: 'admin-object-id', ...value };
    };

    try {
        const res = responseRecorder();
        await registerAdmin({
            body: {
                firstName: 'Asha',
                lastName: 'Sharma',
                email: 'ASHA@EXAMPLE.COM',
                phone: '9876543210',
                password: 'StrongPass1!',
                department: 'roads',
                designation: 'Officer',
                employeeId: 'EMP-100'
            }
        }, res);

        assert.equal(res.statusCode, 201);
        assert.equal(userCreates, 0);
        assert.equal(created.email, 'asha@example.com');
        assert.equal(created.status, 'pending');
        assert.equal(created.role, 'viewer');
        assert.equal(created.employeeId, 'EMP-100');
        assert.match(created.adminId, /^ADM-\d{4}-0001$/);
        assert.equal(res.body.data.id, 'admin-object-id');
        assert.equal(res.body.data.userType, 'admin');
    } finally {
        Admin.findOne = originals.adminFindOne;
        Admin.create = originals.adminCreate;
        User.findOne = originals.userFindOne;
        User.create = originals.userCreate;
    }
});

test('admin registration rejects identities already present in the legacy User collection', async () => {
    const originals = {
        adminFindOne: Admin.findOne,
        adminCreate: Admin.create,
        userFindOne: User.findOne
    };
    let writes = 0;
    Admin.findOne = () => selectable(null);
    User.findOne = () => selectable({ _id: 'legacy-user-id' });
    Admin.create = async () => { writes += 1; };

    try {
        const res = responseRecorder();
        await registerAdmin({
            body: {
                firstName: 'Asha', lastName: 'Sharma', email: 'asha@example.com',
                phone: '9876543210', password: 'StrongPass1!'
            }
        }, res);
        assert.equal(res.statusCode, 400);
        assert.match(res.body.message, /already exists/);
        assert.equal(writes, 0);
    } finally {
        Admin.findOne = originals.adminFindOne;
        Admin.create = originals.adminCreate;
        User.findOne = originals.userFindOne;
    }
});

test('User schema no longer accepts administrator identity types', async () => {
    const user = new User({
        firstName: 'Legacy',
        lastName: 'Admin',
        email: 'legacy@example.com',
        password: 'StrongPass1!',
        userType: 'admin'
    });
    await assert.rejects(user.validate(), /not a valid enum value/);
    assert.equal(User.schema.path('adminProfile'), undefined);
    assert.ok(Admin.schema.path('employeeId'));
    assert.ok(Admin.schema.path('legacyUserId'));
});

test('legacy unified administrators migrate with their password hash before source deletion', async () => {
    const legacyId = new User.base.Types.ObjectId();
    const legacy = {
        _id: legacyId,
        firstName: 'Legacy',
        lastName: 'Officer',
        email: 'legacy@example.com',
        phone: '9876543210',
        password: '$2a$10$existingPasswordHashMustNotBeRehashed',
        userType: 'admin',
        status: 'pending',
        adminProfile: {
            employeeId: 'EMP-OLD',
            role: 'viewer',
            permissions: { viewComplaints: true }
        }
    };
    const originals = {
        userFind: User.collection.find,
        userDeleteOne: User.collection.deleteOne,
        adminFindOne: Admin.findOne,
        adminInsertOne: Admin.collection.insertOne
    };
    const events = [];
    let adminLookup = 0;
    let inserted;
    User.collection.find = () => ({ toArray: async () => [legacy] });
    User.collection.deleteOne = async filter => {
        events.push('delete');
        assert.equal(filter._id, legacyId);
        return { deletedCount: 1 };
    };
    Admin.findOne = () => {
        adminLookup += 1;
        if (adminLookup <= 2) return selectable(null);
        return { sort: async () => null };
    };
    Admin.collection.insertOne = async value => {
        events.push('insert');
        inserted = value;
        return { insertedId: new User.base.Types.ObjectId() };
    };

    try {
        const result = await migrateAdminUsersToAdmins({ logger: { error: () => undefined } });
        assert.deepEqual(result, { found: 1, migrated: 1, reconciled: 0, conflicts: 0, errors: 0 });
        assert.deepEqual(events, ['insert', 'delete']);
        assert.equal(inserted.password, legacy.password);
        assert.equal(inserted.legacyUserId, legacyId);
        assert.equal(inserted.status, 'pending');
        assert.equal(inserted.employeeId, 'EMP-OLD');
    } finally {
        User.collection.find = originals.userFind;
        User.collection.deleteOne = originals.userDeleteOne;
        Admin.findOne = originals.adminFindOne;
        Admin.collection.insertOne = originals.adminInsertOne;
    }
});
