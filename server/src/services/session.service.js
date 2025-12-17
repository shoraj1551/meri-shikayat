/**
 * Session Management Service
 * Redis-based session storage and management
 */

import getRedisClient, { isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';
import Session from '../models/Session.js';

const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';
const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Create a new session
 * @param {String} userId - User ID
 * @param {String} token - Access token
 * @param {String} refreshToken - Refresh token (optional)
 * @param {Object} deviceInfo - Device information
 * @param {String} ipAddress - IP address
 */
export async function createSession({
    userId,
    token,
    refreshToken = null,
    deviceInfo = {},
    ipAddress
}) {
    try {
        // Create session in database
        const session = await Session.create({
            user: userId,
            token,
            refreshToken,
            deviceInfo: {
                userAgent: deviceInfo.userAgent || 'Unknown',
                browser: deviceInfo.browser || 'Unknown',
                os: deviceInfo.os || 'Unknown',
                device: deviceInfo.device || 'Unknown'
            },
            ipAddress,
            lastActivity: new Date(),
            expiresAt: new Date(Date.now() + SESSION_TTL * 1000)
        });

        // Store in Redis if available
        const redisAvailable = await isRedisAvailable();
        if (redisAvailable) {
            const client = getRedisClient();
            const sessionKey = `${SESSION_PREFIX}${session._id}`;
            const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;

            // Store session data
            await client.setex(
                sessionKey,
                SESSION_TTL,
                JSON.stringify({
                    userId,
                    token,
                    refreshToken,
                    deviceInfo: session.deviceInfo,
                    ipAddress,
                    createdAt: session.createdAt,
                    lastActivity: session.lastActivity
                })
            );

            // Add session ID to user's session set
            await client.sadd(userSessionsKey, session._id.toString());
            await client.expire(userSessionsKey, SESSION_TTL);

            logger.debug('Session stored in Redis', { sessionId: session._id, userId });
        }

        logger.info('Session created', {
            sessionId: session._id,
            userId,
            ipAddress
        });

        return session;
    } catch (error) {
        logger.error('Failed to create session', {
            error: error.message,
            userId
        });
        throw error;
    }
}

/**
 * Get session by ID
 * @param {String} sessionId - Session ID
 */
export async function getSession(sessionId) {
    try {
        // Try Redis first
        const redisAvailable = await isRedisAvailable();
        if (redisAvailable) {
            const client = getRedisClient();
            const sessionKey = `${SESSION_PREFIX}${sessionId}`;
            const data = await client.get(sessionKey);

            if (data) {
                logger.debug('Session retrieved from Redis', { sessionId });
                return JSON.parse(data);
            }
        }

        // Fallback to database
        const session = await Session.findById(sessionId);
        if (session && session.isActive && !session.isExpired()) {
            logger.debug('Session retrieved from database', { sessionId });
            return session;
        }

        return null;
    } catch (error) {
        logger.error('Failed to get session', {
            error: error.message,
            sessionId
        });
        return null;
    }
}

/**
 * Update session activity
 * @param {String} sessionId - Session ID
 */
export async function updateSessionActivity(sessionId) {
    try {
        // Update in database
        await Session.findByIdAndUpdate(sessionId, {
            lastActivity: new Date()
        });

        // Update in Redis if available
        const redisAvailable = await isRedisAvailable();
        if (redisAvailable) {
            const client = getRedisClient();
            const sessionKey = `${SESSION_PREFIX}${sessionId}`;
            const data = await client.get(sessionKey);

            if (data) {
                const session = JSON.parse(data);
                session.lastActivity = new Date();
                await client.setex(sessionKey, SESSION_TTL, JSON.stringify(session));
            }
        }

        logger.debug('Session activity updated', { sessionId });
    } catch (error) {
        logger.error('Failed to update session activity', {
            error: error.message,
            sessionId
        });
    }
}

/**
 * Get all active sessions for a user
 * @param {String} userId - User ID
 */
export async function getUserSessions(userId) {
    try {
        // Try Redis first
        const redisAvailable = await isRedisAvailable();
        if (redisAvailable) {
            const client = getRedisClient();
            const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
            const sessionIds = await client.smembers(userSessionsKey);

            if (sessionIds && sessionIds.length > 0) {
                const sessions = [];
                for (const sessionId of sessionIds) {
                    const session = await getSession(sessionId);
                    if (session) {
                        sessions.push(session);
                    }
                }
                return sessions;
            }
        }

        // Fallback to database
        const sessions = await Session.find({
            user: userId,
            isActive: true
        }).sort({ lastActivity: -1 });

        return sessions.filter(s => !s.isExpired());
    } catch (error) {
        logger.error('Failed to get user sessions', {
            error: error.message,
            userId
        });
        return [];
    }
}

/**
 * Invalidate a specific session
 * @param {String} sessionId - Session ID
 */
export async function invalidateSession(sessionId) {
    try {
        // Deactivate in database
        await Session.findByIdAndUpdate(sessionId, {
            isActive: false
        });

        // Remove from Redis if available
        const redisAvailable = await isRedisAvailable();
        if (redisAvailable) {
            const client = getRedisClient();
            const sessionKey = `${SESSION_PREFIX}${sessionId}`;
            await client.del(sessionKey);
        }

        logger.info('Session invalidated', { sessionId });
        return true;
    } catch (error) {
        logger.error('Failed to invalidate session', {
            error: error.message,
            sessionId
        });
        return false;
    }
}

/**
 * Invalidate all sessions for a user
 * @param {String} userId - User ID
 * @param {String} exceptSessionId - Session ID to keep active (optional)
 */
export async function invalidateUserSessions(userId, exceptSessionId = null) {
    try {
        // Deactivate in database
        const query = { user: userId, isActive: true };
        if (exceptSessionId) {
            query._id = { $ne: exceptSessionId };
        }

        await Session.updateMany(query, { isActive: false });

        // Remove from Redis if available
        const redisAvailable = await isRedisAvailable();
        if (redisAvailable) {
            const client = getRedisClient();
            const userSessionsKey = `${USER_SESSIONS_PREFIX}${userId}`;
            const sessionIds = await client.smembers(userSessionsKey);

            for (const sessionId of sessionIds) {
                if (sessionId !== exceptSessionId) {
                    const sessionKey = `${SESSION_PREFIX}${sessionId}`;
                    await client.del(sessionKey);
                }
            }

            // Clear the user sessions set
            await client.del(userSessionsKey);

            // If keeping one session, add it back
            if (exceptSessionId) {
                await client.sadd(userSessionsKey, exceptSessionId);
                await client.expire(userSessionsKey, SESSION_TTL);
            }
        }

        logger.info('User sessions invalidated', { userId, exceptSessionId });
        return true;
    } catch (error) {
        logger.error('Failed to invalidate user sessions', {
            error: error.message,
            userId
        });
        return false;
    }
}

/**
 * Clean up expired sessions
 * Should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredSessions() {
    try {
        const result = await Session.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isActive: false, updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Inactive for 7 days
            ]
        });

        logger.info('Expired sessions cleaned up', {
            deletedCount: result.deletedCount
        });

        return result.deletedCount;
    } catch (error) {
        logger.error('Failed to cleanup expired sessions', {
            error: error.message
        });
        return 0;
    }
}

/**
 * Get session count for a user
 * @param {String} userId - User ID
 */
export async function getUserSessionCount(userId) {
    try {
        const sessions = await getUserSessions(userId);
        return sessions.length;
    } catch (error) {
        logger.error('Failed to get user session count', {
            error: error.message,
            userId
        });
        return 0;
    }
}

/**
 * Check if user has reached max concurrent sessions
 * @param {String} userId - User ID
 * @param {Number} maxSessions - Maximum allowed sessions (default: 5)
 */
export async function hasReachedMaxSessions(userId, maxSessions = 5) {
    const count = await getUserSessionCount(userId);
    return count >= maxSessions;
}

/**
 * Get session statistics
 */
export async function getSessionStats() {
    try {
        const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
            Session.countDocuments(),
            Session.countDocuments({ isActive: true }),
            Session.countDocuments({ expiresAt: { $lt: new Date() } })
        ]);

        return {
            total: totalSessions,
            active: activeSessions,
            expired: expiredSessions,
            inactive: totalSessions - activeSessions - expiredSessions
        };
    } catch (error) {
        logger.error('Failed to get session stats', {
            error: error.message
        });
        return null;
    }
}

export default {
    createSession,
    getSession,
    updateSessionActivity,
    getUserSessions,
    invalidateSession,
    invalidateUserSessions,
    cleanupExpiredSessions,
    getUserSessionCount,
    hasReachedMaxSessions,
    getSessionStats
};
