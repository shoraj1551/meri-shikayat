import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
    serializeComplaintFormData,
    restoreComplaintFormData
} from '../src/js/utils/pwa.js';
import PWAManager from '../src/js/utils/pwa.js';

function completeComplaint() {
    const payload = new FormData();
    payload.append('title', 'Overflowing drain');
    payload.append('type', 'image');
    payload.append('description', 'The drain is overflowing beside several homes.');
    payload.append('category', '507f1f77bcf86cd799439011');
    payload.append('location', JSON.stringify({
        address: 'Central Road',
        coordinates: { lat: 28.61, lng: 77.2 }
    }));
    payload.append('media', new Blob(['actual-image-bytes'], { type: 'image/png' }), 'drain.png');
    return payload;
}

test('offline complaint serialization preserves the complete multipart contract and media bytes', async () => {
    const entries = serializeComplaintFormData(completeComplaint());
    assert.equal(entries.some(entry => entry.name === 'Authorization'), false);

    const restored = restoreComplaintFormData(entries);
    assert.equal(restored.get('title'), 'Overflowing drain');
    assert.equal(restored.get('type'), 'image');
    assert.equal(restored.get('category'), '507f1f77bcf86cd799439011');
    assert.deepEqual(JSON.parse(restored.get('location')), {
        address: 'Central Road',
        coordinates: { lat: 28.61, lng: 77.2 }
    });
    const media = restored.get('media');
    assert.equal(media.type, 'image/png');
    assert.equal(media.name, 'drain.png');
    assert.equal(await media.text(), 'actual-image-bytes');
});

test('incomplete offline complaints are rejected before entering IndexedDB', () => {
    const incomplete = new FormData();
    incomplete.append('description', 'Only a description is not a valid complaint.');
    assert.throws(() => serializeComplaintFormData(incomplete), /title, type, location, category/);
});

test('service worker contains no development precache paths or credential-bearing sync implementation', async () => {
    const source = await readFile(new URL('../public/service-worker.js', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /['"]\/src\//);
    assert.doesNotMatch(source, /indexedDB|JSON\.stringify\(complaint\.body\)|complaint\.headers/);
    assert.match(source, /self\.__PRECACHE_MANIFEST/);
    assert.match(source, /SYNC_REQUESTED/);
});

test('build precaches only the static application shell, not lazy page resources', async () => {
    const config = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8');

    assert.match(config, /item\.isEntry/);
    assert.match(config, /item\.imports\.forEach\(visitChunk\)/);
    assert.doesNotMatch(config, /const generatedAssets = Object\.keys\(bundle\)/);
});

test('version 1 credential-bearing queue is removed during the IndexedDB upgrade', async () => {
    const source = await readFile(new URL('../src/js/utils/pwa.js', import.meta.url), 'utf8');
    assert.match(source, /indexedDB\.open\('meri-shikayat-offline', 2\)/);
    assert.match(source, /db\.deleteObjectStore\('complaints'\)/);
    const queueWriter = source.slice(
        source.lastIndexOf('\n    addComplaintToDB('),
        source.lastIndexOf('\n    getAllOfflineComplaints(')
    );
    assert.match(queueWriter, /entries/);
    assert.doesNotMatch(queueWriter, /token|Authorization|headers/);
});

test('queue flush uses current authentication and sends restored multipart data', async t => {
    const originalWindow = globalThis.window;
    const originalNavigator = globalThis.navigator;
    const originalLocalStorage = globalThis.localStorage;
    globalThis.window = { indexedDB: {} };
    Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: { onLine: true }
    });
    globalThis.localStorage = { getItem: key => key === 'token' ? 'current-token' : null };
    t.after(() => {
        globalThis.window = originalWindow;
        Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originalNavigator });
        globalThis.localStorage = originalLocalStorage;
    });

    const queued = { id: 'queue-1', entries: serializeComplaintFormData(completeComplaint()) };
    const deleted = [];
    const manager = new PWAManager();
    manager.openDB = async () => ({ close() {} });
    manager.getAllOfflineComplaints = async () => [queued];
    manager.deleteOfflineComplaint = async (db, id) => deleted.push(id);

    let request;
    const result = await manager.flushOfflineComplaints(async (url, options) => {
        request = { url, options };
        return { ok: true, status: 201 };
    });

    assert.equal(request.options.headers.Authorization, 'Bearer current-token');
    assert.equal(request.options.headers['Content-Type'], undefined);
    assert.equal(request.options.body.get('title'), 'Overflowing drain');
    assert.equal(await request.options.body.get('media').text(), 'actual-image-bytes');
    assert.deepEqual(deleted, ['queue-1']);
    assert.deepEqual(result, { synced: 1, pending: false });
});
