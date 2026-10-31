import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import webpush from 'web-push';
import User from '../../src/models/User.js';

const vapid = webpush.generateVAPIDKeys();
process.env.VAPID_PUBLIC_KEY = vapid.publicKey;
process.env.VAPID_PRIVATE_KEY = vapid.privateKey;
process.env.VAPID_MAILTO = 'mailto:test@example.test';

const controller = await import('../../src/controllers/notification.controller.js');
const { default: router } = await import('../../src/routes/notification.routes.js');

function responseRecorder() {
    return {
        statusCode: 200,
        body: undefined,
        headers: {},
        set(name, value) { this.headers[name.toLowerCase()] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
}

const validSubscription = {
    endpoint: 'https://push.example.test/send/subscription-id',
    expirationTime: null,
    keys: {
        p256dh: 'A'.repeat(87),
        auth: 'B'.repeat(22)
    }
};

test('User schema persists a private, validated push subscription', async () => {
    const user = new User({
        firstName: 'Push', lastName: 'User', email: 'push@example.test',
        password: 'StrongPass1!', userType: 'general_user', pushSubscription: validSubscription
    });
    await user.validate();
    assert.equal(user.pushSubscription.endpoint, validSubscription.endpoint);
    assert.equal(User.schema.path('pushSubscription').options.select, false);
});

test('subscription controller validates and persists the complete browser subscription', async () => {
    const original = User.findByIdAndUpdate;
    let update;
    let options;
    User.findByIdAndUpdate = async (id, value, config) => {
        assert.equal(id, 'user-id');
        update = value;
        options = config;
        return { _id: id };
    };
    try {
        const res = responseRecorder();
        await controller.subscribe({ user: { id: 'user-id' }, body: validSubscription }, res);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(update.$set.pushSubscription, validSubscription);
        assert.deepEqual(options, { new: true, runValidators: true });
    } finally {
        User.findByIdAndUpdate = original;
    }
});

test('subscription controller rejects malformed endpoint/key data before a database write', async () => {
    const original = User.findByIdAndUpdate;
    let writes = 0;
    User.findByIdAndUpdate = async () => { writes += 1; };
    try {
        const res = responseRecorder();
        await controller.subscribe({
            user: { id: 'user-id' },
            body: { endpoint: 'http://localhost/push', keys: { p256dh: 'short', auth: 'short' } }
        }, res);
        assert.equal(res.statusCode, 400);
        assert.equal(writes, 0);
    } finally {
        User.findByIdAndUpdate = original;
    }
});

test('test notification route authenticates canonical Admin and requires systemSettings', () => {
    const route = router.stack.find(layer => layer.route?.path === '/send-test').route;
    assert.deepEqual(route.stack.map(layer => layer.handle.name), [
        'protectAdmin', 'permissionGuard', 'sendTestNotification'
    ]);
    assert.equal(route.stack[1].handle.requiredPermission, 'systemSettings');
});

test('public key endpoint returns the key paired with server delivery configuration', () => {
    const res = responseRecorder();
    controller.getPublicKey({}, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.publicKey, vapid.publicKey);
});

test('authorized test delivery loads the private subscription and calls Web Push', async () => {
    const originalFindById = User.findById;
    const originalSend = webpush.sendNotification;
    let selected;
    let delivered;
    User.findById = id => ({
        select: async field => {
            selected = { id, field };
            return { pushSubscription: validSubscription };
        }
    });
    webpush.sendNotification = async (subscription, payload) => {
        delivered = { subscription, payload: JSON.parse(payload) };
    };
    try {
        const res = responseRecorder();
        const userId = new User.base.Types.ObjectId().toString();
        await controller.sendTestNotification({ body: { userId, title: 'Status update', message: 'Resolved' } }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(selected, { id: userId, field: '+pushSubscription' });
        assert.deepEqual(delivered.subscription, validSubscription);
        assert.deepEqual(delivered.payload, { title: 'Status update', body: 'Resolved', url: '/' });
    } finally {
        User.findById = originalFindById;
        webpush.sendNotification = originalSend;
    }
});

test('client requests server VAPID key, invokes subscription, and service worker handles push safely', async () => {
    const pwaSource = await readFile(new URL('../../../client/src/js/utils/pwa.js', import.meta.url), 'utf8');
    const profileSource = await readFile(new URL('../../../client/src/js/pages/profile.js', import.meta.url), 'utf8');
    const workerSource = await readFile(new URL('../../../client/public/service-worker.js', import.meta.url), 'utf8');
    assert.match(pwaSource, /notifications\/public-key/);
    assert.match(pwaSource, /unsubscribeFromPush/);
    assert.match(profileSource, /requestNotificationPermission[\s\S]*subscribeToPush/);
    assert.match(profileSource, /input\[type="checkbox"\]\[name\]/);
    assert.match(workerSource, /addEventListener\('push'/);
    assert.match(workerSource, /showNotification/);
    assert.match(workerSource, /requested\.origin === self\.location\.origin/);
});
