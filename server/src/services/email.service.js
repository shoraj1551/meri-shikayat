/**
 * Email Service
 * Handles sending emails using NodeMailer
 */

import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Create transporter (only if email credentials are configured)
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
} else {
    logger.warn('Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
}

/**
 * Send OTP email for password reset
 */
export async function sendPasswordResetOTP(email, otp, firstName) {
    if (!transporter) {
        logger.warn('Email not configured - running in demo mode', { email: email.split('@')[1] });
        return { success: true, messageId: 'demo-mode' };
    }

    const mailOptions = {
        from: `Meri Shikayat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - Meri Shikayat',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>${firstName}</strong>,</p>
                        <p>We received a request to reset your password for your Meri Shikayat account.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your OTP is:</p>
                            <div class="otp">${otp}</div>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 5 minutes</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong><br>
                            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                        </div>
                        
                        <p>For security reasons, this OTP will expire in <strong>5 minutes</strong>.</p>
                        
                        <p>Best regards,<br><strong>Meri Shikayat Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply.</p>
                        <p>&copy; ${new Date().getFullYear()} Meri Shikayat. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info('Password reset email sent', { messageId: info.messageId, emailDomain: email.split('@')[1] });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error sending email', { error: error.message, stack: error.stack });
        throw new Error('Failed to send email');
    }
}

/**
 * Send OTP email for account verification
 */
export async function sendVerificationOTP(email, otp, firstName) {
    if (!transporter) {
        logger.warn('Email not configured - verification OTP in demo mode', { email: email.split('@')[1] });
        return { success: true, messageId: 'demo-mode' };
    }

    const mailOptions = {
        from: `Meri Shikayat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - Meri Shikayat',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>${firstName}</strong>,</p>
                        <p>Welcome to Meri Shikayat! Please verify your email address to complete your registration.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your verification OTP is:</p>
                            <div class="otp">${otp}</div>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 5 minutes</p>
                        </div>
                        
                        <p>If you didn't create an account with Meri Shikayat, please ignore this email.</p>
                        
                        <p>Best regards,<br><strong>Meri Shikayat Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply.</p>
                        <p>&copy; ${new Date().getFullYear()} Meri Shikayat. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info('Verification email sent', { messageId: info.messageId, emailDomain: email.split('@')[1] });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error sending verification email', { error: error.message, stack: error.stack });
        throw new Error('Failed to send verification email');
    }
}

/**
 * Send password reset confirmation email
 */
export async function sendPasswordResetConfirmation(email, firstName) {
    const mailOptions = {
        from: `Meri Shikayat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Successful - Meri Shikayat',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .success-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Password Reset Successful</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>${firstName}</strong>,</p>
                        
                        <div class="success-box">
                            <h2 style="color: #059669; margin: 0;">Your password has been successfully reset!</h2>
                        </div>
                        
                        <p>You can now login to your Meri Shikayat account with your new password.</p>
                        
                        <p>If you did not make this change, please contact our support team immediately.</p>
                        
                        <p>Best regards,<br><strong>Meri Shikayat Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Meri Shikayat. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info('Password reset confirmation sent', { messageId: info.messageId });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error('Error sending confirmation email', { error: error.message });
        // Don't throw error for confirmation emails
        return { success: false };
    }
}

/**
 * Test email configuration
 */
export async function testEmailConfig() {
    try {
        await transporter.verify();
        logger.info('Email service is ready');
        return true;
    } catch (error) {
        logger.error('Email service error', { error: error.message });
        return false;
    }
}
