/**
 * Notification Service
 * Handles email and SMS notifications for admin workflows
 */

import logger from '../utils/logger.js';

/**
 * Send approval notification to admin
 * @param {Object} admin - Admin object
 * @param {String} role - Assigned role
 */
export const sendAdminApprovalEmail = async (admin, role) => {
    try {
        // In production, integrate with Nodemailer or email service
        // For now, log to console
        const emailContent = {
            to: admin.email,
            subject: '✅ Your Admin Account Has Been Approved - Meri Shikayat',
            body: `
Dear ${admin.firstName} ${admin.lastName},

Congratulations! Your admin account has been approved.

Account Details:
- Admin ID: ${admin.adminId}
- Email: ${admin.email}
- Assigned Role: ${role.toUpperCase()}
- Status: Active

You can now login to the admin portal at:
http://localhost:3000/admin/login

Your credentials:
- Email: ${admin.email}
- Password: [Use the password you set during registration]

Next Steps:
1. Login to the admin portal
2. Complete the 2-step OTP verification
3. Start managing complaints based on your assigned permissions

If you have any questions, please contact the Super Admin.

Best regards,
Meri Shikayat Team
            `
        };

        logger.info('Admin approval notification prepared', {
            adminId: admin.adminId,
            email: admin.email.split('@')[1],
            role
        });

        return { success: true, message: 'Approval notification sent' };
    } catch (error) {
        logger.error('Error sending approval notification', { error: error.message });
        return { success: false, message: 'Failed to send notification' };
    }
};

/**
 * Send rejection notification to admin
 * @param {Object} admin - Admin object
 * @param {String} reason - Rejection reason
 */
export const sendAdminRejectionEmail = async (admin, reason) => {
    try {
        const emailContent = {
            to: admin.email,
            subject: '❌ Admin Account Application Status - Meri Shikayat',
            body: `
Dear ${admin.firstName} ${admin.lastName},

We regret to inform you that your admin account application has been rejected.

Application Details:
- Admin ID: ${admin.adminId}
- Email: ${admin.email}
- Application Date: ${new Date(admin.createdAt).toLocaleDateString()}

Reason for Rejection:
${reason}

What You Can Do:
- Review the rejection reason carefully
- Address the concerns mentioned
- Submit a new application if eligible
- Contact the Super Admin for clarification

If you believe this decision was made in error, please reach out to the Super Admin.

Best regards,
Meri Shikayat Team
            `
        };

        logger.info('Admin rejection notification prepared', {
            adminId: admin.adminId,
            email: admin.email.split('@')[1]
        });

        return { success: true, message: 'Rejection notification sent' };
    } catch (error) {
        logger.error('Error sending rejection notification', { error: error.message });
        return { success: false, message: 'Failed to send notification' };
    }
};
