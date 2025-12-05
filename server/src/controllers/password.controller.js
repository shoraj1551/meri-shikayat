/**
 * Password Reset Controller
 * Handles forgot password flow: request OTP, verify OTP, reset password
 */

import User from '../models/User.js';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired, isMaxAttemptsExceeded } from '../services/otp.service.js';
import { generateResetToken, verifyResetToken } from '../services/token.service.js';
import { sendPasswordResetOTP, sendPasswordResetConfirmation } from '../services/email.service.js';

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
export async function requestPasswordReset(req, res) {
    try {
        const { identifier } = req.body;

        if (!identifier) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        // Find user by email or phone
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { phone: identifier }
            ]
        });

        // Always return success (don't reveal if user exists - security)
        const genericResponse = {
            success: true,
            message: 'If an account exists with this identifier, you will receive an OTP shortly',
            data: {
                expiresIn: 300 // 5 minutes in seconds
            }
        };

        if (!user) {
            return res.status(200).json(genericResponse);
        }

        // Check rate limiting (max 3 requests per hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (user.lastPasswordResetRequest && user.lastPasswordResetRequest > oneHourAgo) {
            const timeSinceLastRequest = Date.now() - user.lastPasswordResetRequest.getTime();
            const requestsInLastHour = timeSinceLastRequest < 60 * 60 * 1000 ? 1 : 0;

            if (requestsInLastHour >= 3) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many password reset requests. Please try again later.'
                });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        // Update user with OTP
        user.passwordResetOTP = hashedOTP;
        user.passwordResetOTPExpiry = getOTPExpiry();
        user.passwordResetAttempts = 0;
        user.lastPasswordResetRequest = new Date();
        await user.save();

        // Send OTP via email or SMS
        if (user.email) {
            await sendPasswordResetOTP(user.email, otp, user.firstName);
            console.log(`🔐 Password Reset OTP sent to ${user.email}: ${otp}`);
        } else {
            // TODO: Implement SMS sending when Twilio is configured
            console.log(`🔐 Password Reset OTP (SMS not configured): ${otp}`);
        }

        res.status(200).json(genericResponse);
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
}

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify OTP and get reset token
 * @access  Public
 */
export async function verifyResetOTP(req, res) {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Identifier and OTP are required'
            });
        }

        // Find user
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { phone: identifier }
            ]
        });

        if (!user || !user.passwordResetOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Check if max attempts exceeded
        if (isMaxAttemptsExceeded(user.passwordResetAttempts)) {
            user.passwordResetOTP = undefined;
            user.passwordResetOTPExpiry = undefined;
            user.passwordResetAttempts = 0;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Maximum OTP verification attempts exceeded. Please request a new OTP.'
            });
        }

        // Check if OTP expired
        if (isOTPExpired(user.passwordResetOTPExpiry)) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Verify OTP
        const isValid = await verifyOTP(otp, user.passwordResetOTP);

        if (!isValid) {
            user.passwordResetAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${5 - user.passwordResetAttempts} attempts remaining.`
            });
        }

        // OTP verified - generate temporary reset token
        const resetToken = generateResetToken(user._id);

        // Clear OTP (it's been used)
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpiry = undefined;
        user.passwordResetAttempts = 0;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                resetToken
            }
        });
    } catch (error) {
        console.error('Error in verifyResetOTP:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
}

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with reset token
 * @access  Public
 */
export async function resetPassword(req, res) {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = verifyResetToken(resetToken);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password
        user.password = newPassword;
        user.lastPasswordChange = new Date();

        // Invalidate all refresh tokens (force re-login on all devices)
        user.refreshTokens = [];

        await user.save();

        // Send confirmation email
        if (user.email) {
            await sendPasswordResetConfirmation(user.email, user.firstName);
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
}
