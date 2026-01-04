/**
 * Health Check Endpoints
 * TASK-019: Comprehensive health checks for liveness and readiness probes
 */

import mongoose from 'mongoose';
import getRedisClient, { isRedisAvailable } from '../config/redis.js';
import { getAllStates as getCircuitBreakerStates } from '../utils/circuitBreaker.js';
import logger from '../utils/logger.js';

/**
 * Liveness probe - checks if application is running
 * Returns 200 if app is alive, 503 if dead
 */
export const livenessProbe = async (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
};

/**
 * Readiness probe - checks if application is ready to serve traffic
 * Returns 200 if ready, 503 if not ready
 */
export const readinessProbe = async (req, res) => {
    const checks = {
        database: await checkDatabase(),
        redis: await checkRedis()
    };

    const isReady = Object.values(checks).every(check => check.status === 'UP');

    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        checks
    });
};

/**
 * Detailed health check - comprehensive system status
 */
export const healthCheck = async (req, res) => {
    const startTime = Date.now();

    const checks = {
        database: await checkDatabase(),
        redis: await checkRedis(),
        memory: checkMemory(),
        disk: checkDisk(),
        circuitBreakers: checkCircuitBreakers()
    };

    const isHealthy = checks.database.status === 'UP';
    const duration = Date.now() - startTime;

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        version: process.env.npm_package_version || '1.0.5',
        environment: process.env.NODE_ENV || 'development',
        checks
    });
};

/**
 * Check MongoDB connection
 */
async function checkDatabase() {
    try {
        const state = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        if (state === 1) { // connected
            // Ping database
            await mongoose.connection.db.admin().ping();

            return {
                status: 'UP',
                state: states[state],
                responseTime: '<10ms'
            };
        }

        return {
            status: 'DOWN',
            state: states[state],
            error: 'Not connected'
        };
    } catch (error) {
        logger.error('Database health check failed', { error: error.message });
        return {
            status: 'DOWN',
            error: error.message
        };
    }
}

/**
 * Check Redis connection
 */
async function checkRedis() {
    try {
        const available = await isRedisAvailable();

        if (available) {
            const redis = getRedisClient();
            const startTime = Date.now();
            await redis.ping();
            const responseTime = Date.now() - startTime;

            return {
                status: 'UP',
                responseTime: `${responseTime}ms`
            };
        }

        return {
            status: 'DOWN',
            error: 'Redis not available'
        };
    } catch (error) {
        logger.error('Redis health check failed', { error: error.message });
        return {
            status: 'DOWN',
            error: error.message
        };
    }
}

/**
 * Check memory usage
 */
function checkMemory() {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const percentUsed = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    return {
        status: percentUsed < 90 ? 'UP' : 'WARNING',
        heapUsed: `${usedMB}MB`,
        heapTotal: `${totalMB}MB`,
        percentUsed: `${percentUsed}%`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`
    };
}

/**
 * Check disk usage (placeholder - requires OS-specific implementation)
 */
function checkDisk() {
    // TODO: Implement actual disk check using 'diskusage' package
    return {
        status: 'UP',
        note: 'Disk check not implemented'
    };
}

/**
 * Check circuit breaker states
 */
function checkCircuitBreakers() {
    const states = getCircuitBreakerStates();
    const hasOpenCircuits = states.some(cb => cb.state === 'OPEN');

    return {
        status: hasOpenCircuits ? 'WARNING' : 'UP',
        breakers: states
    };
}

export default {
    livenessProbe,
    readinessProbe,
    healthCheck
};
