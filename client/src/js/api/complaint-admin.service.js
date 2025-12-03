/**
 * Admin Service - Complaint Management
 * API calls for admin complaint operations
 */

import apiClient from './client.js';

const API_BASE = '/api/admin';

/**
 * Get all complaints with filters and pagination
 */
export const getComplaints = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiClient.get(`${API_BASE}/complaints?${params}`);
    return response.data;
};

/**
 * Get single complaint details
 */
export const getComplaintById = async (id) => {
    const response = await apiClient.get(`${API_BASE}/complaints/${id}`);
    return response.data;
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (id, status, reason) => {
    const response = await apiClient.put(`${API_BASE}/complaints/${id}/status`, {
        status,
        reason
    });
    return response.data;
};

/**
 * Assign complaint to admin
 */
export const assignComplaint = async (id, assignedTo, reason) => {
    const response = await apiClient.put(`${API_BASE}/complaints/${id}/assign`, {
        assignedTo,
        reason
    });
    return response.data;
};

/**
 * Add internal note to complaint
 */
export const addInternalNote = async (id, note) => {
    const response = await apiClient.post(`${API_BASE}/complaints/${id}/notes`, {
        note
    });
    return response.data;
};

/**
 * Update complaint priority
 */
export const updateComplaintPriority = async (id, priority) => {
    const response = await apiClient.put(`${API_BASE}/complaints/${id}/priority`, {
        priority
    });
    return response.data;
};
