/**
 * Request Timeout Middleware
 * TASK-PR-005: Implement request timeouts
 */

import logger from '../utils/logger.js';

/**
 * Global request timeout middleware
 * @param {number} ms - Timeout in milliseconds (default: 30s)
 */
export const requestTimeout = (ms = 30000) => {
    return (req, res, next) => {
        // Set timeout on request
        req.setTimeout(ms, () => {
            logger.warn('Request timeout', {
                method: req.method,
                path: req.path,
                timeout: ms,
                ip: req.ip
            });

            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    error: 'Request timeout',
                    message: `Request exceeded ${ms}ms timeout`
                });
            }
        });

        next();
    };
};

/**
 * Database query timeout wrapper
 * @param {Promise} queryPromise - Mongoose query promise
 * @param {number} ms - Timeout in milliseconds (default: 10s)
 */
export const withQueryTimeout = (queryPromise, ms = 10000) => {
    return Promise.race([
        queryPromise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Query timeout after ${ms}ms`)), ms)
        )
    ]);
};

/**
 * External API timeout wrapper
 * @param {Promise} apiPromise - API call promise
 * @param {number} ms - Timeout in milliseconds (default: 15s)
 */
export const withApiTimeout = (apiPromise, ms = 15000) => {
    return Promise.race([
        apiPromise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`API timeout after ${ms}ms`)), ms)
        )
    ]);
};

export default {
    requestTimeout,
    withQueryTimeout,
    withApiTimeout
};
