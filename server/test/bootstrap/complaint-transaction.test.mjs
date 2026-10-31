import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, access, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import Complaint from '../../src/models/Complaint.js';
import { persistComplaintSubmission } from '../../src/services/complaint-persistence.service.js';
import { createComplaint } from '../../src/controllers/complaint.controller.js';

function fakeSession(onTransaction) {
    return {
        ended: false,
        async withTransaction(work) { return onTransaction ? onTransaction(work) : work(); },
        async endSession() { this.ended = true; }
    };
}

test('complaint, media link and user stats share one committed transaction', async () => {
    const session = fakeSession();
    const calls = [];
    const complaint = { _id: 'complaint-id', media: [] };
    const complaintModel = {
        async create(values, options) {
            calls.push(['complaint', options.session]);
            return [Object.assign(complaint, values[0])];
        },
        async updateOne(filter, update, options) {
            calls.push(['media-link', options.session, filter, update]);
        }
    };
    const mediaModel = {
        async create(values, options) {
            calls.push(['media', options.session, values[0].complaint]);
            return [{ _id: 'media-id' }];
        }
    };
    const userModel = {
        async findByIdAndUpdate(id, update, options) {
            calls.push(['stats', options.session, id, update]);
            return { _id: id };
        }
    };

    const result = await persistComplaintSubmission({
        complaintData: { title: 'Transactional complaint' },
        mediaData: { filename: 'safe.png' },
        userId: 'user-id',
        userModel
    }, {
        startSession: async () => session,
        complaintModel,
        mediaModel
    });

    assert.equal(result, complaint);
    assert.deepEqual(result.media, ['media-id']);
    assert.deepEqual(calls.map(item => item[0]), ['complaint', 'media', 'media-link', 'stats']);
    for (const call of calls) assert.equal(call[1], session);
    assert.equal(session.ended, true);
});

test('a stats failure aborts the transaction and never returns a complaint', async () => {
    const session = fakeSession(async work => {
        await assert.rejects(work(), /stats unavailable/);
        throw new Error('stats unavailable');
    });
    const complaintModel = {
        async create(values) { return [{ _id: 'rolled-back-id', ...values[0] }]; },
        async updateOne() {}
    };
    const userModel = { async findByIdAndUpdate() { throw new Error('stats unavailable'); } };

    await assert.rejects(persistComplaintSubmission({
        complaintData: {}, userId: 'user-id', userModel
    }, {
        startSession: async () => session,
        complaintModel,
        mediaModel: {}
    }), /stats unavailable/);
    assert.equal(session.ended, true);
});

test('controller removes the uploaded file when validation fails', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'complaint-cleanup-'));
    const filePath = path.join(directory, 'upload.png');
    await writeFile(filePath, 'temporary upload');
    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };

    try {
        await createComplaint({
            body: {
                title: 'Invalid upload complaint',
                description: 'Missing valid coordinates after upload.',
                type: 'image',
                customCategory: 'Roads',
                location: { address: 'Delhi' }
            },
            file: { path: filePath, filename: 'upload.png', mimetype: 'image/png' },
            user: { id: 'user-id' }
        }, res);
        assert.equal(res.statusCode, 400);
        await assert.rejects(access(filePath), error => error.code === 'ENOENT');
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test('controller does not emit or return success when the transaction fails', async t => {
    const originalStartSession = mongoose.startSession;
    const originalCreate = Complaint.create;
    const directory = await mkdtemp(path.join(os.tmpdir(), 'complaint-transaction-cleanup-'));
    const filePath = path.join(directory, 'transaction-upload.png');
    await writeFile(filePath, 'temporary transaction upload');
    let emitted = false;
    mongoose.startSession = async () => fakeSession(async () => { throw new Error('transaction failed'); });
    Complaint.create = async () => { throw new Error('must not escape transaction'); };
    t.after(async () => {
        mongoose.startSession = originalStartSession;
        Complaint.create = originalCreate;
        await rm(directory, { recursive: true, force: true });
    });

    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
    await createComplaint({
        body: {
            title: 'Transaction failure',
            description: 'This complaint must never be reported as successful.',
            type: 'image', customCategory: 'Roads',
            location: { address: 'Delhi', coordinates: { lat: 28.61, lng: 77.2 } }
        },
        file: {
            path: filePath,
            filename: 'transaction-upload.png',
            originalname: 'transaction-upload.png',
            mimetype: 'image/png',
            size: 28
        },
        user: { id: 'user-id', constructor: { findByIdAndUpdate: async () => ({}) } },
        app: { get() { emitted = true; return undefined; } }
    }, res);
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
    assert.equal(emitted, false);
    await assert.rejects(access(filePath), error => error.code === 'ENOENT');
});
