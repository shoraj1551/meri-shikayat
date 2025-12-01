/**
 * Authentication routes
 */

import express from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../utils/validators.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;

