/**
 * User Service
 * API calls for user profile management
 */

import apiClient from './client.js';

const API_BASE = '/api/users';

/**
 * Get current user profile
 */
export const getUserProfile = async () => {
    const response = await apiClient.get(`${API_BASE}/profile`);
    return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
    const response = await apiClient.put(`${API_BASE}/profile`, profileData);
    return response.data;
};

/**
 * Change password
 */
export const changePassword = async (currentPassword, newPassword) => {
    const response = await apiClient.put(`${API_BASE}/password`, {
        currentPassword,
        newPassword
    });
    return response.data;
};

/**
 * Update location
 */
export const updateLocation = async (locationData) => {
    const response = await apiClient.put(`${API_BASE}/location`, locationData);
    return response.data;
};
