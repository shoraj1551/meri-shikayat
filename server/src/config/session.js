/**
 * Enhanced Session Management
 * TASK-016: Redis-backed sessions with timeout enforcement
 */

import session from 'express-session';
import RedisStore from 'connect-redis';
import getRedisClient from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Session configuration
 */
export const sessionConfig = {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    },
    rolling: true // Reset expiry on each request
};

/**
 * Create session middleware with Redis store
 */
export const createSessionMiddleware = () => {
    const redisClient = getRedisClient();

    if (redisClient) {
        sessionConfig.store = new RedisStore({
            client: redisClient,
            prefix: 'sess:',
            ttl: 86400 // 24 hours in seconds
        });
        logger.info('Session store: Redis');
    } else {
        logger.warn('Session store: Memory (not suitable for production)');
    }

    return session(sessionConfig);
};

/**
 * Session timeout middleware
 */
export const enforceSessionTimeout = (timeoutMs = 30 * 60 * 1000) => {
    return (req, res, next) => {
        if (req.session && req.session.lastActivity) {
            const now = Date.now();
            const timeSinceLastActivity = now - req.session.lastActivity;

            if (timeSinceLastActivity > timeoutMs) {
                logger.info('Session timeout', {
                    userId: req.session.userId,
                    lastActivity: new Date(req.session.lastActivity)
                });

                req.session.destroy();
                return res.status(401).json({
                    success: false,
                    message: 'Session expired due to inactivity'
                });
            }
        }

        if (req.session) {
            req.session.lastActivity = Date.now();
        }

        next();
    };
};

export default {
    createSessionMiddleware,
    enforceSessionTimeout
};
