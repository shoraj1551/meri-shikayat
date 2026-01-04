/**
 * Authentication routes
 */

import express from 'express';
import { register, login, getMe, logout, refreshAccessToken } from '../controllers/auth.controller.js';
import { requestPasswordReset, verifyResetOTP, resetPassword } from '../controllers/password.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
    registerSchema,
    loginSchema,
    passwordResetRequestSchema,
    otpVerificationSchema,
    passwordResetSchema
} from '../validators/auth.validator.js';
import {
    authRateLimiter,
    passwordResetRateLimiter
} from '../middleware/rateLimiting.js';

const router = express.Router();

// Authentication routes with strict rate limiting and validation
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', authRateLimiter, refreshAccessToken);

// Password reset routes with strict rate limiting and validation
router.post('/forgot-password', passwordResetRateLimiter, validate(passwordResetRequestSchema), requestPasswordReset);
router.post('/verify-reset-otp', passwordResetRateLimiter, validate(otpVerificationSchema), verifyResetOTP);
router.post('/reset-password', passwordResetRateLimiter, validate(passwordResetSchema), resetPassword);

export default router;

