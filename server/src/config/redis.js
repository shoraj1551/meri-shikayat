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

    // Enhanced retry strategy with exponential backoff
    retryStrategy: (times) => {
        // Max 10 retry attempts
        if (times > 10) {
            logger.error('Redis max retry attempts reached. Giving up.', {
                metadata: { attempts: times }
            });
            return null; // Stop retrying
        }

        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, 2000ms (max)
        const delay = Math.min(Math.pow(2, times) * 100, 2000);

        logger.warn(`Redis connection retry attempt ${times}/10, delay: ${delay}ms`, {
            metadata: {
                attempt: times,
                delay,
                maxAttempts: 10
            }
        });

        return delay;
    },

    // Reduced max retries per request for faster failure
    maxRetriesPerRequest: 3,

    // Connection timeout
    connectTimeout: 10000, // 10 seconds

    // Enable offline queue
    enableOfflineQueue: true,

    // Lazy connect - don't connect immediately
    lazyConnect: false,

    // Reconnect on error
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            // Reconnect when Redis is in readonly mode
            logger.warn('Redis in READONLY mode, reconnecting...');
            return true;
        }

        // Reconnect on connection errors
        if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
            return true;
        }

        return false;
    },

    // Keep alive
    keepAlive: 30000, // 30 seconds

    // Family preference (IPv4)
    family: 4
};

// Create Redis client
let redisClient = null;
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 10;

export const getRedisClient = () => {
    if (!redisClient) {
        redisClient = new Redis(redisConfig);

        // Event handlers
        redisClient.on('connect', () => {
            connectionAttempts = 0;
            logger.info('✅ Redis connecting...', {
                metadata: {
                    host: redisConfig.host,
                    port: redisConfig.port,
                    db: redisConfig.db
                }
            });
        });

        redisClient.on('ready', () => {
            isConnected = true;
            connectionAttempts = 0;
            logger.info('✅ Redis ready to accept commands', {
                metadata: {
                    host: redisConfig.host,
                    port: redisConfig.port
                }
            });
        });

        redisClient.on('error', (err) => {
            isConnected = false;
            connectionAttempts++;

            logger.error('❌ Redis connection error', {
                metadata: {
                    error: err.message,
                    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
                    attempts: connectionAttempts,
                    maxAttempts: MAX_CONNECTION_ATTEMPTS
                }
            });

            // If max attempts reached, log fallback message
            if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
                logger.error('⚠️ Redis max connection attempts reached. Using memory fallback for rate limiting.');
            }
        });

        redisClient.on('close', () => {
            isConnected = false;
            logger.warn('⚠️ Redis connection closed');
        });

        redisClient.on('reconnecting', (delay) => {
            logger.info(`🔄 Redis reconnecting in ${delay}ms`, {
                metadata: {
                    delay,
                    attempts: connectionAttempts
                }
            });
        });

        redisClient.on('end', () => {
            isConnected = false;
            logger.warn('⚠️ Redis connection ended');
        });
    }

    return redisClient;
};

// Check if Redis is available
export const isRedisAvailable = async () => {
    try {
        if (!redisClient || !isConnected) {
            return false;
        }

        const client = getRedisClient();
        await client.ping();
        return true;
    } catch (error) {
        logger.error('Redis health check failed', {
            metadata: {
                error: error.message,
                connected: isConnected
            }
        });
        return false;
    }
};

// Get Redis connection status
export const getRedisStatus = () => {
    if (!redisClient) {
        return {
            status: 'not_initialized',
            connected: false,
            attempts: 0
        };
    }

    return {
        status: redisClient.status,
        connected: isConnected,
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db,
        connectionAttempts
    };
};

// Get Redis health (alias for health check compatibility)
export const getRedisHealth = () => {
    if (!redisClient) {
        return { status: 'not_initialized', mode: 'unavailable' };
    }

    return {
        status: redisClient.status,
        mode: isConnected ? 'active' : 'connecting',
        host: redisConfig.host,
        port: redisConfig.port,
        healthy: isConnected,
        connectionAttempts
    };
};

// Close Redis connection gracefully
export const closeRedisConnection = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
            logger.info('✅ Redis connection closed gracefully');
            redisClient = null;
            isConnected = false;
            connectionAttempts = 0;
        } catch (error) {
            logger.error('Error closing Redis connection', {
                metadata: { error: error.message }
            });
            // Force disconnect if graceful shutdown fails
            redisClient.disconnect();
            redisClient = null;
            isConnected = false;
        }
    }
};

// Export the client getter as default
export default getRedisClient;

