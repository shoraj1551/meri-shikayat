/**
 * Location controller
 */

import User from '../models/User.js';
import axios from 'axios';

// @desc    Get location by pincode
// @route   GET /api/location/pincode/:pincode
// @access  Public
export const getLocationByPincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        // Validate pincode format
        if (!/^[0-9]{6}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit pincode'
            });
        }

        // Use India Post API
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

        if (response.data && response.data[0].Status === 'Success') {
            const postOffice = response.data[0].PostOffice[0];

            res.status(200).json({
                success: true,
                data: {
                    pincode: pincode,
                    village: postOffice.Name,
                    city: postOffice.Block || postOffice.Division,
                    district: postOffice.District,
                    state: postOffice.State,
                    country: postOffice.Country
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No location found for this pincode'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching location data',
            error: error.message
        });
    }
};

// @desc    Reverse geocode coordinates to address
// @route   POST /api/location/reverse-geocode
// @access  Public
export const reverseGeocode = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Use Nominatim (OpenStreetMap) for reverse geocoding
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'MeriShikayat/1.0'
                }
            }
        );

        if (response.data && response.data.address) {
            const addr = response.data.address;

            res.status(200).json({
                success: true,
                data: {
                    village: addr.village || addr.suburb || addr.neighbourhood,
                    city: addr.city || addr.town || addr.municipality,
                    district: addr.state_district || addr.county,
                    state: addr.state,
                    country: addr.country,
                    pincode: addr.postcode,
                    coordinates: {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude)
                    }
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No address found for these coordinates'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching address data',
            error: error.message
        });
    }
};

// @desc    Search locations
// @route   GET /api/location/search?query=:query
// @access  Public
export const searchLocations = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        // Use Nominatim for location search
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},India&addressdetails=1&limit=10`,
            {
                headers: {
                    'User-Agent': 'MeriShikayat/1.0'
                }
            }
        );

        if (response.data && response.data.length > 0) {
            const results = response.data.map(item => ({
                displayName: item.display_name,
                village: item.address.village || item.address.suburb,
                city: item.address.city || item.address.town,
                district: item.address.state_district || item.address.county,
                state: item.address.state,
                country: item.address.country,
                pincode: item.address.postcode,
                coordinates: {
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon)
                }
            }));

            res.status(200).json({
                success: true,
                data: results
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No locations found matching your search'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching locations',
            error: error.message
        });
    }
};

// @desc    Update user location
// @route   PUT /api/location/user
// @access  Private
export const updateUserLocation = async (req, res) => {
    try {
        const { pincode, village, city, district, state, country, coordinates } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update location
        user.location = {
            pincode,
            village,
            city,
            district,
            state,
            country: country || 'India',
            coordinates
        };
        user.isLocationSet = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: {
                location: user.location,
                isLocationSet: user.isLocationSet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};
