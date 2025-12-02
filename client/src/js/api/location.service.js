/**
 * Location API service
 */

import apiClient from './client.js';

export const locationService = {
    /**
     * Get location by pincode
     */
    async getLocationByPincode(pincode) {
        const response = await apiClient.get(`/location/pincode/${pincode}`);
        return response.data;
    },

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(latitude, longitude) {
        const response = await apiClient.post('/location/reverse-geocode', {
            latitude,
            longitude
        });
        return response.data;
    },

    /**
     * Search locations
     */
    async searchLocations(query) {
        const response = await apiClient.get(`/location/search?query=${encodeURIComponent(query)}`);
        return response.data;
    },

    /**
     * Update user location
     */
    async updateUserLocation(locationData) {
        const response = await apiClient.put('/location/user', locationData);
        return response.data;
    }
};
