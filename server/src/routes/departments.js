import express from 'express';
import {
    getAllDepartments,
    getDepartmentByCode,
    getDepartmentOffices,
    getDepartmentStatistics
} from '../controllers/departmentsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllDepartments);
router.get('/:code', getDepartmentByCode);
router.get('/:code/offices', getDepartmentOffices);
router.get('/:code/statistics', getDepartmentStatistics);

export default router;
