/**
 * Profile Service - API calls for user profile management
 */

const API_URL = 'http://localhost:5000/api';

export const profileService = {
    /**
     * Get user profile
     */
    async getProfile() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        return data.data || data;
    },

    /**
     * Update profile section
     */
    async updateProfile(section, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/${section}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        return await response.json();
    },

    /**
     * Upload profile picture
     */
    async uploadProfilePicture(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type for FormData - browser will set it with boundary
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload picture');
        }

        return await response.json();
    },

    /**
     * Delete profile picture
     */
    async deleteProfilePicture() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/picture`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete picture');
        }

        return await response.json();
    },

    /**
     * Get user statistics
     */
    async getStats() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch stats');
        }

        return await response.json();
    },

    /**
     * Get user badges
     */
    async getBadges() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/badges`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch badges');
        }

        return await response.json();
    },

    /**
     * Send email verification
     */
    async sendEmailVerification() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/verify-email`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send verification email');
        }

        return await response.json();
    },

    /**
     * Send phone verification
     */
    async sendPhoneVerification() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profile/verify-phone`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send verification SMS');
        }

        return await response.json();
    }
};
