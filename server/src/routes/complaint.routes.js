import express from 'express';
import { createComplaint, getMyComplaints, getNearbyComplaints } from '../controllers/complaint.controller.js';
import { createGuestComplaint, searchComplaintById, claimGuestComplaint } from '../controllers/guest-complaint.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes (no authentication)
router.post('/guest', upload.single('media'), createGuestComplaint);
router.get('/search/:complaintId', searchComplaintById);

// Protected routes
router.use(protect);

router.post('/', upload.single('media'), createComplaint);
router.get('/my-complaints', getMyComplaints);
router.get('/nearby', getNearbyComplaints);
router.post('/:complaintId/claim', claimGuestComplaint);

export default router;
