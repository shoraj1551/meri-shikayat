/**
 * Social Routes
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import * as socialController from '../controllers/social.controller.js';

const router = express.Router();

router.use(protect); // All routes require login

// Discovery
router.get('/users/search', socialController.searchUsers);
router.get('/users/recommended', socialController.getRecommendedUsers);

// Connections
router.post('/connections/request', socialController.sendConnectionRequest);
router.put('/connections/respond', socialController.respondToRequest);
router.get('/connections/my-network', socialController.getMyNetwork);

// Messaging
router.post('/messages', socialController.sendMessage);
router.get('/messages/inbox', socialController.getInbox);
router.get('/messages/:userId', socialController.getConversation);

export default router;
