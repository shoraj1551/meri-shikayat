import test from 'node:test';
import assert from 'node:assert/strict';
import complaintRouter from '../../src/routes/complaint.routes.js';
import { protect } from '../../src/middleware/auth.js';
import { searchComplaintById } from '../../src/controllers/guest-complaint.controller.js';
import { generateComplaintId, isValidComplaintId, parseComplaintId } from '../../src/services/complaintId.service.js';
import Complaint from '../../src/models/Complaint.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('complaint lookup route requires authentication before rate limiting and controller access', () => {
    const layer = complaintRouter.stack.find(item => item.route?.path === '/search/:complaintId');
    assert.ok(layer);
    const handlers = layer.route.stack.map(item => item.handle);
    assert.equal(handlers[0], protect);
    assert.equal(handlers.at(-1), searchComplaintById);
});

test('owner lookup is scoped in the database query and returns no private complaint fields', async () => {
    const originalFindOne = Complaint.findOne;
    let query;
    Complaint.findOne = criteria => {
        query = criteria;
        return {
            select() { return this; },
            populate() { return this; },
            async lean() {
                return {
                    complaintId: 'MSK-2026-012345',
                    status: 'in_progress',
                    priority: 'high',
                    category: { name: 'Roads' },
                    description: 'must never be returned',
                    location: { address: 'private address' },
                    createdAt: new Date(),
                    user: { firstName: 'Private', lastName: 'Person' }
                };
            }
        };
    };

    try {
        const res = responseRecorder();
        await searchComplaintById({
            params: { complaintId: 'MSK-2026-012345' },
            user: { _id: 'owner-id' }
        }, res);
        assert.deepEqual(query, {
            complaintId: 'MSK-2026-012345',
            user: 'owner-id',
            isGuest: { $ne: true }
        });
        assert.deepEqual(res.body.data, {
            complaintId: 'MSK-2026-012345',
            status: 'in_progress',
            priority: 'high',
            category: 'Roads'
        });
        for (const privateField of ['description', 'location', 'createdAt', 'submittedBy', 'user', 'media']) {
            assert.equal(Object.hasOwn(res.body.data, privateField), false);
        }
    } finally {
        Complaint.findOne = originalFindOne;
    }
});

test('non-owned and nonexistent complaint IDs share the same not-found response', async () => {
    const originalFindOne = Complaint.findOne;
    Complaint.findOne = () => ({
        select() { return this; },
        populate() { return this; },
        async lean() { return null; }
    });
    try {
        const res = responseRecorder();
        await searchComplaintById({ params: { complaintId: 'MSK-2026-999999' }, user: { _id: 'other-user' } }, res);
        assert.equal(res.statusCode, 404);
        assert.deepEqual(res.body, { success: false, message: 'Complaint not found' });
    } finally {
        Complaint.findOne = originalFindOne;
    }
});

test('new complaint IDs are cryptographically opaque while legacy IDs remain valid', async () => {
    const generated = await Promise.all(Array.from({ length: 32 }, () => generateComplaintId()));
    assert.equal(new Set(generated).size, generated.length);
    for (const id of generated) {
        assert.match(id, /^MSK-\d{4}-[A-F0-9]{16}$/);
        assert.equal(isValidComplaintId(id), true);
        assert.equal(parseComplaintId(id).sequence, null);
    }
    assert.equal(isValidComplaintId('MSK-2026-000001'), true);
    assert.equal(parseComplaintId('MSK-2026-000001').sequence, 1);
});
