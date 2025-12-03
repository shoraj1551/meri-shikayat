/**
 * API client for making HTTP requests to the backend
 */

import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Check if this is an admin or user
            const isAdmin = localStorage.getItem('adminToken') || window.location.pathname.startsWith('/admin');

            if (isAdmin) {
                // Clear admin auth data
                localStorage.removeItem('adminToken');
                localStorage.removeItem('admin');
                // Redirect to admin login
                if (window.location.pathname !== '/admin/login') {
                    window.location.href = '/admin/login';
                }
            } else {
                // Clear user auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to user login
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
