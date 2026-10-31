import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildComplaintFormData,
    normalizeLocationForApi
} from '../src/js/pages/file-complaint-new.js';

const location = { address: 'Central Road', coordinates: { lat: 28.61, lng: 77.2 } };

test('live file-complaint text payload satisfies required API fields with a category ObjectId', () => {
    const payload = buildComplaintFormData({
        title: 'Broken road surface',
        description: 'There is a deep pothole near the main crossing.',
        category: '507f1f77bcf86cd799439011',
        customCategory: '',
        mediaType: null,
        mediaFile: null
    }, location);

    assert.equal(payload.get('title'), 'Broken road surface');
    assert.equal(payload.get('type'), 'text');
    assert.equal(payload.get('category'), '507f1f77bcf86cd799439011');
    assert.equal(payload.has('customCategory'), false);
    assert.deepEqual(JSON.parse(payload.get('location')), location);
});

test('custom category and media payload use controller-supported field names and type', () => {
    const media = new Blob(['image-content'], { type: 'image/png' });
    const payload = buildComplaintFormData({
        title: 'Damaged public sign',
        description: 'The public information sign has been damaged.',
        category: 'other',
        customCategory: 'Public signage',
        mediaType: 'photo',
        mediaFile: media
    }, location);

    assert.equal(payload.get('type'), 'image');
    assert.equal(payload.get('customCategory'), 'Public signage');
    assert.equal(payload.has('category'), false);
    assert.equal(payload.get('media').type, 'image/png');
});

test('GPS and manual locations normalize to the model coordinates contract', async () => {
    assert.deepEqual(await normalizeLocationForApi({ lat: 28.61, lng: 77.2, address: 'GPS address' }), {
        address: 'GPS address',
        coordinates: { lat: 28.61, lng: 77.2 }
    });

    const fakeFetch = async () => ({
        ok: true,
        json: async () => [{ lat: '19.076', lon: '72.8777' }]
    });
    assert.deepEqual(await normalizeLocationForApi({ manual: true, address: 'Manual address' }, fakeFetch), {
        address: 'Manual address',
        coordinates: { lat: 19.076, lng: 72.8777 }
    });
});
