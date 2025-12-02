/**
 * Location routes
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getLocationByPincode,
    reverseGeocode,
    searchLocations,
    updateUserLocation
} from '../controllers/location.controller.js';

const router = express.Router();

router.get('/pincode/:pincode', getLocationByPincode);
router.post('/reverse-geocode', reverseGeocode);
router.get('/search', searchLocations);
router.put('/user', protect, updateUserLocation);

export default router;
