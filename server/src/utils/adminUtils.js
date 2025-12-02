/**
 * Admin utilities
 */

import Admin from '../models/Admin.js';

/**
 * Generate a unique Admin ID
 * Format: ADM-YYYY-XXXX (e.g., ADM-2025-0001)
 */
export const generateAdminId = async () => {
    const year = new Date().getFullYear();
    const prefix = `ADM-${year}-`;

    // Find the last admin created this year
    const lastAdmin = await Admin.findOne({
        adminId: { $regex: `^${prefix}` }
    }).sort({ adminId: -1 });

    let sequence = 1;
    if (lastAdmin && lastAdmin.adminId) {
        const lastSequence = parseInt(lastAdmin.adminId.split('-')[2]);
        sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

/**
 * Get default permissions based on role
 */
export const getDefaultPermissions = (role) => {
    const permissions = {
        viewComplaints: false,
        editComplaints: false,
        deleteComplaints: false,
        viewUsers: false,
        editUsers: false,
        deleteUsers: false,
        viewReports: false,
        manageAdmins: false,
        systemSettings: false
    };

    switch (role) {
        case 'super_admin':
            // Enable all permissions
            Object.keys(permissions).forEach(key => {
                permissions[key] = true;
            });
            break;

        case 'manager':
            permissions.viewComplaints = true;
            permissions.editComplaints = true;
            permissions.deleteComplaints = true;
            permissions.viewUsers = true;
            permissions.editUsers = true;
            permissions.deleteUsers = true;
            permissions.viewReports = true;
            break;

        case 'moderator':
            permissions.viewComplaints = true;
            permissions.editComplaints = true;
            permissions.viewUsers = true;
            break;

        case 'viewer':
            permissions.viewComplaints = true;
            break;
    }

    return permissions;
};

/**
 * Check if admin has specific permission
 */
export const hasPermission = (admin, permission) => {
    if (!admin || !admin.permissions) return false;

    // Super admin has all permissions
    if (admin.role === 'super_admin') return true;

    return admin.permissions[permission] === true;
};
