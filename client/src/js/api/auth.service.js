/**
 * Authentication API service
 */

import apiClient from './client.js';

export const authService = {
    /**
     * Register a new user
     */
    async register(userData) {
        const response = await apiClient.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    /**
     * Login user
     */
    async login(identifier, password, userType = null) {
        const credentials = { identifier, password };
        if (userType) {
            credentials.userType = userType;
        }
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    /**
     * Logout user
     */
    async logout() {
        localStorage.removeItem('token');
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};
