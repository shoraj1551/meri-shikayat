/**
 * Health Check Routes
 * System health monitoring endpoints
 */

import express from 'express';
import { getConnectionHealth } from '../config/database.js';
import { getRedisHealth } from '../config/redis.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with all services
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
    try {
        const dbHealth = getConnectionHealth();
        const redisHealth = getRedisHealth();

        const isHealthy = dbHealth.status === 'connected' &&
            (redisHealth.status === 'connected' || redisHealth.status === 'ready');

        const health = {
            success: true,
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                database: {
                    status: dbHealth.status,
                    host: dbHealth.host,
                    database: dbHealth.name,
                    poolSize: dbHealth.poolSize
                },
                redis: {
                    status: redisHealth.status,
                    mode: redisHealth.mode
                },
                server: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    memory: {
                        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                        unit: 'MB'
                    }
                }
            }
        };

        logger.info('Health check performed', {
            status: health.status,
            dbStatus: dbHealth.status,
            redisStatus: redisHealth.status
        });

        const statusCode = isHealthy ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        logger.error('Health check failed', {
            error: error.message,
            stack: error.stack
        });

        res.status(503).json({
            success: false,
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});

/**
 * @route   GET /health/db
 * @desc    Database health check only
 * @access  Public
 */
router.get('/db', (req, res) => {
    const dbHealth = getConnectionHealth();
    const isHealthy = dbHealth.status === 'connected';

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        ...dbHealth,
        timestamp: new Date().toISOString()
    });
});

/**
 * @route   GET /health/redis
 * @desc    Redis health check only
 * @access  Public
 */
router.get('/redis', (req, res) => {
    const redisHealth = getRedisHealth();
    const isHealthy = redisHealth.status === 'connected' || redisHealth.status === 'ready';

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        ...redisHealth,
        timestamp: new Date().toISOString()
    });
});

export default router;
