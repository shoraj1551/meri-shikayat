/**
 * User Routes
 * Handles user profile management
 */

import express from 'express';
import {
    updateProfile,
    changePassword,
    updateLocation
} from '../controllers/user.controller.js';
import { getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get current user profile (reusing auth controller function)
router.get('/profile', getMe);

// Update profile details
router.put('/profile', updateProfile);

// Change password
router.put('/password', changePassword);

// Update location
router.put('/location', updateLocation);

export default router;
