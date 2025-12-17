/**
 * RBAC (Role-Based Access Control) Middleware
 * TASK-008: Enforce permission checks on all admin routes
 */

import logger from '../utils/logger.js';

// Define role hierarchy
export const ROLES = {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
};

// Define permissions for each role
export const PERMISSIONS = {
    // Complaint permissions
    'complaint:create': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'complaint:read': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'complaint:update:own': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'complaint:update:any': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'complaint:delete:own': [ROLES.USER],
    'complaint:delete:any': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'complaint:assign': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],

    // User permissions
    'user:read:own': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'user:read:any': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'user:update:own': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'user:update:any': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'user:delete:any': [ROLES.SUPER_ADMIN],
    'user:ban': [ROLES.ADMIN, ROLES.SUPER_ADMIN],

    // Admin permissions
    'admin:create': [ROLES.SUPER_ADMIN],
    'admin:read': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'admin:update': [ROLES.SUPER_ADMIN],
    'admin:delete': [ROLES.SUPER_ADMIN],
    'admin:approve': [ROLES.SUPER_ADMIN],
    'admin:reject': [ROLES.SUPER_ADMIN],

    // Department permissions
    'department:create': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'department:update': [ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'department:delete': [ROLES.SUPER_ADMIN],

    // Analytics permissions
    'analytics:view': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
    'analytics:export': [ROLES.ADMIN, ROLES.SUPER_ADMIN],

    // System permissions
    'system:settings': [ROLES.SUPER_ADMIN],
    'system:logs': [ROLES.ADMIN, ROLES.SUPER_ADMIN]
};

/**
 * Check if user has required permission
 * @param {Object} user - User object with role
 * @param {string} permission - Required permission
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (user, permission) => {
    if (!user || !user.role) {
        return false;
    }

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        logger.warn('Unknown permission requested', { permission });
        return false;
    }

    return allowedRoles.includes(user.role);
};

/**
 * Middleware to require specific permission
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            logger.security('Permission check failed - no user', {
                permission,
                ip: req.ip,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!hasPermission(req.user, permission)) {
            logger.security('Permission denied', {
                userId: req.user.id,
                userRole: req.user.role,
                permission,
                ip: req.ip,
                path: req.path
            });
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
                requiredPermission: permission
            });
        }

        next();
    };
};

/**
 * Middleware to require specific role
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 */
export const requireRole = (roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.user) {
            logger.security('Role check failed - no user', {
                requiredRoles: allowedRoles,
                ip: req.ip,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.security('Role check failed', {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                ip: req.ip,
                path: req.path
            });
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                requiredRole: allowedRoles.length === 1 ? allowedRoles[0] : allowedRoles
            });
        }

        next();
    };
};

/**
 * Middleware to check if user owns the resource
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from req
 * @returns {Function} Express middleware
 */
export const requireOwnership = (getResourceOwnerId) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const resourceOwnerId = getResourceOwnerId(req);

        // Super admins can access any resource
        if (req.user.role === ROLES.SUPER_ADMIN) {
            return next();
        }

        // Admins can access any resource
        if (req.user.role === ROLES.ADMIN) {
            return next();
        }

        // Check ownership
        if (req.user.id !== resourceOwnerId && req.user._id?.toString() !== resourceOwnerId?.toString()) {
            logger.security('Ownership check failed', {
                userId: req.user.id,
                resourceOwnerId,
                ip: req.ip,
                path: req.path
            });
            return res.status(403).json({
                success: false,
                message: 'You can only access your own resources'
            });
        }

        next();
    };
};

export default {
    ROLES,
    PERMISSIONS,
    hasPermission,
    requirePermission,
    requireRole,
    requireOwnership
};
