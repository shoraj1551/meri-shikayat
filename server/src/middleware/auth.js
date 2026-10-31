/**
 * Authentication middleware
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { hasPermission } from '../utils/adminUtils.js';
import logger from '../utils/logger.js';

function getAccessTokenSubject(decoded) {
    // Existing login/admin tokens predate the explicit type claim. They remain
    // valid, while refresh/reset tokens must never authenticate HTTP requests.
    if (decoded.type && decoded.type !== 'access') return null;
    if (decoded.id) return decoded.id;

    // Transitional support for access tokens issued by the old refresh flow.
    return decoded.type === 'access' ? decoded.userId : null;
}

export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = getAccessTokenSubject(decoded);

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            // Get user from token
            req.user = await User.findById(userId).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (req.user.isDeleted || req.user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            if ((decoded.tokenVersion || 0) !== (req.user.tokenVersion || 0)) {
                return res.status(401).json({
                    success: false,
                    message: 'Token has been revoked'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Protect routes - Verify JWT token for Admins
export const protectAdmin = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const adminId = getAccessTokenSubject(decoded);

            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            // Get admin from token
            req.admin = await Admin.findById(adminId).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Check if admin is active
            if (req.admin.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your account status is ${req.admin.status}`
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in admin authentication'
        });
    }
};

// Require Super Admin role
export const requireSuperAdmin = (req, res, next) => {
    if (req.admin && req.admin.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin privileges required.'
        });
    }
};

// Require specific permission
export const requirePermission = (permission) => {
    const permissionGuard = (req, res, next) => {
        if (!req.admin) {
            logger.security('Admin permission check failed without authentication context', {
                permission,
                ip: req.ip,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                message: 'Administrator authentication required'
            });
        }

        if (hasPermission(req.admin, permission)) {
            return next();
        }

        logger.security('Admin permission denied', {
            adminId: req.admin._id,
            role: req.admin.role,
            permission,
            ip: req.ip,
            path: req.path
        });
        return res.status(403).json({
            success: false,
            message: `Access denied. Missing permission: ${permission}`
        });
    };

    // Expose non-sensitive metadata so route-policy tests can detect accidental removal.
    permissionGuard.requiredPermission = permission;
    return permissionGuard;
};
