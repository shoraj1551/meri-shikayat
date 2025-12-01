/**
 * Complaint API service
 */

import apiClient from './client.js';

export const complaintService = {
    /**
     * Create a new complaint
     */
    async createComplaint(formData) {
        const response = await apiClient.post('/complaints', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Get all complaints
     */
    async getComplaints(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await apiClient.get(`/complaints?${params}`);
        return response.data;
    },

    /**
     * Get single complaint by ID
     */
    async getComplaint(id) {
        const response = await apiClient.get(`/complaints/${id}`);
        return response.data;
    },

    /**
     * Update complaint
     */
    async updateComplaint(id, data) {
        const response = await apiClient.put(`/complaints/${id}`, data);
        return response.data;
    },

    /**
     * Delete complaint
     */
    async deleteComplaint(id) {
        const response = await apiClient.delete(`/complaints/${id}`);
        return response.data;
    },

    /**
     * Add comment to complaint
     */
    async addComment(id, text) {
        const response = await apiClient.post(`/complaints/${id}/comments`, { text });
        return response.data;
    }
};
