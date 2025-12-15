/**
 * Contractors API Service
 * Handles all API calls for contractors and contractor assignments
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all contractors
 * @param {Object} filters - Optional filters (specialization, city, verified)
 * @returns {Promise<Array>} List of contractors
 */
export async function fetchAllContractors(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/contractors${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch contractors');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching contractors:', error);
        throw error;
    }
}

/**
 * Fetch contractor details by ID
 * @param {string} id - Contractor ID
 * @returns {Promise<Object>} Contractor details with recent jobs and performance
 */
export async function fetchContractorById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/contractors/${id}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch contractor details');
        }

        return data.data;
    } catch (error) {
        console.error(`Error fetching contractor ${id}:`, error);
        throw error;
    }
}

/**
 * Fetch contractor statistics
 * @param {string} id - Contractor ID
 * @returns {Promise<Object>} Contractor statistics
 */
export async function fetchContractorStatistics(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/contractors/${id}/statistics`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch contractor statistics');
        }

        return data.data;
    } catch (error) {
        console.error(`Error fetching contractor statistics for ${id}:`, error);
        throw error;
    }
}

/**
 * Fetch verified contractors only
 * @returns {Promise<Array>} List of verified contractors
 */
export async function fetchVerifiedContractors() {
    return fetchAllContractors({ verified: 'true' });
}

/**
 * Fetch contractors by specialization
 * @param {string} specialization - Specialization type
 * @returns {Promise<Array>} List of contractors
 */
export async function fetchContractorsBySpecialization(specialization) {
    return fetchAllContractors({ specialization });
}

/**
 * Fetch contractors by city
 * @param {string} city - City name
 * @returns {Promise<Array>} List of contractors
 */
export async function fetchContractorsByCity(city) {
    return fetchAllContractors({ city });
}
