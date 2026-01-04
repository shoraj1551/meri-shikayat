/**
 * Cache Service
 * Redis-based caching for frequently accessed data
 */

import getRedisClient, { isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';

// Cache TTL (Time To Live) configurations in seconds
export const CACHE_TTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 1800,          // 30 minutes
    VERY_LONG: 3600,     // 1 hour
    DAY: 86400           // 24 hours
};

// Cache key prefixes for organization
export const CACHE_PREFIX = {
    USER: 'user:',
    COMPLAINT: 'complaint:',
    DEPARTMENT: 'dept:',
    CONTRACTOR: 'contractor:',
    STATS: 'stats:',
    CATEGORY: 'category:',
    LOCATION: 'location:'
};

/**
 * Check if caching is available
 */
export async function isCacheAvailable() {
    return await isRedisAvailable();
}

/**
 * Get data from cache
 * @param {String} key - Cache key
 * @returns {Object|null} - Cached data or null
 */
export async function getCache(key) {
    try {
        const available = await isCacheAvailable();
        if (!available) {
            logger.debug('Cache not available, skipping get', { key });
            return null;
        }

        const client = getRedisClient();
        const data = await client.get(key);

        if (data) {
            logger.debug('Cache hit', { key });
            return JSON.parse(data);
        }

        logger.debug('Cache miss', { key });
        return null;
    } catch (error) {
        logger.error('Cache get error', {
            error: error.message,
            key
        });
        return null; // Fail gracefully
    }
}

/**
 * Set data in cache
 * @param {String} key - Cache key
 * @param {Object} data - Data to cache
 * @param {Number} ttl - Time to live in seconds (optional)
 */
export async function setCache(key, data, ttl = CACHE_TTL.MEDIUM) {
    try {
        const available = await isCacheAvailable();
        if (!available) {
            logger.debug('Cache not available, skipping set', { key });
            return false;
        }

        const client = getRedisClient();
        const serialized = JSON.stringify(data);

        if (ttl) {
            await client.setex(key, ttl, serialized);
        } else {
            await client.set(key, serialized);
        }

        logger.debug('Cache set', { key, ttl });
        return true;
    } catch (error) {
        logger.error('Cache set error', {
            error: error.message,
            key
        });
        return false; // Fail gracefully
    }
}

/**
 * Delete data from cache
 * @param {String} key - Cache key or pattern
 */
export async function deleteCache(key) {
    try {
        const available = await isCacheAvailable();
        if (!available) {
            logger.debug('Cache not available, skipping delete', { key });
            return false;
        }

        const client = getRedisClient();
        await client.del(key);

        logger.debug('Cache deleted', { key });
        return true;
    } catch (error) {
        logger.error('Cache delete error', {
            error: error.message,
            key
        });
        return false;
    }
}

/**
 * Delete multiple keys matching a pattern
 * @param {String} pattern - Pattern to match (e.g., 'user:*')
 */
export async function deleteCachePattern(pattern) {
    try {
        const available = await isCacheAvailable();
        if (!available) {
            logger.debug('Cache not available, skipping pattern delete', { pattern });
            return false;
        }

        const client = getRedisClient();
        const keys = await client.keys(pattern);

        if (keys.length > 0) {
            await client.del(...keys);
            logger.debug('Cache pattern deleted', { pattern, count: keys.length });
        }

        return true;
    } catch (error) {
        logger.error('Cache pattern delete error', {
            error: error.message,
            pattern
        });
        return false;
    }
}

/**
 * Get or set cache (cache-aside pattern)
 * If data exists in cache, return it. Otherwise, fetch from source and cache it.
 * @param {String} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data if not in cache
 * @param {Number} ttl - Time to live in seconds
 */
export async function getOrSetCache(key, fetchFn, ttl = CACHE_TTL.MEDIUM) {
    try {
        // Try to get from cache first
        const cached = await getCache(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch from source
        const data = await fetchFn();

        // Cache the result
        if (data !== null && data !== undefined) {
            await setCache(key, data, ttl);
        }

        return data;
    } catch (error) {
        logger.error('Get or set cache error', {
            error: error.message,
            key
        });
        // If caching fails, still return the fetched data
        return await fetchFn();
    }
}

/**
 * Invalidate cache for a specific resource
 * @param {String} resource - Resource type (user, complaint, etc.)
 * @param {String} resourceId - Resource ID
 */
export async function invalidateResourceCache(resource, resourceId) {
    const prefix = CACHE_PREFIX[resource.toUpperCase()];
    if (!prefix) {
        logger.warn('Unknown resource type for cache invalidation', { resource });
        return false;
    }

    const pattern = `${prefix}${resourceId}*`;
    return await deleteCachePattern(pattern);
}

/**
 * Cache user data
 */
export async function cacheUser(userId, userData, ttl = CACHE_TTL.LONG) {
    const key = `${CACHE_PREFIX.USER}${userId}`;
    return await setCache(key, userData, ttl);
}

/**
 * Get cached user data
 */
export async function getCachedUser(userId) {
    const key = `${CACHE_PREFIX.USER}${userId}`;
    return await getCache(key);
}

/**
 * Cache department data
 */
export async function cacheDepartment(deptId, deptData, ttl = CACHE_TTL.VERY_LONG) {
    const key = `${CACHE_PREFIX.DEPARTMENT}${deptId}`;
    return await setCache(key, deptData, ttl);
}

/**
 * Get cached department data
 */
export async function getCachedDepartment(deptId) {
    const key = `${CACHE_PREFIX.DEPARTMENT}${deptId}`;
    return await getCache(key);
}

/**
 * Cache all departments list
 */
export async function cacheDepartmentsList(departments, ttl = CACHE_TTL.VERY_LONG) {
    const key = `${CACHE_PREFIX.DEPARTMENT}all`;
    return await setCache(key, departments, ttl);
}

/**
 * Get cached departments list
 */
export async function getCachedDepartmentsList() {
    const key = `${CACHE_PREFIX.DEPARTMENT}all`;
    return await getCache(key);
}

/**
 * Cache complaint statistics
 */
export async function cacheComplaintStats(stats, ttl = CACHE_TTL.MEDIUM) {
    const key = `${CACHE_PREFIX.STATS}complaints`;
    return await setCache(key, stats, ttl);
}

/**
 * Get cached complaint statistics
 */
export async function getCachedComplaintStats() {
    const key = `${CACHE_PREFIX.STATS}complaints`;
    return await getCache(key);
}

/**
 * Cache categories
 */
export async function cacheCategories(categories, ttl = CACHE_TTL.DAY) {
    const key = `${CACHE_PREFIX.CATEGORY}all`;
    return await setCache(key, categories, ttl);
}

/**
 * Get cached categories
 */
export async function getCachedCategories() {
    const key = `${CACHE_PREFIX.CATEGORY}all`;
    return await getCache(key);
}

/**
 * Increment a counter in cache
 * Useful for rate limiting, statistics, etc.
 */
export async function incrementCounter(key, ttl = CACHE_TTL.MEDIUM) {
    try {
        const available = await isCacheAvailable();
        if (!available) return 0;

        const client = getRedisClient();
        const value = await client.incr(key);

        // Set expiry on first increment
        if (value === 1 && ttl) {
            await client.expire(key, ttl);
        }

        return value;
    } catch (error) {
        logger.error('Counter increment error', {
            error: error.message,
            key
        });
        return 0;
    }
}

/**
 * Get counter value
 */
export async function getCounter(key) {
    try {
        const available = await isCacheAvailable();
        if (!available) return 0;

        const client = getRedisClient();
        const value = await client.get(key);

        return value ? parseInt(value, 10) : 0;
    } catch (error) {
        logger.error('Get counter error', {
            error: error.message,
            key
        });
        return 0;
    }
}

/**
 * Clear all cache (use with caution!)
 */
export async function clearAllCache() {
    try {
        const available = await isCacheAvailable();
        if (!available) {
            logger.warn('Cache not available, cannot clear');
            return false;
        }

        const client = getRedisClient();
        await client.flushdb();

        logger.info('All cache cleared');
        return true;
    } catch (error) {
        logger.error('Clear all cache error', { error: error.message });
        return false;
    }
}

export default {
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    getOrSetCache,
    invalidateResourceCache,
    cacheUser,
    getCachedUser,
    cacheDepartment,
    getCachedDepartment,
    cacheDepartmentsList,
    getCachedDepartmentsList,
    cacheComplaintStats,
    getCachedComplaintStats,
    cacheCategories,
    getCachedCategories,
    incrementCounter,
    getCounter,
    clearAllCache,
    isCacheAvailable,
    CACHE_TTL,
    CACHE_PREFIX
};
