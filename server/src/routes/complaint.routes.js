import express from 'express';
import { createComplaint, getMyComplaints, getNearbyComplaints } from '../controllers/complaint.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.post('/', upload.single('media'), createComplaint);
router.get('/my-complaints', getMyComplaints);
router.get('/nearby', getNearbyComplaints);

export default router;
