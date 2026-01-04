import express from 'express';
import { createComplaint, getMyComplaints, getNearbyComplaints } from '../controllers/complaint.controller.js';
import { createGuestComplaint, searchComplaintById, claimGuestComplaint } from '../controllers/guest-complaint.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validateUploadedFile } from '../middleware/fileValidation.js';
import { uploadRateLimiter, readRateLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

// Public routes (no authentication) with rate limiting and file validation
router.post('/guest', uploadRateLimiter, upload.single('media'), validateUploadedFile, createGuestComplaint);
router.get('/search/:complaintId', readRateLimiter, searchComplaintById);

// Protected routes
router.use(protect);

router.post('/', uploadRateLimiter, upload.single('media'), validateUploadedFile, createComplaint);
router.get('/my-complaints', readRateLimiter, getMyComplaints);
router.get('/nearby', readRateLimiter, getNearbyComplaints);
router.post('/:complaintId/claim', claimGuestComplaint);

export default router;
