import express from 'express';
import {
    getAllContractors,
    getContractorById,
    getContractorStatistics
} from '../controllers/contractorsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllContractors);
router.get('/:id', getContractorById);
router.get('/:id/statistics', getContractorStatistics);

export default router;
