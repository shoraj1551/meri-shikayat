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
import { protectAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/auth/register', registerAdmin);
router.post('/auth/login', loginAdmin);
router.post('/auth/verify-otp', verifyAdminOtp);

// Protected routes
router.get('/auth/me', protectAdmin, getMe);
router.get('/stats', protectAdmin, getDashboardStats);

// Permission management (Admin)
router.post('/request-permissions', protectAdmin, requestPermissions);

// Super Admin routes
router.get('/pending', protectAdmin, requireSuperAdmin, getPendingAdmins);
router.put('/approve/:id', protectAdmin, requireSuperAdmin, approveAdmin);
router.put('/reject/:id', protectAdmin, requireSuperAdmin, rejectAdmin);

router.get('/permission-requests', protectAdmin, requireSuperAdmin, getPermissionRequests);
router.put('/permission-requests/:id/approve', protectAdmin, requireSuperAdmin, approvePermissionRequest);
router.put('/permission-requests/:id/reject', protectAdmin, requireSuperAdmin, rejectPermissionRequest);

// Complaint management routes
router.get('/complaints', protectAdmin, getComplaints);
router.get('/complaints/:id', protectAdmin, getComplaintById);
router.put('/complaints/:id/status', protectAdmin, updateComplaintStatus);
router.put('/complaints/:id/assign', protectAdmin, assignComplaint);
router.post('/complaints/:id/notes', protectAdmin, addInternalNote);
router.put('/complaints/:id/priority', protectAdmin, updateComplaintPriority);

export default router;
