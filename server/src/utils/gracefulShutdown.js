/**
 * Graceful Shutdown Handler
 * TASK-PR-007: Implement graceful shutdown
 */

import logger from '../utils/logger.js';
import mongoose from 'mongoose';
import { closeRedisConnection } from '../config/redis.js';

/**
 * Setup graceful shutdown handlers
 * @param {Object} server - HTTP server instance
 */
export const setupGracefulShutdown = (server) => {
    const gracePeriod = 30000; // 30 seconds

    const shutdown = async (signal) => {
        logger.info(`${signal} received, starting graceful shutdown`, {
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });

        // Stop accepting new connections
        server.close(async () => {
            logger.info('HTTP server closed');

            try {
                // Close database connections
                logger.info('Closing MongoDB connection...');
                await mongoose.connection.close(false);
                logger.info('MongoDB connection closed');

                // Close Redis connection
                logger.info('Closing Redis connection...');
                await closeRedisConnection();
                logger.info('Redis connection closed');

                logger.info('Graceful shutdown complete');
                process.exit(0);
            } catch (error) {
                logger.error('Error during shutdown', { error: error.message });
                process.exit(1);
            }
        });

        // Force shutdown after grace period
        setTimeout(() => {
            logger.error('Forced shutdown after grace period', {
                gracePeriod
            });
            process.exit(1);
        }, gracePeriod);
    };

    // Handle termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception', {
            error: error.message,
            stack: error.stack
        });
        shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled promise rejection', {
            reason,
            promise
        });
        shutdown('unhandledRejection');
    });

    logger.info('Graceful shutdown handlers registered');
};

export default { setupGracefulShutdown };
