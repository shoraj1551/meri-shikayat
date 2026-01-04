/**
 * Category Routes
 * Public routes for fetching complaint categories
 */

import express from 'express';
import { getCategories, getCategoryById } from '../controllers/category.controller.js';
import { readRateLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', readRateLimiter, getCategories);
router.get('/:id', readRateLimiter, getCategoryById);

export default router;
