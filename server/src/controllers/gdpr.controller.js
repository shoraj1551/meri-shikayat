/**
 * GDPR Compliance Controller
 * TASK-028: Implement data export, deletion, and consent management
 */

import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import logger from '../utils/logger.js';
import { auditLog, AUDIT_EVENTS } from '../utils/auditLog.js';

/**
 * Export user data (GDPR Right to Data Portability)
 */
export const exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Gather all user data
        const user = await User.findById(userId).select('-password -twoFactorSecret');
        const complaints = await Complaint.find({ user: userId });

        const userData = {
            personal: user.toObject(),
            complaints: complaints.map(c => c.toObject()),
            exportDate: new Date().toISOString(),
            format: 'JSON'
        };

        auditLog({
            event: AUDIT_EVENTS.USER_UPDATE,
            userId,
            action: 'GDPR Data Export',
            ip: req.ip
        });

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        logger.error('Data export failed', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to export data'
        });
    }
};

/**
 * Delete user account (GDPR Right to Erasure)
 */
export const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { confirmation } = req.body;

        if (confirmation !== 'DELETE MY ACCOUNT') {
            return res.status(400).json({
                success: false,
                message: 'Invalid confirmation phrase'
            });
        }

        // Anonymize user data instead of hard delete (for audit trail)
        await User.findByIdAndUpdate(userId, {
            firstName: 'Deleted',
            lastName: 'User',
            email: `deleted_${userId}@deleted.com`,
            phone: null,
            isDeleted: true,
            deletedAt: new Date()
        });

        // Anonymize complaints
        await Complaint.updateMany(
            { user: userId },
            { isAnonymous: true }
        );

        auditLog({
            event: AUDIT_EVENTS.USER_DELETE,
            userId,
            action: 'GDPR Account Deletion',
            ip: req.ip
        });

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        logger.error('Account deletion failed', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
};

/**
 * Get user consent status
 */
export const getConsentStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('consent');

        res.json({
            success: true,
            consent: user.consent || {
                marketing: false,
                analytics: false,
                thirdParty: false
            }
        });
    } catch (error) {
        logger.error('Get consent failed', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get consent status'
        });
    }
};

/**
 * Update user consent
 */
export const updateConsent = async (req, res) => {
    try {
        const { marketing, analytics, thirdParty } = req.body;

        await User.findByIdAndUpdate(req.user.id, {
            consent: {
                marketing: marketing || false,
                analytics: analytics || false,
                thirdParty: thirdParty || false,
                updatedAt: new Date()
            }
        });

        auditLog({
            event: AUDIT_EVENTS.USER_UPDATE,
            userId: req.user.id,
            action: 'Consent Updated',
            changes: { marketing, analytics, thirdParty },
            ip: req.ip
        });

        res.json({
            success: true,
            message: 'Consent preferences updated'
        });
    } catch (error) {
        logger.error('Update consent failed', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to update consent'
        });
    }
};

export default {
    exportUserData,
    deleteUserAccount,
    getConsentStatus,
    updateConsent
};
