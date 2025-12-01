/**
 * Complaint routes
 */

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';
import {
    createComplaint,
    getComplaints,
    getComplaint,
    updateComplaint,
    deleteComplaint,
    addComment
} from '../controllers/complaint.controller.js';
import { complaintValidation, validate } from '../utils/validators.js';

const router = express.Router();

router.post('/', protect, uploadFields, complaintValidation, validate, createComplaint);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaint);
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);
router.post('/:id/comments', protect, addComment);

export default router;

