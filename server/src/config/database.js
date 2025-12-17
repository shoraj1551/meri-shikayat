/**
 * Enhanced Database Configuration
 * Optimized for serverless environments (Vercel) with connection pooling and caching
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Connection pool configuration
const POOL_CONFIG = {
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    maxIdleTimeMS: 10000,
    retryWrites: true,
    retryReads: true
};

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000 // 10 seconds
};

// Connection cache for serverless (prevents connection exhaustion)
let cachedConnection = null;
let connectionPromise = null;

/**
 * Exponential backoff delay
 */
function getRetryDelay(attempt) {
    const delay = Math.min(
        RETRY_CONFIG.initialDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
}

/**
 * Connect to MongoDB with retry logic
 */
async function connectWithRetry(attempt = 0) {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            ...POOL_CONFIG,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        logger.info('MongoDB connected successfully', {
            host: conn.connection.host,
            database: conn.connection.name,
            poolSize: POOL_CONFIG.maxPoolSize
        });

        return conn;
    } catch (error) {
        if (attempt < RETRY_CONFIG.maxRetries) {
            const delay = getRetryDelay(attempt);

            logger.warn(`MongoDB connection failed, retrying in ${delay}ms`, {
                attempt: attempt + 1,
                maxRetries: RETRY_CONFIG.maxRetries,
                error: error.message
            });

            await new Promise(resolve => setTimeout(resolve, delay));
            return connectWithRetry(attempt + 1);
        }

        logger.error('MongoDB connection failed after all retries', {
            attempts: attempt + 1,
            error: error.message,
            stack: error.stack
        });

        throw error;
    }
}

/**
 * Get or create database connection (serverless-optimized)
 * Uses connection caching to prevent connection exhaustion in serverless environments
 */
export async function connectDatabase() {
    // Return cached connection if available and connected
    if (cachedConnection && mongoose.connection.readyState === 1) {
        logger.debug('Using cached MongoDB connection');
        return cachedConnection;
    }

    // Return existing connection promise if connection is in progress
    if (connectionPromise) {
        logger.debug('Waiting for existing connection attempt');
        return connectionPromise;
    }

    // Create new connection
    logger.info('Creating new MongoDB connection');

    connectionPromise = connectWithRetry()
        .then(conn => {
            cachedConnection = conn;
            connectionPromise = null;
            return conn;
        })
        .catch(error => {
            connectionPromise = null;
            throw error;
        });

    return connectionPromise;
}

/**
 * Get database connection health status
 */
export function getConnectionHealth() {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    return {
        status: states[state] || 'unknown',
        readyState: state,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        poolSize: {
            min: POOL_CONFIG.minPoolSize,
            max: POOL_CONFIG.maxPoolSize
        }
    };
}

/**
 * Gracefully close database connection
 */
export async function closeDatabase() {
    if (mongoose.connection.readyState !== 0) {
        logger.info('Closing MongoDB connection');

        await mongoose.connection.close();
        cachedConnection = null;
        connectionPromise = null;

        logger.info('MongoDB connection closed');
    }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    cachedConnection = null;
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', {
        error: err.message,
        stack: err.stack
    });
    cachedConnection = null;
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    await closeDatabase();
    logger.info('MongoDB connection closed through SIGINT');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDatabase();
    logger.info('MongoDB connection closed through SIGTERM');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at Promise', {
        reason,
        promise
    });
});

export default {
    connectDatabase,
    closeDatabase,
    getConnectionHealth
};
