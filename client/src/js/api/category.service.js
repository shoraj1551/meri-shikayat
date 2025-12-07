import apiClient from './client.js';

export const categoryService = {
    async getCategories() {
        try {
            const response = await apiClient.get('/categories');
            // Assuming the API returns { success: true, data: [...] }
            return response.data.data;
        } catch (error) {
            console.error('Category Service Error:', error);
            throw error;
        }
    }
};
