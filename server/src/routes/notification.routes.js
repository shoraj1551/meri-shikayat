import express from 'express';
import { getPublicKey, subscribe, unsubscribe, sendTestNotification } from '../controllers/notification.controller.js';
import { protect, protectAdmin, requirePermission } from '../middleware/auth.js';

const router = express.Router();

router.get('/public-key', getPublicKey);

// User subscription routes
router.post('/subscribe', protect, subscribe);
router.delete('/subscribe', protect, unsubscribe);

// Administrator routes use the canonical Admin identity and permission system.
router.post('/send-test', protectAdmin, requirePermission('systemSettings'), sendTestNotification);

export default router;
