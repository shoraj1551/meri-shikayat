/**
 * Admin Routes
 */

import express from 'express';
import {
    registerAdmin,
    loginAdmin,
    verifyAdminOtp,
    getMe,
    getPendingAdmins,
    approveAdmin,
    rejectAdmin,
    requestPermissions,
    getPermissionRequests,
    approvePermissionRequest,
    rejectPermissionRequest,
    getDashboardStats
} from '../controllers/admin.controller.js';
import {
    getComplaints,
    getComplaintById,
    updateComplaintStatus,
    assignComplaint,
    addInternalNote,
    updateComplaintPriority
} from '../controllers/complaint-admin.controller.js';
import { protectAdmin, requireSuperAdmin, requirePermission } from '../middleware/auth.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiting.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, adminOtpVerificationSchema } from '../validators/auth.validator.js';
import { sanitizePlainTextBody } from '../middleware/plainText.js';

const router = express.Router();

// Public routes
router.post('/auth/register', registerAdmin);
router.post('/auth/login', otpRateLimiter, validate(loginSchema), loginAdmin);
router.post('/auth/verify-otp', authRateLimiter, validate(adminOtpVerificationSchema), verifyAdminOtp);

// Protected routes
router.get('/auth/me', protectAdmin, getMe);
router.get('/stats', protectAdmin, getDashboardStats);

// Permission management (Admin)
router.post('/request-permissions', protectAdmin, sanitizePlainTextBody, requestPermissions);

// Super Admin routes
router.get('/pending', protectAdmin, requireSuperAdmin, getPendingAdmins);
router.put('/approve/:id', protectAdmin, requireSuperAdmin, approveAdmin);
router.put('/reject/:id', protectAdmin, requireSuperAdmin, rejectAdmin);

router.get('/permission-requests', protectAdmin, requireSuperAdmin, getPermissionRequests);
router.put('/permission-requests/:id/approve', protectAdmin, requireSuperAdmin, approvePermissionRequest);
router.put('/permission-requests/:id/reject', protectAdmin, requireSuperAdmin, rejectPermissionRequest);

// Complaint management routes
router.get('/complaints', protectAdmin, requirePermission('viewComplaints'), getComplaints);
router.get('/complaints/:id', protectAdmin, requirePermission('viewComplaints'), getComplaintById);
router.put('/complaints/:id/status', protectAdmin, requirePermission('editComplaints'), updateComplaintStatus);
router.put('/complaints/:id/assign', protectAdmin, requirePermission('editComplaints'), assignComplaint);
router.post('/complaints/:id/notes', protectAdmin, requirePermission('editComplaints'), addInternalNote);
router.put('/complaints/:id/priority', protectAdmin, requirePermission('editComplaints'), updateComplaintPriority);

export default router;
