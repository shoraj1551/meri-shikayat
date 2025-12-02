/**
 * Admin Service
 * Handles admin authentication and management API calls
 */

import client from './client.js';

export const adminService = {
    // Auth
    async register(adminData) {
        const response = await client.post('/admin/auth/register', adminData);
        return response.data;
    },

    async login(credentials) {
        const response = await client.post('/admin/auth/login', credentials);
        // If OTP is not required (legacy/fallback), store token immediately
        if (response.data.success && !response.data.requireOtp) {
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('admin', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    async verifyOtp(adminId, otp) {
        const response = await client.post('/admin/auth/verify-otp', { adminId, otp });
        if (response.data.success) {
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('admin', JSON.stringify(response.data.data));
        }
        return response.data;
    },

    async logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        return { success: true };
    },

    async getMe() {
        const response = await client.get('/admin/auth/me');
        return response.data;
    },

    // Admin Management (Super Admin)
    async getPendingAdmins() {
        const response = await client.get('/admin/pending');
        return response.data;
    },

    async approveAdmin(id, data = {}) {
        const response = await client.put(`/admin/approve/${id}`, data);
        return response.data;
    },

    async rejectAdmin(id, reason) {
        const response = await client.put(`/admin/reject/${id}`, { reason });
        return response.data;
    },

    // Permissions
    async requestPermissions(data) {
        const response = await client.post('/admin/request-permissions', data);
        return response.data;
    },

    async getPermissionRequests() {
        const response = await client.get('/admin/permission-requests');
        return response.data;
    },

    async approvePermissionRequest(id) {
        const response = await client.put(`/admin/permission-requests/${id}/approve`);
        return response.data;
    },

    async rejectPermissionRequest(id, notes) {
        const response = await client.put(`/admin/permission-requests/${id}/reject`, { notes });
        return response.data;
    },

    // Helper
    getCurrentAdmin() {
        const adminStr = localStorage.getItem('admin');
        return adminStr ? JSON.parse(adminStr) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('adminToken');
    }
};
