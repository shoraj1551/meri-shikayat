/**
 * Profile Routes
 * API endpoints for user profile management
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.middleware.js';
import * as profileController from '../controllers/profile.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ========================================
// PROFILE CRUD
// ========================================

// Get user profile
router.get('/', profileController.getProfile);

// Update profile sections
router.patch('/personal', profileController.updatePersonalInfo);
router.patch('/education', profileController.updateEducation);
router.patch('/work', profileController.updateWork);
router.patch('/social', profileController.updateSocialLinks);
router.patch('/preferences', profileController.updatePreferences);

// ========================================
// PROFILE PICTURE
// ========================================

// Upload profile picture
router.post('/picture', upload.single('profilePicture'), profileController.uploadProfilePicture);

// Delete profile picture
router.delete('/picture', profileController.deleteProfilePicture);

// ========================================
// STATS & BADGES
// ========================================

// Get user statistics
router.get('/stats', profileController.getStats);

// Get user badges
router.get('/badges', profileController.getBadges);

// ========================================
// VERIFICATION
// ========================================

// Send email verification
router.post('/verify-email', profileController.sendEmailVerification);

// Verify email with token
router.get('/verify-email/:token', profileController.verifyEmail);

// Send phone verification
router.post('/verify-phone', profileController.sendPhoneVerification);

// Verify phone with OTP
router.post('/verify-phone/confirm', profileController.verifyPhone);

export default router;
