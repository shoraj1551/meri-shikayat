import express from 'express';
import { subscribe, sendTestNotification } from '../controllers/notification.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (authenticated)
router.post('/subscribe', protect, subscribe);

// Admin routes
router.post('/send-test', protect, authorize('admin', 'super_admin'), sendTestNotification);

export default router;
