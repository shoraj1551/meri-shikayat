import webpush from 'web-push';
import mongoose from 'mongoose';
import User from '../models/User.js';

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@example.com';
const pushConfigured = Boolean(publicVapidKey && privateVapidKey);

if (pushConfigured) {
    webpush.setVapidDetails(mailto, publicVapidKey, privateVapidKey);
} else {
    console.warn('⚠️ Web Push keys are missing. Push notifications will not work until VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set.');
}

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

const normalizeSubscription = value => {
    if (!value || typeof value !== 'object') return null;
    let endpoint;
    try {
        endpoint = new URL(value.endpoint);
    } catch {
        return null;
    }
    const p256dh = value.keys?.p256dh;
    const auth = value.keys?.auth;
    if (endpoint.protocol !== 'https:' || endpoint.href.length > 2048 ||
        typeof p256dh !== 'string' || p256dh.length < 16 || p256dh.length > 512 || !BASE64URL_PATTERN.test(p256dh) ||
        typeof auth !== 'string' || auth.length < 8 || auth.length > 512 || !BASE64URL_PATTERN.test(auth)) {
        return null;
    }
    return {
        endpoint: endpoint.href,
        expirationTime: Number.isFinite(value.expirationTime) ? value.expirationTime : null,
        keys: { p256dh, auth }
    };
};

export const getPublicKey = (req, res) => {
    if (!pushConfigured) {
        return res.status(503).json({ success: false, message: 'Push notifications are not configured' });
    }
    res.set('Cache-Control', 'public, max-age=3600').json({ success: true, data: { publicKey: publicVapidKey } });
};

/**
 * Subscribe a user to Push Notifications
 * POST /api/v1/notifications/subscribe
 */
export const subscribe = async (req, res) => {
    try {
        const subscription = normalizeSubscription(req.body);
        const userId = req.user.id; // From auth middleware

        if (!subscription) {
            return res.status(400).json({ success: false, message: 'Invalid push subscription' });
        }

        const user = await User.findByIdAndUpdate(userId, {
            $set: { pushSubscription: subscription }
        }, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(201).json({ success: true, message: 'Push subscription saved' });
    } catch (error) {
        console.error('Error saving push subscription:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};

export const unsubscribe = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { $unset: { pushSubscription: 1 } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'Push subscription removed' });
    } catch (error) {
        console.error('Error removing push subscription:', error);
        res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
    }
};

/**
 * Send a test notification (Admin only)
 * POST /api/v1/notifications/send-test
 */
export const sendTestNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        if (!pushConfigured) {
            return res.status(503).json({ success: false, message: 'Push notifications are not configured' });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId).select('+pushSubscription');
        if (!user || !user.pushSubscription) {
            return res.status(404).json({ error: 'User not found or not subscribed' });
        }

        const payload = JSON.stringify({
            title: title || 'Test Notification',
            body: message || 'This is a test notification from Meri Shikayat',
            url: '/'
        });

        await webpush.sendNotification(user.pushSubscription, payload);
        res.status(200).json({ success: true, message: 'Notification sent' });

    } catch (error) {
        if ([404, 410].includes(error.statusCode) && req.body?.userId) {
            await User.findByIdAndUpdate(req.body.userId, { $unset: { pushSubscription: 1 } }).catch(() => {});
        }
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
};

/**
 * Internal helper to send notification
 */
export const sendNotificationToUser = async (userId, payload) => {
    if (!pushConfigured) return false;
    try {
        const user = await User.findById(userId).select('+pushSubscription');
        if (user && user.pushSubscription) {
            await webpush.sendNotification(user.pushSubscription, JSON.stringify(payload));
            return true;
        }
    } catch (error) {
        if ([404, 410].includes(error.statusCode)) {
            await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } }).catch(() => {});
        }
        console.error(`Failed to send push to user ${userId}:`, error);
    }
    return false;
};
