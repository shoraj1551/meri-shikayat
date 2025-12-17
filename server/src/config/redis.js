/**
 * Redis Configuration
 * Manages Redis connection for caching and rate limiting
 */

import Redis from 'ioredis';
import logger from '../utils/logger.js';

// Redis connection configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,

    // Connection retry strategy
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
    },

    // Maximum retry attempts
    maxRetriesPerRequest: 3,

    // Connection timeout
    connectTimeout: 10000,

    // Enable offline queue
    enableOfflineQueue: true,

    // Reconnect on error
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            // Reconnect when Redis is in readonly mode
            return true;
        }
        return false;
    }
};

// Create Redis client
let redisClient = null;

export const getRedisClient = () => {
    if (!redisClient) {
        redisClient = new Redis(redisConfig);

        // Event handlers
        redisClient.on('connect', () => {
            logger.info('✅ Redis connected successfully', {
                host: redisConfig.host,
                port: redisConfig.port,
                db: redisConfig.db
            });
        });

        redisClient.on('ready', () => {
            logger.info('✅ Redis ready to accept commands');
        });

        redisClient.on('error', (err) => {
            logger.error('❌ Redis connection error', {
                error: err.message,
                stack: err.stack
            });
        });

        redisClient.on('close', () => {
            logger.warn('⚠️ Redis connection closed');
        });

        redisClient.on('reconnecting', (delay) => {
            logger.info(`🔄 Redis reconnecting in ${delay}ms`);
        });

        redisClient.on('end', () => {
            logger.warn('⚠️ Redis connection ended');
        });
    }

    return redisClient;
};

// Check if Redis is available
export const isRedisAvailable = async () => {
    try {
        const client = getRedisClient();
        await client.ping();
        return true;
    } catch (error) {
        logger.error('Redis health check failed', { error: error.message });
        return false;
    }
};

// Get Redis connection status
export const getRedisStatus = () => {
    if (!redisClient) {
        return { status: 'not_initialized', connected: false };
    }

    return {
        status: redisClient.status,
        connected: redisClient.status === 'ready' || redisClient.status === 'connect',
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db
    };
};

// Get Redis health (alias for health check compatibility)
export const getRedisHealth = () => {
    if (!redisClient) {
        return { status: 'not_initialized', mode: 'unavailable' };
    }

    return {
        status: redisClient.status,
        mode: redisClient.status === 'ready' ? 'active' : 'connecting',
        host: redisConfig.host,
        port: redisConfig.port
    };
};

// Close Redis connection gracefully
export const closeRedisConnection = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
            logger.info('✅ Redis connection closed gracefully');
            redisClient = null;
        } catch (error) {
            logger.error('Error closing Redis connection', { error: error.message });
            // Force disconnect if graceful shutdown fails
            redisClient.disconnect();
            redisClient = null;
        }
    }
};

// Export the client getter as default
export default getRedisClient;

