/**
 * Stories / Hype Engine Routes
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import * as storiesController from '../controllers/stories.controller.js';

const router = express.Router();

router.use(protect);

router.get('/feed', storiesController.getStoriesFeed);
router.put('/:id/hype', storiesController.toggleHype);
router.post('/:id/comment', storiesController.addComment);
router.put('/:id/share', storiesController.trackShare);

export default router;
