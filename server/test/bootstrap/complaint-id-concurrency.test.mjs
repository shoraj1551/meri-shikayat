import test from 'node:test';
import assert from 'node:assert/strict';
import { createComplaintWithUniqueId } from '../../src/services/complaintId.service.js';

const duplicateComplaintId = complaintId => Object.assign(new Error(
    `E11000 duplicate key error index: complaintId_1 dup key: { complaintId: "${complaintId}" }`
), {
    code: 11000,
    keyPattern: { complaintId: 1 },
    keyValue: { complaintId }
});

test('concurrent complaint inserts recover from colliding generated IDs', async () => {
    const requestCount = 20;
    const storedIds = new Set();
    let generation = 0;

    const idGenerator = async () => {
        generation += 1;
        if (generation <= requestCount) return 'MSK-2026-AAAAAAAAAAAAAAAA';
        return `MSK-2026-${generation.toString(16).toUpperCase().padStart(16, '0')}`;
    };

    const complaintModel = {
        async create(values) {
            // Force all first attempts to reach the database boundary together.
            await new Promise(resolve => setImmediate(resolve));
            if (storedIds.has(values.complaintId)) throw duplicateComplaintId(values.complaintId);
            storedIds.add(values.complaintId);
            return values;
        }
    };

    const complaints = await Promise.all(Array.from({ length: requestCount }, (_, index) =>
        createComplaintWithUniqueId(
            { title: `Complaint ${index}` },
            { idGenerator, complaintModel, maxAttempts: 3 }
        )
    ));

    assert.equal(complaints.length, requestCount);
    assert.equal(storedIds.size, requestCount);
    assert.equal(new Set(complaints.map(item => item.complaintId)).size, requestCount);
});

test('only complaintId duplicate-key errors are retried', async () => {
    let attempts = 0;
    const unrelatedDuplicate = Object.assign(new Error('duplicate other index'), {
        code: 11000,
        keyPattern: { anotherField: 1 },
        keyValue: { anotherField: 'value' }
    });

    await assert.rejects(
        createComplaintWithUniqueId({}, {
            idGenerator: async () => `MSK-2026-${String(++attempts).padStart(16, '0')}`,
            complaintModel: { create: async () => { throw unrelatedDuplicate; } }
        }),
        error => error === unrelatedDuplicate
    );
    assert.equal(attempts, 1);
});

test('collision retries are bounded and surface the final database error', async () => {
    let attempts = 0;
    const complaintModel = {
        async create(values) {
            throw duplicateComplaintId(values.complaintId);
        }
    };

    await assert.rejects(createComplaintWithUniqueId({}, {
        idGenerator: async () => {
            attempts += 1;
            return 'MSK-2026-BBBBBBBBBBBBBBBB';
        },
        complaintModel,
        maxAttempts: 4
    }), error => error.code === 11000);
    assert.equal(attempts, 4);
});
