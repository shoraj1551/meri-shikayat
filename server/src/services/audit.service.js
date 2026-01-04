/**
 * Audit Logging Service
 * Comprehensive audit trail for all sensitive operations
 */

import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {String} params.userId - User ID performing the action
 * @param {String} params.userModel - User model type ('User' or 'Admin')
 * @param {String} params.action - Action performed
 * @param {String} params.resource - Resource type affected
 * @param {String} params.resourceId - Resource ID affected (optional)
 * @param {Object} params.details - Additional details (optional)
 * @param {String} params.ipAddress - IP address of the request
 * @param {String} params.userAgent - User agent string
 */
export async function createAuditLog({
    userId,
    userModel = 'User',
    action,
    resource,
    resourceId = null,
    details = {},
    ipAddress,
    userAgent
}) {
    try {
        const auditLog = await AuditLog.create({
            user: userId || null,
            userModel: userId ? userModel : undefined,
            action,
            resource,
            resourceId,
            details,
            ipAddress,
            userAgent,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date()
        });

        logger.info('Audit log created', {
            auditId: auditLog._id,
            userId,
            action,
            resource,
            resourceId
        });

        return auditLog;
    } catch (error) {
        // Log error but don't throw - audit logging should not break the main flow
        logger.error('Failed to create audit log', {
            error: error.message,
            userId,
            action,
            resource
        });
    }
}

/**
 * Log user authentication events
 */
export async function logAuth(action, userId, req, details = {}) {
    return createAuditLog({
        userId,
        userModel: 'User',
        action,
        resource: 'user',
        resourceId: userId,
        details: {
            ...details,
            timestamp: new Date().toISOString()
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
    });
}

/**
 * Log complaint operations
 */
export async function logComplaint(action, userId, complaintId, req, details = {}) {
    return createAuditLog({
        userId,
        userModel: 'User',
        action,
        resource: 'complaint',
        resourceId: complaintId,
        details: {
            ...details,
            timestamp: new Date().toISOString()
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
    });
}

/**
 * Log admin operations
 */
export async function logAdmin(action, adminId, resourceType, resourceId, req, details = {}) {
    return createAuditLog({
        userId: adminId,
        userModel: 'Admin',
        action,
        resource: resourceType,
        resourceId,
        details: {
            ...details,
            timestamp: new Date().toISOString()
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
    });
}

/**
 * Log media operations
 */
export async function logMedia(action, userId, mediaId, req, details = {}) {
    return createAuditLog({
        userId,
        userModel: 'User',
        action,
        resource: 'media',
        resourceId: mediaId,
        details: {
            ...details,
            timestamp: new Date().toISOString()
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
    });
}

/**
 * Log profile updates
 */
export async function logProfile(action, userId, req, details = {}) {
    return createAuditLog({
        userId,
        userModel: 'User',
        action,
        resource: 'user',
        resourceId: userId,
        details: {
            ...details,
            timestamp: new Date().toISOString()
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent')
    });
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs({
    userId = null,
    action = null,
    resource = null,
    startDate = null,
    endDate = null,
    page = 1,
    limit = 50
}) {
    try {
        const query = {};

        if (userId) query.user = userId;
        if (action) query.action = action;
        if (resource) query.resource = resource;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'firstName lastName email phone')
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error('Failed to retrieve audit logs', { error: error.message });
        throw error;
    }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditTrail(resource, resourceId, limit = 20) {
    try {
        const logs = await AuditLog.find({
            resource,
            resourceId
        })
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('user', 'firstName lastName email')
            .lean();

        return logs;
    } catch (error) {
        logger.error('Failed to retrieve resource audit trail', {
            error: error.message,
            resource,
            resourceId
        });
        throw error;
    }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const summary = await AuditLog.aggregate([
            {
                $match: {
                    user: userId,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    lastOccurrence: { $max: '$timestamp' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        return summary;
    } catch (error) {
        logger.error('Failed to get user activity summary', {
            error: error.message,
            userId
        });
        throw error;
    }
}

/**
 * Clean up old audit logs (manual cleanup, in addition to TTL index)
 */
export async function cleanupOldLogs(daysToKeep = 90) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await AuditLog.deleteMany({
            timestamp: { $lt: cutoffDate }
        });

        logger.info('Cleaned up old audit logs', {
            deletedCount: result.deletedCount,
            cutoffDate
        });

        return result.deletedCount;
    } catch (error) {
        logger.error('Failed to cleanup old audit logs', { error: error.message });
        throw error;
    }
}

export default {
    createAuditLog,
    logAuth,
    logComplaint,
    logAdmin,
    logMedia,
    logProfile,
    getAuditLogs,
    getResourceAuditTrail,
    getUserActivitySummary,
    cleanupOldLogs
};
