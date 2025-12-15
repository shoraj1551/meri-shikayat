/**
 * Social Service
 * Connect to backend social endpoints
 */

import { authService } from './auth.service.js';

const API_URL = 'http://localhost:5000/api';

function getHeaders() {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const socialService = {
    async searchUsers(query) {
        const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Search failed');
        return data;
    },

    async getRecommendedUsers() {
        const response = await fetch(`${API_URL}/users/recommended`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get recommendations');
        return data;
    },

    async sendConnectionRequest(recipientId, type) {
        const response = await fetch(`${API_URL}/connections/request`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ recipientId, type })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send request');
        return data;
    },

    async getMyNetwork() {
        const response = await fetch(`${API_URL}/connections/my-network`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get network');
        return data;
    },

    async sendMessage(recipientId, content) {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ recipientId, content })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send message');
        return data;
    },

    async getConversation(userId) {
        const response = await fetch(`${API_URL}/messages/${userId}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get conversation');
        return data;
    },

    async getInbox() {
        const response = await fetch(`${API_URL}/messages/inbox`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get inbox');
        return data;
    }
};
