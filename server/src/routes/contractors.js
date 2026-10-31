import express from 'express';
import {
    getAllContractors,
    getContractorById,
    getContractorStatistics,
    getMyContractorDashboard
} from '../controllers/contractorsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllContractors);
router.get('/dashboard/me', protect, getMyContractorDashboard);
router.get('/:id', getContractorById);
router.get('/:id/statistics', getContractorStatistics);

export default router;
