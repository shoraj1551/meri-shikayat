/**
 * Audit Logging Middleware
 * Automatically logs sensitive operations
 */

import { createAuditLog } from '../services/audit.service.js';
import logger from '../utils/logger.js';

/**
 * Generic audit middleware
 * Logs the action after the request is processed
 */
export const auditLog = (action, resource, getResourceId = null, getDetails = null) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to log after response
        res.json = function (data) {
            // Only log if response was successful (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Execute async without blocking response
                setImmediate(async () => {
                    try {
                        const resourceId = getResourceId ? getResourceId(req, data) : null;
                        const details = getDetails ? getDetails(req, data) : {};

                        await createAuditLog({
                            userId: req.user?.id || req.user?._id,
                            userModel: req.user?.role === 'admin' || req.user?.role === 'super_admin' ? 'Admin' : 'User',
                            action,
                            resource,
                            resourceId,
                            details,
                            ipAddress: req.ip || req.connection?.remoteAddress,
                            userAgent: req.get('user-agent')
                        });
                    } catch (error) {
                        logger.error('Audit logging failed', {
                            error: error.message,
                            action,
                            resource
                        });
                    }
                });
            }

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

/**
 * Audit middleware for authentication events
 */
export const auditAuth = (action) => {
    return auditLog(
        action,
        'user',
        (req, data) => data?.data?.id || req.user?.id,
        (req, data) => ({
            email: data?.data?.email || req.body?.email,
            phone: data?.data?.phone || req.body?.phone,
            success: data?.success
        })
    );
};

/**
 * Audit middleware for complaint operations
 */
export const auditComplaint = (action) => {
    return auditLog(
        action,
        'complaint',
        (req, data) => data?.data?._id || data?.data?.id || req.params?.id,
        (req, data) => ({
            title: data?.data?.title || req.body?.title,
            category: data?.data?.category || req.body?.category,
            status: data?.data?.status || req.body?.status
        })
    );
};

/**
 * Audit middleware for admin operations
 */
export const auditAdmin = (action, resourceType = 'admin') => {
    return auditLog(
        action,
        resourceType,
        (req, data) => req.params?.id || data?.data?._id,
        (req, data) => ({
            ...req.body,
            performedBy: req.user?.id
        })
    );
};

/**
 * Audit middleware for profile updates
 */
export const auditProfile = (action) => {
    return auditLog(
        action,
        'user',
        (req, data) => req.user?.id,
        (req, data) => {
            // Don't log sensitive data like passwords
            const { password, oldPassword, newPassword, ...safeData } = req.body;
            return safeData;
        }
    );
};

/**
 * Audit middleware for media operations
 */
export const auditMedia = (action) => {
    return auditLog(
        action,
        'media',
        (req, data) => data?.data?._id || req.params?.id,
        (req, data) => ({
            fileCount: req.files?.length || 0,
            fileTypes: req.files?.map(f => f.mimetype) || [],
            totalSize: req.files?.reduce((sum, f) => sum + f.size, 0) || 0
        })
    );
};

/**
 * Audit middleware for password changes
 */
export const auditPasswordChange = () => {
    return auditLog(
        'change_password',
        'user',
        (req, data) => req.user?.id,
        (req, data) => ({
            method: req.body?.resetToken ? 'reset' : 'change',
            timestamp: new Date().toISOString()
        })
    );
};

/**
 * Audit middleware for status changes
 */
export const auditStatusChange = (resourceType) => {
    return auditLog(
        'change_status',
        resourceType,
        (req, data) => req.params?.id,
        (req, data) => ({
            oldStatus: data?.data?.previousStatus,
            newStatus: req.body?.status || data?.data?.status,
            reason: req.body?.reason
        })
    );
};

/**
 * Audit middleware for assignment operations
 */
export const auditAssignment = () => {
    return auditLog(
        'assign_complaint',
        'complaint',
        (req, data) => req.params?.id || req.params?.complaintId,
        (req, data) => ({
            assignedTo: req.body?.assignedTo,
            department: req.body?.department,
            priority: req.body?.priority
        })
    );
};

/**
 * Audit middleware for deletion operations
 */
export const auditDelete = (resourceType) => {
    return auditLog(
        `delete_${resourceType}`,
        resourceType,
        (req, data) => req.params?.id,
        (req, data) => ({
            deletedAt: new Date().toISOString(),
            deletedBy: req.user?.id
        })
    );
};

/**
 * Audit middleware for system configuration changes
 */
export const auditSystemConfig = () => {
    return auditLog(
        'system_config',
        'system',
        null,
        (req, data) => ({
            configKey: req.body?.key || req.params?.key,
            action: req.method,
            path: req.path
        })
    );
};

export default {
    auditLog,
    auditAuth,
    auditComplaint,
    auditAdmin,
    auditProfile,
    auditMedia,
    auditPasswordChange,
    auditStatusChange,
    auditAssignment,
    auditDelete,
    auditSystemConfig
};
