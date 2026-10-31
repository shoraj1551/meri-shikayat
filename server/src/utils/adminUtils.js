/**
 * Admin utilities
 */

import Admin from '../models/Admin.js';
import User from '../models/User.js';

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
 * Create every administrator registration in the canonical Admin collection.
 * User is checked only to prevent cross-store identity collisions while legacy
 * unified administrator records are being migrated.
 */
export const createPendingAdmin = async ({
    firstName,
    lastName,
    email,
    phone,
    password,
    department,
    designation,
    employeeId
}) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = phone?.trim();
    const normalizedEmployeeId = employeeId?.trim() || undefined;
    const identityConditions = [
        { email: normalizedEmail },
        { phone: normalizedPhone }
    ];
    if (normalizedEmployeeId) identityConditions.push({ employeeId: normalizedEmployeeId });

    const [existingAdmin, existingUser] = await Promise.all([
        Admin.findOne({ $or: identityConditions }).select('_id'),
        User.findOne({
            $or: [
                { email: normalizedEmail },
                { phone: normalizedPhone },
                ...(normalizedEmployeeId ? [{ 'adminProfile.employeeId': normalizedEmployeeId }] : [])
            ]
        }).select('_id')
    ]);
    if (existingAdmin || existingUser) {
        const error = new Error('An account with this email, phone, or employee ID already exists');
        error.code = 'ADMIN_IDENTITY_EXISTS';
        throw error;
    }

    return Admin.create({
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password,
        adminId: await generateAdminId(),
        employeeId: normalizedEmployeeId,
        department,
        designation,
        role: 'viewer',
        status: 'pending',
        permissions: getDefaultPermissions('viewer')
    });
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
