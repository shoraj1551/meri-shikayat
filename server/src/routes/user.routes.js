/**
 * User routes
 */

import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// User profile routes can be added here as needed
// Example:
// router.get('/profile', getUserProfile);
// router.put('/profile', updateUserProfile);

export default router;
