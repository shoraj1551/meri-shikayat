import apiClient from './client.js';

export const complaintService = {
    /**
     * Create a new complaint
     * @param {FormData} formData - Complaint data including file
     * @returns {Promise<Object>} Response data
     */
    async createComplaint(formData) {
        // Content-Type header is automatically set to multipart/form-data by axios when data is FormData
        const response = await apiClient.post('/complaints', formData);
        return response.data;
    },

    /**
     * Get all complaints for the current user
     * @returns {Promise<Object>} Response data
     */
    async getMyComplaints() {
        const response = await apiClient.get('/complaints/my-complaints');
        return response.data;
    }
};
