import webpush from 'web-push';
import User from '../models/user.model.js';

// Configure Web Push (using placeholders if env vars missing)
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'PLACEHOLDER_VAPID_PUBLIC_KEY';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'PLACEHOLDER_VAPID_PRIVATE_KEY';
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@example.com';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(mailto, publicVapidKey, privateVapidKey);
} else {
    console.warn('⚠️ Web Push keys are missing. Push notifications will not work until VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY are set.');
}

/**
 * Subscribe a user to Push Notifications
 * POST /api/v1/notifications/subscribe
 */
export const subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        const userId = req.user.id; // From auth middleware

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        // Save subscription to user profile
        // Assuming User model has a pushSubscription field. 
        // If not, we should probably add it, or store in a separate collection.
        // For now, let's assume we can store it in the user document.

        await User.findByIdAndUpdate(userId, {
            $set: { pushSubscription: subscription }
        });

        res.status(201).json({ message: 'Push subscription saved' });
    } catch (error) {
        console.error('Error saving push subscription:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};

/**
 * Send a test notification (Admin only)
 * POST /api/v1/notifications/send-test
 */
export const sendTestNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.pushSubscription) {
            return res.status(404).json({ error: 'User not found or not subscribed' });
        }

        const payload = JSON.stringify({
            title: title || 'Test Notification',
            body: message || 'This is a test notification from Meri Shikayat',
            url: '/'
        });

        await webpush.sendNotification(user.pushSubscription, payload);
        res.status(200).json({ message: 'Notification sent' });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
};

/**
 * Internal helper to send notification
 */
export const sendNotificationToUser = async (userId, payload) => {
    try {
        const user = await User.findById(userId);
        if (user && user.pushSubscription) {
            await webpush.sendNotification(user.pushSubscription, JSON.stringify(payload));
            return true;
        }
    } catch (error) {
        console.error(`Failed to send push to user ${userId}:`, error);
    }
    return false;
};
