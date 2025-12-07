import { API_URL } from '../config.js';

export const categoryService = {
    async getCategories() {
        try {
            const response = await fetch(`${API_URL}/categories`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch categories');
            }

            return data.data;
        } catch (error) {
            console.error('Category Service Error:', error);
            throw error;
        }
    }
};
