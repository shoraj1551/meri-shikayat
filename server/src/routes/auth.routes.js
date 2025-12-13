/**
 * Authentication routes
 */

import express from 'express';
import { register, login, getMe, logout, refreshAccessToken } from '../controllers/auth.controller.js';
import { requestPasswordReset, verifyResetOTP, resetPassword } from '../controllers/password.controller.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../utils/validators.js';
import {
    loginLimiter,
    registerLimiter,
    forgotPasswordLimiter,
    otpVerifyLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerLimiter, registerValidation, validate, register);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshAccessToken);

// Password reset routes
router.post('/forgot-password', forgotPasswordLimiter, requestPasswordReset);
router.post('/verify-reset-otp', otpVerifyLimiter, verifyResetOTP);
router.post('/reset-password', resetPassword);

export default router;

