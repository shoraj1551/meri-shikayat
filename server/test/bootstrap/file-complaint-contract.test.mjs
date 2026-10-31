import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Complaint from '../../src/models/Complaint.js';
import {
    createComplaint,
    buildNearbyComplaintPipeline,
    getCanonicalCoordinates,
    getNearbyComplaints
} from '../../src/controllers/complaint.controller.js';

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

test('complaint controller persists the live page customCategory contract', async () => {
    const originalCreate = Complaint.create;
    const originalStartSession = mongoose.startSession;
    let created;
    Complaint.create = async data => {
        created = Array.isArray(data) ? data[0] : data;
        return [{ _id: 'complaint-id', ...created }];
    };
    mongoose.startSession = async () => ({
        async withTransaction(work) { await work(); },
        async endSession() {}
    });

    try {
        const res = responseRecorder();
        await createComplaint({
            body: {
                title: 'Damaged public sign',
                description: 'The public information sign has been damaged.',
                type: 'text',
                customCategory: 'Public signage',
                location: JSON.stringify({
                    address: 'Central Road',
                    coordinates: { lat: 28.61, lng: 77.2 }
                })
            },
            user: {
                id: '507f1f77bcf86cd799439011',
                constructor: { findByIdAndUpdate: async () => ({ _id: 'user-id' }) }
            },
            app: { get: () => undefined }
        }, res);

        assert.equal(res.statusCode, 201);
        assert.equal(created.title, 'Damaged public sign');
        assert.equal(created.type, 'text');
        assert.equal(created.category, undefined);
        assert.equal(created.customCategory, 'Public signage');
        assert.deepEqual(created.location.coordinates, { lat: 28.61, lng: 77.2 });
    } finally {
        Complaint.create = originalCreate;
        mongoose.startSession = originalStartSession;
    }
});

test('complaint controller rejects slugs and malformed location before persistence', async () => {
    const originalCreate = Complaint.create;
    let writes = 0;
    Complaint.create = async () => { writes += 1; };
    const base = {
        title: 'Broken road surface',
        description: 'There is a deep pothole near the main crossing.',
        type: 'text'
    };

    try {
        const slugResponse = responseRecorder();
        await createComplaint({
            body: { ...base, category: 'roads', location: { address: 'Road', coordinates: { lat: 1, lng: 2 } } },
            user: { id: 'user-id' }
        }, slugResponse);
        assert.equal(slugResponse.statusCode, 400);
        assert.match(slugResponse.body.message, /Invalid category/);

        const locationResponse = responseRecorder();
        await createComplaint({
            body: { ...base, customCategory: 'Roads', location: { address: 'Road' } },
            user: { id: 'user-id' }
        }, locationResponse);
        assert.equal(locationResponse.statusCode, 400);
        assert.match(locationResponse.body.message, /valid location/);
        assert.equal(writes, 0);
    } finally {
        Complaint.create = originalCreate;
    }
});

test('complaint model enforces real latitude and longitude ranges', async () => {
    const complaint = new Complaint({
        complaintId: 'MSK-TEST-GEO',
        title: 'Broken road surface',
        description: 'A deep pothole blocks the lane.',
        type: 'text',
        customCategory: 'Roads',
        location: { address: 'Central Road', coordinates: { lat: 28.61, lng: 77.2 } }
    });

    await complaint.validate();
    complaint.location.coordinates.lat = 91;
    await assert.rejects(complaint.validate(), /more than maximum allowed value/);
});

test('nearby coordinate normalization supports legacy users and rejects invalid ranges', () => {
    assert.deepEqual(getCanonicalCoordinates({ coordinates: { lat: 28.61, lng: 77.2 } }), { lat: 28.61, lng: 77.2 });
    assert.deepEqual(getCanonicalCoordinates({ coordinates: { latitude: 19.076, longitude: 72.8777 } }), { lat: 19.076, lng: 72.8777 });
    assert.equal(getCanonicalCoordinates({ coordinates: { lat: 91, lng: 77.2 } }), null);
    assert.equal(getCanonicalCoordinates({ coordinates: { lat: 28.61 } }), null);
});

test('nearby complaints use a bounded geospatial query and exclude own and guest complaints', async () => {
    const originals = {
        aggregate: Complaint.aggregate,
        populate: Complaint.populate
    };
    let pipeline;
    let populated;
    Complaint.aggregate = async value => {
        pipeline = value;
        return [{ _id: 'nearby-id', distanceMetres: 1200 }];
    };
    Complaint.populate = async value => { populated = value; };

    try {
        const res = responseRecorder();
        await getNearbyComplaints({
            user: {
                _id: '507f1f77bcf86cd799439011',
                location: { coordinates: { latitude: 28.61, longitude: 77.2 } }
            }
        }, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.count, 1);
        assert.deepEqual(pipeline[0].$match.user, {
            $exists: true,
            $ne: '507f1f77bcf86cd799439011'
        });
        assert.deepEqual(pipeline[0].$match.isGuest, { $ne: true });
        assert.deepEqual(pipeline[2], { $match: { distanceMetres: { $lte: 25000 } } });
        assert.deepEqual(pipeline[3], { $sort: { distanceMetres: 1, createdAt: -1 } });
        assert.deepEqual(pipeline[4], { $limit: 5 });
        assert.equal(populated, res.body.data);
    } finally {
        Complaint.aggregate = originals.aggregate;
        Complaint.populate = originals.populate;
    }
});

test('nearby pipeline uses a coordinate bounding box before exact distance calculation', () => {
    const pipeline = buildNearbyComplaintPipeline({ lat: 28.61, lng: 77.2 }, 'user-id');
    const match = pipeline[0].$match;
    assert.ok(match['location.coordinates.lat'].$gte < 28.61);
    assert.ok(match['location.coordinates.lat'].$lte > 28.61);
    assert.ok(match['location.coordinates.lng'].$gte < 77.2);
    assert.ok(match['location.coordinates.lng'].$lte > 77.2);
    assert.ok(pipeline[1].$set.distanceMetres);
});

test('nearby complaints return an empty result when the user has no valid coordinates', async () => {
    const originalAggregate = Complaint.aggregate;
    let queried = false;
    Complaint.aggregate = async () => { queried = true; return []; };
    try {
        const res = responseRecorder();
        await getNearbyComplaints({ user: { _id: 'user-id', location: { city: 'Delhi' } } }, res);
        assert.deepEqual(res.body, { success: true, count: 0, data: [] });
        assert.equal(queried, false);
    } finally {
        Complaint.aggregate = originalAggregate;
    }
});
