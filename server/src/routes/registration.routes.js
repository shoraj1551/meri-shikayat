/**
 * Multi-Role Registration Routes
 */

import express from 'express';
import {
    registerGeneralUser,
    registerAdmin,
    registerContractor,
    registerSuperAdmin
} from '../controllers/registration.controller.js';

const router = express.Router();

// General User Registration (Public, Auto-Activated)
router.post('/register/general-user', registerGeneralUser);

// Admin Registration (Public, Requires Approval)
router.post('/register/admin', registerAdmin);

// Contractor Registration (Public, Requires Verification)
router.post('/register/contractor', registerContractor);

// Super Admin Registration (Invitation Only)
router.post('/register/super-admin', registerSuperAdmin);

export default router;
