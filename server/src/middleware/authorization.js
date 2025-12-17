/**
 * Authorization Middleware
 * Prevents Insecure Direct Object Reference (IDOR) vulnerabilities
 * Ensures users can only access resources they own or are authorized to access
 */

import logger from '../utils/logger.js';

/**
 * Check if user can access a complaint
 * Users can access:
 * - Their own complaints
 * - Public complaints (for viewing)
 * Admins can access all complaints
 */
export const canAccessComplaint = async (req, res, next) => {
    try {
        const complaintId = req.params.id || req.params.complaintId;
        const userId = req.user?.id;
        const userRole = req.user?.userType;

        if (!complaintId) {
            return res.status(400).json({
                success: false,
                message: 'Complaint ID is required'
            });
        }

        // Import Complaint model dynamically to avoid circular dependencies
        const { default: Complaint } = await import('../models/Complaint.js');

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            logger.warn('Complaint not found', { complaintId, userId });
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Admins can access all complaints
        if (userRole === 'admin' || userRole === 'super_admin') {
            req.complaint = complaint;
            return next();
        }

        // Users can only access their own complaints
        if (complaint.user && complaint.user.toString() === userId) {
            req.complaint = complaint;
            return next();
        }

        // Guest complaints can be accessed by anyone (read-only)
        if (!complaint.user && req.method === 'GET') {
            req.complaint = complaint;
            return next();
        }

        // Unauthorized access attempt
        logger.warn('Unauthorized complaint access attempt', {
            userId,
            userRole,
            complaintId,
            complaintOwner: complaint.user,
            method: req.method,
            ip: req.ip
        });

        return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this complaint'
        });
    } catch (error) {
        logger.error('Authorization check error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            complaintId: req.params.id || req.params.complaintId
        });

        return res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};

/**
 * Check if user can modify a complaint
 * Only complaint owner or admins can modify
 */
export const canModifyComplaint = async (req, res, next) => {
    try {
        const complaintId = req.params.id || req.params.complaintId;
        const userId = req.user?.id;
        const userRole = req.user?.userType;

        if (!complaintId) {
            return res.status(400).json({
                success: false,
                message: 'Complaint ID is required'
            });
        }

        const { default: Complaint } = await import('../models/Complaint.js');

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Admins can modify all complaints
        if (userRole === 'admin' || userRole === 'super_admin') {
            req.complaint = complaint;
            return next();
        }

        // Users can only modify their own complaints
        if (complaint.user && complaint.user.toString() === userId) {
            req.complaint = complaint;
            return next();
        }

        logger.warn('Unauthorized complaint modification attempt', {
            userId,
            userRole,
            complaintId,
            complaintOwner: complaint.user,
            ip: req.ip
        });

        return res.status(403).json({
            success: false,
            message: 'You do not have permission to modify this complaint'
        });
    } catch (error) {
        logger.error('Authorization check error', {
            error: error.message,
            userId: req.user?.id,
            complaintId: req.params.id || req.params.complaintId
        });

        return res.status(500).json({
            success: false,
            message: 'Authorization check failed'
        });
    }
};

/**
 * Check if user can access another user's profile
 * Users can only access their own profile
 * Admins can access all profiles
 */
export const canAccessUserProfile = (req, res, next) => {
    const requestedUserId = req.params.userId || req.params.id;
    const currentUserId = req.user?.id;
    const userRole = req.user?.userType;

    // Admins can access all profiles
    if (userRole === 'admin' || userRole === 'super_admin') {
        return next();
    }

    // Users can only access their own profile
    if (requestedUserId === currentUserId) {
        return next();
    }

    logger.warn('Unauthorized profile access attempt', {
        currentUserId,
        requestedUserId,
        userRole,
        ip: req.ip
    });

    return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this profile'
    });
};

/**
 * Check if user can modify another user's profile
 * Users can only modify their own profile
 * Admins can modify profiles based on their permissions
 */
export const canModifyUserProfile = (req, res, next) => {
    const requestedUserId = req.params.userId || req.params.id;
    const currentUserId = req.user?.id;
    const userRole = req.user?.userType;

    // Super admins can modify all profiles
    if (userRole === 'super_admin') {
        return next();
    }

    // Regular admins can modify user profiles but not other admin profiles
    if (userRole === 'admin') {
        // Additional check needed: ensure target user is not an admin
        // This will be handled in the controller
        return next();
    }

    // Users can only modify their own profile
    if (requestedUserId === currentUserId) {
        return next();
    }

    logger.warn('Unauthorized profile modification attempt', {
        currentUserId,
        requestedUserId,
        userRole,
        ip: req.ip
    });

    return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this profile'
    });
};

/**
 * Prevent profile enumeration
 * Ensures users cannot iterate through user IDs to discover accounts
 */
export const preventProfileEnumeration = (req, res, next) => {
    const requestedUserId = req.params.userId || req.params.id;
    const currentUserId = req.user?.id;
    const userRole = req.user?.userType;

    // Only allow access if:
    // 1. User is accessing their own profile
    // 2. User is an admin
    // 3. Request comes from a trusted source (e.g., internal API)

    if (userRole === 'admin' || userRole === 'super_admin' || requestedUserId === currentUserId) {
        return next();
    }

    // For unauthorized access, return generic "not found" instead of "forbidden"
    // This prevents attackers from knowing if a user ID exists
    logger.warn('Profile enumeration attempt detected', {
        currentUserId,
        requestedUserId,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    return res.status(404).json({
        success: false,
        message: 'User not found'
    });
};

/**
 * Check if user owns a resource (generic)
 * @param {String} resourceModel - Model name (e.g., 'Complaint', 'Comment')
 * @param {String} resourceIdParam - Parameter name for resource ID
 * @param {String} ownerField - Field name that contains owner ID (default: 'user')
 */
export const canAccessResource = (resourceModel, resourceIdParam = 'id', ownerField = 'user') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const userId = req.user?.id;
            const userRole = req.user?.userType;

            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource ID is required'
                });
            }

            // Import model dynamically
            const { default: Model } = await import(`../models/${resourceModel}.js`);

            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: `${resourceModel} not found`
                });
            }

            // Admins can access all resources
            if (userRole === 'admin' || userRole === 'super_admin') {
                req[resourceModel.toLowerCase()] = resource;
                return next();
            }

            // Check ownership
            const ownerId = resource[ownerField]?.toString();
            if (ownerId === userId) {
                req[resourceModel.toLowerCase()] = resource;
                return next();
            }

            logger.warn('Unauthorized resource access attempt', {
                userId,
                userRole,
                resourceModel,
                resourceId,
                ownerId,
                ip: req.ip
            });

            return res.status(403).json({
                success: false,
                message: `You do not have permission to access this ${resourceModel.toLowerCase()}`
            });
        } catch (error) {
            logger.error('Resource authorization check error', {
                error: error.message,
                resourceModel,
                resourceId: req.params[resourceIdParam],
                userId: req.user?.id
            });

            return res.status(500).json({
                success: false,
                message: 'Authorization check failed'
            });
        }
    };
};

export default {
    canAccessComplaint,
    canModifyComplaint,
    canAccessUserProfile,
    canModifyUserProfile,
    preventProfileEnumeration,
    canAccessResource
};
