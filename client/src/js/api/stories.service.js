import { apiUrl } from '../config/api.js';

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

export const storiesService = {
    async getImpact() {
        const response = await fetch(apiUrl('/stories/impact'));
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load impact statistics');
        return data;
    },
    async getFeed(page = 1) {
        const response = await fetch(`${apiUrl('/stories/feed')}?page=${page}`, { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    async toggleHype(id) {
        const response = await fetch(apiUrl(`/stories/${id}/hype`), {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = await response.json();
        return data;
    },

    async addComment(id, text) {
        const response = await fetch(apiUrl(`/stories/${id}/comment`), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },

    async trackShare(id) {
        const response = await fetch(apiUrl(`/stories/${id}/share`), {
            method: 'PUT',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to record share');
        return data;
    }
};
