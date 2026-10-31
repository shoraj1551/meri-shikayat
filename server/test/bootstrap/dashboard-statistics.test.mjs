import test from 'node:test';
import assert from 'node:assert/strict';
import Complaint from '../../src/models/Complaint.js';
import User from '../../src/models/User.js';
import { getDashboardStats } from '../../src/controllers/admin.controller.js';

test('admin dashboard counts canonical complaint statuses and active non-deleted users', async () => {
    const originalComplaintCount = Complaint.countDocuments;
    const originalUserCount = User.countDocuments;
    const complaintQueries = [];
    let userQuery;

    Complaint.countDocuments = async query => {
        complaintQueries.push(query);
        if (!query) return 12;
        if (query.status === 'pending') return 4;
        if (query.status === 'resolved') return 7;
        throw new Error(`Unexpected complaint query: ${JSON.stringify(query)}`);
    };
    User.countDocuments = async query => {
        userQuery = query;
        return 9;
    };

    try {
        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(body) { this.body = body; return this; }
        };
        await getDashboardStats({}, res);

        assert.equal(res.statusCode, 200);
        assert.deepEqual(complaintQueries, [undefined, { status: 'pending' }, { status: 'resolved' }]);
        assert.deepEqual(userQuery, { status: 'active', isDeleted: { $ne: true } });
        assert.deepEqual(res.body, {
            success: true,
            data: { totalComplaints: 12, pendingComplaints: 4, resolvedComplaints: 7, activeUsers: 9 }
        });
    } finally {
        Complaint.countDocuments = originalComplaintCount;
        User.countDocuments = originalUserCount;
    }
});
