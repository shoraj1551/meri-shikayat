/**
 * Authorities API Service
 * Handles all API calls for departments, offices, personnel, and statistics
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all departments
 * @returns {Promise<Array>} List of all departments
 */
export async function fetchAllDepartments() {
    try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch departments');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
}

/**
 * Fetch department details by code
 * @param {string} code - Department code (e.g., 'municipal', 'police')
 * @returns {Promise<Object>} Department details with statistics, offices, and personnel
 */
export async function fetchDepartmentByCode(code) {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${code.toUpperCase()}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch department details');
        }

        return data.data;
    } catch (error) {
        console.error(`Error fetching department ${code}:`, error);
        throw error;
    }
}

/**
 * Fetch all offices for a department
 * @param {string} code - Department code
 * @returns {Promise<Array>} List of offices
 */
export async function fetchDepartmentOffices(code) {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${code.toUpperCase()}/offices`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch offices');
        }

        return data.data;
    } catch (error) {
        console.error(`Error fetching offices for ${code}:`, error);
        throw error;
    }
}

/**
 * Fetch department statistics
 * @param {string} code - Department code
 * @param {string} period - Period type ('daily', 'weekly', 'monthly', 'yearly', 'all_time')
 * @returns {Promise<Object>} Department statistics
 */
export async function fetchDepartmentStatistics(code, period = 'all_time') {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${code.toUpperCase()}/statistics?period=${period}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch statistics');
        }

        return data.data;
    } catch (error) {
        console.error(`Error fetching statistics for ${code}:`, error);
        throw error;
    }
}

// Cache for department data (simple in-memory cache)
const departmentCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch department with caching
 * @param {string} code - Department code
 * @returns {Promise<Object>} Cached or fresh department data
 */
export async function fetchDepartmentCached(code) {
    const cacheKey = `dept_${code}`;
    const cached = departmentCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return cached.data;
    }

    const data = await fetchDepartmentByCode(code);
    departmentCache.set(cacheKey, {
        data,
        timestamp: Date.now()
    });

    return data;
}

/**
 * Clear department cache
 */
export function clearDepartmentCache() {
    departmentCache.clear();
}
