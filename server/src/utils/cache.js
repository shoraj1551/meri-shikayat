/**
 * Caching Strategy Implementation
 * TASK-017: Redis-based caching for improved performance
 */

import getRedisClient from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Cache TTL configurations (in seconds)
 */
export const CACHE_TTL = {
    SHORT: 60,           // 1 minute
    MEDIUM: 300,         // 5 minutes
    LONG: 1800,          // 30 minutes
    VERY_LONG: 3600,     // 1 hour
    DAY: 86400           // 24 hours
};

/**
 * Generate cache key
 * @param {string} prefix - Key prefix
 * @param {string|Object} identifier - Unique identifier
 * @returns {string} Cache key
 */
export const generateCacheKey = (prefix, identifier) => {
    const id = typeof identifier === 'object' ? JSON.stringify(identifier) : identifier;
    return `cache:${prefix}:${id}`;
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached data or null
 */
export const getCache = async (key) => {
    try {
        const redis = getRedisClient();
        const data = await redis.get(key);

        if (data) {
            logger.debug('Cache hit', { key });
            return JSON.parse(data);
        }

        logger.debug('Cache miss', { key });
        return null;
    } catch (error) {
        logger.error('Cache get error', { key, error: error.message });
        return null; // Fail gracefully
    }
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
export const setCache = async (key, data, ttl = CACHE_TTL.MEDIUM) => {
    try {
        const redis = getRedisClient();
        await redis.setex(key, ttl, JSON.stringify(data));
        logger.debug('Cache set', { key, ttl });
        return true;
    } catch (error) {
        logger.error('Cache set error', { key, error: error.message });
        return false;
    }
};

/**
 * Delete from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export const deleteCache = async (key) => {
    try {
        const redis = getRedisClient();
        await redis.del(key);
        logger.debug('Cache deleted', { key });
        return true;
    } catch (error) {
        logger.error('Cache delete error', { key, error: error.message });
        return false;
    }
};

/**
 * Delete cache by pattern
 * @param {string} pattern - Key pattern (e.g., 'cache:user:*')
 * @returns {Promise<number>} Number of keys deleted
 */
export const deleteCachePattern = async (pattern) => {
    try {
        const redis = getRedisClient();
        const keys = await redis.keys(pattern);

        if (keys.length > 0) {
            await redis.del(...keys);
            logger.debug('Cache pattern deleted', { pattern, count: keys.length });
            return keys.length;
        }

        return 0;
    } catch (error) {
        logger.error('Cache pattern delete error', { pattern, error: error.message });
        return 0;
    }
};

/**
 * Cache middleware for GET requests
 * @param {number} ttl - Cache TTL in seconds
 * @param {Function} keyGenerator - Function to generate cache key from req
 */
export const cacheMiddleware = (ttl = CACHE_TTL.MEDIUM, keyGenerator = null) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        try {
            // Generate cache key
            const cacheKey = keyGenerator
                ? keyGenerator(req)
                : generateCacheKey(req.path, req.query);

            // Try to get from cache
            const cachedData = await getCache(cacheKey);

            if (cachedData) {
                return res.json({
                    ...cachedData,
                    _cached: true,
                    _cacheKey: cacheKey
                });
            }

            // Store original json function
            const originalJson = res.json.bind(res);

            // Override json to cache response
            res.json = function (data) {
                // Cache successful responses
                if (res.statusCode === 200 && data.success !== false) {
                    setCache(cacheKey, data, ttl).catch(err => {
                        logger.error('Failed to cache response', { error: err.message });
                    });
                }

                return originalJson(data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error', { error: error.message });
            next(); // Continue without caching
        }
    };
};

/**
 * Invalidate cache for a resource
 * @param {string} resourceType - Type of resource (e.g., 'user', 'complaint')
 * @param {string} resourceId - Resource ID
 */
export const invalidateResourceCache = async (resourceType, resourceId = '*') => {
    const pattern = generateCacheKey(resourceType, resourceId);
    return await deleteCachePattern(pattern);
};

export default {
    CACHE_TTL,
    generateCacheKey,
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    cacheMiddleware,
    invalidateResourceCache
};
