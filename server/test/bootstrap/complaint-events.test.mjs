import test from 'node:test';
import assert from 'node:assert/strict';
import {
    createNewComplaintPayload,
    createStatusUpdatePayload,
    emitNewComplaint,
    emitComplaintStatusUpdate
} from '../../src/services/complaint-events.service.js';
import Complaint from '../../src/models/Complaint.js';
import { createComplaint } from '../../src/controllers/complaint.controller.js';
import { updateComplaintStatus } from '../../src/controllers/complaint-admin.controller.js';

function requestWithSocketRecorder(timeline) {
    const calls = [];
    const io = {
        to(room) {
            calls.push({ type: 'room', room });
            return {
                emit(event, payload) {
                    calls.push({ type: 'emit', event, payload });
                    timeline?.push('event-emitted');
                }
            };
        }
    };
    return { req: { app: { get: key => key === 'io' ? io : undefined } }, calls };
}

test('new complaint events target authenticated admins with a minimal payload', () => {
    const complaint = {
        _id: 'mongo-id',
        complaintId: 'CMP-2026-0001',
        title: '<img src=x onerror=alert(1)>',
        description: 'private complaint details',
        user: { email: 'private@example.test', phone: '9999999999' },
        status: 'submitted',
        priority: 'high',
        category: { _id: 'category-id', name: 'Roads' },
        mlAnalysis: { sentiment: { label: 'negative' } },
        createdAt: new Date('2026-01-02T03:04:05Z')
    };
    const payload = createNewComplaintPayload(complaint);
    assert.deepEqual(Object.keys(payload), [
        'id', 'complaintId', 'title', 'status', 'priority', 'categoryId', 'createdAt'
    ]);
    assert.equal('description' in payload, false);
    assert.equal('user' in payload, false);
    assert.equal('mlAnalysis' in payload, false);

    const { req, calls } = requestWithSocketRecorder();
    assert.equal(emitNewComplaint(req, complaint), true);
    assert.equal(calls[0].room, 'admin_notifications');
    assert.equal(calls[1].event, 'new_complaint');
    assert.deepEqual(calls[1].payload, payload);
});

test('status events target authenticated admins and omit status history and notes', () => {
    const complaint = {
        _id: 'mongo-id',
        complaintId: 'CMP-2026-0001',
        status: 'resolved',
        updatedAt: new Date('2026-01-02T04:05:06Z'),
        statusHistory: [{ reason: 'private reason' }],
        internalNotes: [{ note: 'private note' }]
    };
    const payload = createStatusUpdatePayload(complaint);
    assert.deepEqual(Object.keys(payload), ['id', 'complaintId', 'status', 'updatedAt']);

    const { req, calls } = requestWithSocketRecorder();
    assert.equal(emitComplaintStatusUpdate(req, complaint), true);
    assert.equal(calls[0].room, 'admin_notifications');
    assert.equal(calls[1].event, 'complaint_status_update');
    assert.deepEqual(calls[1].payload, payload);
});

test('event helpers safely no-op when Socket.IO is unavailable', () => {
    const req = { app: { get: () => undefined } };
    assert.equal(emitNewComplaint(req, {}), false);
    assert.equal(emitComplaintStatusUpdate(req, {}), false);
});

test('socket delivery errors never fail an already-persisted complaint workflow', () => {
    const req = { app: { get: () => ({ to: () => { throw new Error('adapter unavailable'); } }) } };
    assert.equal(emitNewComplaint(req, {}), false);
    assert.equal(emitComplaintStatusUpdate(req, {}), false);
});

test('successful complaint creation emits after persistence without waiting for stats update', async t => {
    const originalFindOne = Complaint.findOne;
    const originalCreate = Complaint.create;
    const sequence = [];
    const savedComplaint = {
        _id: 'created-id', complaintId: 'generated-at-runtime', title: 'Broken road',
        status: 'submitted', priority: 'medium', createdAt: new Date()
    };
    Complaint.findOne = () => ({ sort: async () => null });
    Complaint.create = async values => {
        sequence.push('complaint-created');
        Object.assign(savedComplaint, values);
        return savedComplaint;
    };
    t.after(() => {
        Complaint.findOne = originalFindOne;
        Complaint.create = originalCreate;
    });

    const { req: socketReq, calls } = requestWithSocketRecorder(sequence);
    const req = {
        ...socketReq,
        body: {
            title: 'Broken road', description: 'A dangerous pothole needs urgent repair',
            type: 'civic', location: { city: 'Delhi' }
        },
        user: {
            id: 'user-id',
            constructor: {
                async findByIdAndUpdate() { sequence.push('stats-updated'); }
            }
        }
    };
    const response = {};
    const res = {
        status(code) { response.status = code; return this; },
        json(body) { response.body = body; }
    };

    await createComplaint(req, res);
    sequence.push('response-returned');

    assert.equal(response.status, 201);
    assert.deepEqual(sequence, ['complaint-created', 'event-emitted', 'stats-updated', 'response-returned']);
    assert.equal(calls[1].event, 'new_complaint');
    assert.equal(calls[1].payload.id, 'created-id');
});

test('successful status mutation emits the persisted status', async t => {
    const originalFindById = Complaint.findById;
    const complaint = {
        _id: 'status-id', complaintId: 'CMP-2026-0002', user: 'user-id', status: 'submitted',
        statusHistory: [], updatedAt: new Date(),
        async save() { this.updatedAt = new Date(); },
        async populate() {}
    };
    Complaint.findById = async () => complaint;
    t.after(() => { Complaint.findById = originalFindById; });

    const { req: socketReq, calls } = requestWithSocketRecorder();
    const req = {
        ...socketReq,
        params: { id: 'status-id' }, body: { status: 'in_progress', reason: 'Work started' },
        admin: { _id: 'admin-id' }
    };
    const response = {};
    const res = {
        status(code) { response.status = code; return this; },
        json(body) { response.body = body; }
    };

    await updateComplaintStatus(req, res);

    assert.equal(response.body.success, true);
    assert.equal(complaint.status, 'in_progress');
    assert.equal(calls[1].event, 'complaint_status_update');
    assert.equal(calls[1].payload.status, 'in_progress');
});
