import { it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { integrationHarness } from '../../../test/harness/integration.mjs';
import { api, registration } from '../../../test/harness/fixtures.mjs';
import Category from '../../models/Category.js';
import Complaint from '../../models/Complaint.js';
import User from '../../models/User.js';
import { buildComplaintFormData } from '../../../../client/src/js/pages/file-complaint-new.js';
import PWAManager, { serializeComplaintFormData } from '../../../../client/src/js/utils/pwa.js';

const context = integrationHarness(import.meta.url);
let token;
let category;

beforeEach(async () => {
    category = await Category.create({ name: 'Workflow Roads' });
    const registered = await api(context, 'post', '/auth/register').send(registration()).expect(201);
    token = registered.body.token;
});

it('submits the main browser complaint payload through the mounted multipart API', async () => {
    const form = buildComplaintFormData({
        title: 'Browser pothole report',
        description: 'A deep pothole is blocking the main road.',
        category: category.id,
        customCategory: '', mediaType: null, mediaFile: null
    }, { address: 'Browser Road', coordinates: { lat: 28.61, lng: 77.2 } });

    let request = api(context, 'post', '/complaints').set('Authorization', 'Bearer ' + token);
    for (const [name, value] of form.entries()) request = request.field(name, value);
    const response = await request.expect(201);
    assert.equal(response.body.data.title, 'Browser pothole report');
    assert.equal(String(response.body.data.category), category.id);
});

it('rejects a forged profile image through the complete upload route and persists no profile URL', async () => {
    await api(context, 'post', '/profile/picture')
        .set('Authorization', 'Bearer ' + token)
        .attach('profilePicture', Buffer.from('<script>alert(1)</script>'), {
            filename: 'avatar.png', contentType: 'image/png'
        }).expect(400);
    const user = await User.findOne({ email: 'citizen@example.com' });
    assert.equal(user.profilePicture?.url, undefined);
});

it('persists and removes a browser push subscription through authenticated routes', async () => {
    const subscription = {
        endpoint: 'https://push.example.test/send/integration-subscription',
        expirationTime: null,
        keys: { p256dh: 'A'.repeat(87), auth: 'B'.repeat(22) }
    };
    await api(context, 'post', '/notifications/subscribe')
        .set('Authorization', 'Bearer ' + token).send(subscription).expect(201);
    let user = await User.findOne({ email: 'citizen@example.com' }).select('+pushSubscription');
    assert.equal(user.pushSubscription.endpoint, subscription.endpoint);
    await api(context, 'delete', '/notifications/subscribe')
        .set('Authorization', 'Bearer ' + token).expect(200);
    user = await User.findById(user.id).select('+pushSubscription');
    assert.equal(user.pushSubscription, undefined);
});

it('flushes a queued offline multipart complaint to the real HTTP API using current authentication', async t => {
    const originalWindow = globalThis.window;
    const originalNavigator = globalThis.navigator;
    const originalStorage = globalThis.localStorage;
    globalThis.window = { indexedDB: {} };
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
    globalThis.localStorage = { getItem: key => key === 'token' ? token : null };

    const server = context.app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(async () => {
        await new Promise(resolve => server.close(resolve));
        globalThis.window = originalWindow;
        Object.defineProperty(globalThis, 'navigator', { configurable: true, value: originalNavigator });
        globalThis.localStorage = originalStorage;
    });

    const form = buildComplaintFormData({
        title: 'Offline drain report', description: 'A blocked drain is overflowing near homes.',
        category: category.id, customCategory: '', mediaType: null, mediaFile: null
    }, { address: 'Offline Road', coordinates: { lat: 19.07, lng: 72.87 } });
    const manager = new PWAManager();
    const queued = { id: 'offline-integration', entries: serializeComplaintFormData(form) };
    manager.openDB = async () => ({ close() {} });
    manager.getAllOfflineComplaints = async () => [queued];
    const deleted = [];
    manager.deleteOfflineComplaint = async (_db, id) => deleted.push(id);
    const port = server.address().port;
    const result = await manager.flushOfflineComplaints((url, options) =>
        fetch(`http://127.0.0.1:${port}/api/v1/complaints`, options));

    assert.deepEqual(result, { synced: 1, pending: false });
    assert.deepEqual(deleted, ['offline-integration']);
    assert.ok(await Complaint.findOne({ title: 'Offline drain report' }));
});
