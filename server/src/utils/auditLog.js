/**
 * Audit Logging System
 * TASK-011: Comprehensive audit logging for all data modifications
 */

import logger from './logger.js';

/**
 * Audit log levels
 */
export const AUDIT_LEVELS = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical'
};

/**
 * Audit event types
 */
export const AUDIT_EVENTS = {
    // Authentication
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    LOGOUT: 'auth.logout',
    PASSWORD_CHANGE: 'auth.password.change',
    PASSWORD_RESET: 'auth.password.reset',

    // User management
    USER_CREATE: 'user.create',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    USER_BAN: 'user.ban',
    USER_UNBAN: 'user.unban',

    // Complaint management
    COMPLAINT_CREATE: 'complaint.create',
    COMPLAINT_UPDATE: 'complaint.update',
    COMPLAINT_DELETE: 'complaint.delete',
    COMPLAINT_STATUS_CHANGE: 'complaint.status.change',
    COMPLAINT_ASSIGN: 'complaint.assign',

    // Admin actions
    ADMIN_CREATE: 'admin.create',
    ADMIN_UPDATE: 'admin.update',
    ADMIN_DELETE: 'admin.delete',
    ADMIN_APPROVE: 'admin.approve',
    ADMIN_REJECT: 'admin.reject',
    ADMIN_ROLE_CHANGE: 'admin.role.change',

    // System events
    SYSTEM_CONFIG_CHANGE: 'system.config.change',
    SYSTEM_MAINTENANCE: 'system.maintenance',

    // Security events
    SECURITY_BREACH_ATTEMPT: 'security.breach.attempt',
    SECURITY_RATE_LIMIT: 'security.rate_limit',
    SECURITY_INVALID_TOKEN: 'security.invalid_token',
    SECURITY_PERMISSION_DENIED: 'security.permission.denied'
};

/**
 * Log an audit event
 * @param {Object} params - Audit log parameters
 */
export const auditLog = ({
    event,
    level = AUDIT_LEVELS.INFO,
    userId = null,
    userRole = null,
    resourceType = null,
    resourceId = null,
    action = null,
    changes = null,
    ip = null,
    userAgent = null,
    metadata = {}
}) => {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        event,
        level,
        user: {
            id: userId,
            role: userRole
        },
        resource: {
            type: resourceType,
            id: resourceId
        },
        action,
        changes,
        request: {
            ip,
            userAgent
        },
        metadata
    };

    // Log to Winston with special audit category
    logger.info('AUDIT', auditEntry);

    // TODO: Store in dedicated audit log database/table for compliance
    // await AuditLog.create(auditEntry);

    return auditEntry;
};

/**
 * Middleware to automatically log API requests
 */
export const auditMiddleware = (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;

    // Override end function to log after response
    res.end = function (...args) {
        // Only log state-changing operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            auditLog({
                event: `api.${req.method.toLowerCase()}.${req.path.replace(/\//g, '.')}`,
                level: res.statusCode >= 400 ? AUDIT_LEVELS.WARNING : AUDIT_LEVELS.INFO,
                userId: req.user?.id || req.user?._id?.toString(),
                userRole: req.user?.role,
                action: `${req.method} ${req.path}`,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                metadata: {
                    statusCode: res.statusCode,
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    // Don't log sensitive body data
                    bodyKeys: req.body ? Object.keys(req.body) : []
                }
            });
        }

        // Call original end function
        originalEnd.apply(res, args);
    };

    next();
};

/**
 * Log authentication event
 */
export const auditAuth = (event, userId, success, ip, userAgent, metadata = {}) => {
    return auditLog({
        event,
        level: success ? AUDIT_LEVELS.INFO : AUDIT_LEVELS.WARNING,
        userId,
        action: event,
        ip,
        userAgent,
        metadata: {
            success,
            ...metadata
        }
    });
};

/**
 * Log data modification
 */
export const auditDataChange = (event, userId, userRole, resourceType, resourceId, changes, ip) => {
    return auditLog({
        event,
        level: AUDIT_LEVELS.INFO,
        userId,
        userRole,
        resourceType,
        resourceId,
        action: event,
        changes,
        ip
    });
};

/**
 * Log security event
 */
export const auditSecurity = (event, userId, ip, userAgent, metadata = {}) => {
    return auditLog({
        event,
        level: AUDIT_LEVELS.CRITICAL,
        userId,
        action: event,
        ip,
        userAgent,
        metadata
    });
};

export default {
    AUDIT_LEVELS,
    AUDIT_EVENTS,
    auditLog,
    auditMiddleware,
    auditAuth,
    auditDataChange,
    auditSecurity
};
