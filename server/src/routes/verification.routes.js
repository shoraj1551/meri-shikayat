/**
 * Verification Routes
 * Routes for email and phone verification
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import { otpRateLimiter } from '../middleware/rateLimiting.js';
import {
    sendEmailOTP,
    verifyEmail,
    sendPhoneOTP,
    verifyPhone,
    getVerificationStatus
} from '../controllers/verification.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Email verification with OTP rate limiting
router.post('/send-email-otp', otpRateLimiter, sendEmailOTP);
router.post('/verify-email', verifyEmail);

// Phone verification with OTP rate limiting
router.post('/send-phone-otp', otpRateLimiter, sendPhoneOTP);
router.post('/verify-phone', verifyPhone);

// Get verification status
router.get('/status', getVerificationStatus);

export default router;
