import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import { connectDatabase, closeDatabase } from '../config/database.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import { generateAdminId, getDefaultPermissions } from '../utils/adminUtils.js';

dotenv.config();

const ADMIN_TYPES = ['admin', 'super_admin'];

const cleanPermissions = (permissions = {}, role = 'viewer') => {
    const defaults = getDefaultPermissions(role);
    return Object.fromEntries(Object.keys(defaults).map(key => [key, permissions[key] ?? defaults[key]]));
};

export async function migrateAdminUsersToAdmins({ logger = console } = {}) {
    const legacyUsers = await User.collection.find({ userType: { $in: ADMIN_TYPES } }).toArray();
    const result = { found: legacyUsers.length, migrated: 0, reconciled: 0, conflicts: 0, errors: 0 };

    for (const user of legacyUsers) {
        try {
            if (!user.firstName || !user.lastName || !user.email || !user.phone || !user.password) {
                throw new Error('Legacy record is missing a required administrator identity field');
            }
            const migrated = await Admin.findOne({ legacyUserId: user._id }).select('+legacyUserId');
            if (migrated) {
                await User.collection.deleteOne({ _id: user._id, userType: { $in: ADMIN_TYPES } });
                result.reconciled += 1;
                continue;
            }

            const collision = await Admin.findOne({
                $or: [
                    ...(user.email ? [{ email: user.email.toLowerCase() }] : []),
                    ...(user.phone ? [{ phone: user.phone }] : []),
                    ...(user.adminProfile?.employeeId ? [{ employeeId: user.adminProfile.employeeId }] : [])
                ]
            }).select('_id');
            if (collision) {
                result.conflicts += 1;
                logger.error(`Legacy administrator ${user._id} conflicts with an existing Admin; it was not deleted`);
                continue;
            }

            const role = user.userType === 'super_admin'
                ? 'super_admin'
                : (user.adminProfile?.role || 'viewer');
            await Admin.collection.insertOne({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email?.toLowerCase(),
                phone: user.phone,
                password: user.password,
                adminId: user.adminProfile?.adminId || await generateAdminId(),
                legacyUserId: user._id,
                ...(user.adminProfile?.employeeId ? { employeeId: user.adminProfile.employeeId } : {}),
                ...(user.adminProfile?.department ? { department: user.adminProfile.department.toString() } : {}),
                ...(user.adminProfile?.designation ? { designation: user.adminProfile.designation } : {}),
                role,
                status: user.status || 'pending',
                permissions: cleanPermissions(user.adminProfile?.permissions, role),
                ...(user.adminProfile?.approvedAt ? { approvedAt: user.adminProfile.approvedAt } : {}),
                ...(user.adminProfile?.rejectedAt ? { rejectedAt: user.adminProfile.rejectedAt } : {}),
                ...(user.adminProfile?.rejectionReason ? { rejectionReason: user.adminProfile.rejectionReason } : {}),
                createdAt: user.createdAt || new Date(),
                updatedAt: new Date()
            });

            const deletion = await User.collection.deleteOne({
                _id: user._id,
                userType: { $in: ADMIN_TYPES }
            });
            if (deletion.deletedCount !== 1) {
                throw new Error(`Migrated Admin ${user._id}, but could not remove its legacy User record`);
            }
            result.migrated += 1;
        } catch (error) {
            result.errors += 1;
            logger.error(`Failed to migrate legacy administrator ${user._id}: ${error.message}`);
        }
    }

    return result;
}

async function run() {
    try {
        await connectDatabase();
        const result = await migrateAdminUsersToAdmins();
        console.log('Administrator identity migration result:', result);
        if (result.conflicts || result.errors) process.exitCode = 1;
    } catch (error) {
        console.error('Administrator identity migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await closeDatabase();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await run();
}
