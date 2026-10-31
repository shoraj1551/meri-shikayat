/**
 * Social Service
 * Connect to backend social endpoints
 */

import { authService } from './auth.service.js';
import { apiUrl } from '../config/api.js';

function getHeaders() {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const socialService = {
    async searchUsers(query) {
        const response = await fetch(`${apiUrl('/social/users/search')}?q=${encodeURIComponent(query)}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Search failed');
        return data;
    },

    async getRecommendedUsers() {
        const response = await fetch(apiUrl('/social/users/recommended'), {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get recommendations');
        return data;
    },

    async sendConnectionRequest(recipientId, type) {
        const response = await fetch(apiUrl('/social/connections/request'), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ recipientId, type })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send request');
        return data;
    },

    async getMyNetwork() {
        const response = await fetch(apiUrl('/social/connections/my-network'), {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get network');
        return data;
    },

    async sendMessage(recipientId, content) {
        const response = await fetch(apiUrl('/social/messages'), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ recipientId, content })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send message');
        return data;
    },

    async getConversation(userId) {
        const response = await fetch(apiUrl(`/social/messages/${userId}`), {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get conversation');
        return data;
    },

    async getInbox() {
        const response = await fetch(apiUrl('/social/messages/inbox'), {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to get inbox');
        return data;
    }
};
