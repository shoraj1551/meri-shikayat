import { authService } from './auth.service.js';

const API_URL = 'http://localhost:5000/api/stories';

function getHeaders() {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const storiesService = {
    async getFeed(page = 1) {
        const response = await fetch(`${API_URL}/feed?page=${page}`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    async toggleHype(id) {
        const response = await fetch(`${API_URL}/${id}/hype`, {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = await response.json();
        return data;
    },

    async addComment(id, text) {
        const response = await fetch(`${API_URL}/${id}/comment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    async trackShare(id) {
        await fetch(`${API_URL}/${id}/share`, {
            method: 'PUT',
            headers: getHeaders()
        });
    }
};
