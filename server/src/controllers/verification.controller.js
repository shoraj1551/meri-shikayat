/**
 * Verification Controller
 * Handles email and phone OTP verification
 */

import User from '../models/User.js';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired, isMaxAttemptsExceeded } from '../services/otp.service.js';
import { sendVerificationOTP } from '../services/email.service.js';
import { sendOTPSMS, sendVerificationSuccessSMS } from '../services/sms.service.js';

const OTP_RATE_LIMIT_MINUTES = parseInt(process.env.OTP_RATE_LIMIT_MINUTES) || 2;

/**
 * Send Email OTP
 * POST /api/verification/send-email-otp
 */
export async function sendEmailOTP(req, res) {
    try {
        const user = await User.findById(req.user.id);

        if (!user.email) {
            return res.status(400).json({
                success: false,
                message: 'No email address associated with this account'
            });
        }

        if (user.verificationStatus.email) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Check rate limiting
        if (user.lastEmailOTPRequest) {
            const timeSinceLastRequest = (Date.now() - new Date(user.lastEmailOTPRequest)) / (1000 * 60);
            if (timeSinceLastRequest < OTP_RATE_LIMIT_MINUTES) {
                const waitTime = Math.ceil(OTP_RATE_LIMIT_MINUTES - timeSinceLastRequest);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitTime} minute(s) before requesting another OTP`
                });
            }
        }

        // Generate and hash OTP
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        // Update user
        user.emailVerificationOTP = hashedOTP;
        user.emailVerificationOTPExpiry = getOTPExpiry();
        user.emailVerificationAttempts = 0;
        user.lastEmailOTPRequest = new Date();
        await user.save();

        // Send OTP via email
        await sendVerificationOTP(user.email, otp, user.firstName);

        res.json({
            success: true,
            message: 'OTP sent to your email address',
            email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
        });
    } catch (error) {
        console.error('Send email OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
}

/**
 * Verify Email OTP
 * POST /api/verification/verify-email
 */
export async function verifyEmail(req, res) {
    try {
        const { otp } = req.body;

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit OTP'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user.emailVerificationOTP) {
            return res.status(400).json({
                success: false,
                message: 'No OTP request found. Please request a new OTP.'
            });
        }

        if (user.verificationStatus.email) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Check if OTP expired
        if (isOTPExpired(user.emailVerificationOTPExpiry)) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check max attempts
        if (isMaxAttemptsExceeded(user.emailVerificationAttempts)) {
            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isValid = await verifyOTP(otp, user.emailVerificationOTP);

        if (!isValid) {
            user.emailVerificationAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.',
                attemptsLeft: 5 - user.emailVerificationAttempts
            });
        }

        // Mark email as verified
        user.verificationStatus.email = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationOTPExpiry = undefined;
        user.emailVerificationAttempts = 0;

        // Update overall verification status
        if (user.verificationStatus.email && user.verificationStatus.phone) {
            user.isVerified = true;
        } else if (user.userType === 'general_user' && (user.verificationStatus.email || user.verificationStatus.phone)) {
            user.isVerified = true;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully!',
            verificationStatus: user.verificationStatus
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
}

/**
 * Send Phone OTP
 * POST /api/verification/send-phone-otp
 */
export async function sendPhoneOTP(req, res) {
    try {
        const user = await User.findById(req.user.id);

        if (!user.phone) {
            return res.status(400).json({
                success: false,
                message: 'No phone number associated with this account'
            });
        }

        if (user.verificationStatus.phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is already verified'
            });
        }

        // Check rate limiting
        if (user.lastPhoneOTPRequest) {
            const timeSinceLastRequest = (Date.now() - new Date(user.lastPhoneOTPRequest)) / (1000 * 60);
            if (timeSinceLastRequest < OTP_RATE_LIMIT_MINUTES) {
                const waitTime = Math.ceil(OTP_RATE_LIMIT_MINUTES - timeSinceLastRequest);
                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitTime} minute(s) before requesting another OTP`
                });
            }
        }

        // Generate and hash OTP
        const otp = generateOTP();
        const hashedOTP = await hashOTP(otp);

        // Update user
        user.phoneVerificationOTP = hashedOTP;
        user.phoneVerificationOTPExpiry = getOTPExpiry();
        user.phoneVerificationAttempts = 0;
        user.lastPhoneOTPRequest = new Date();
        await user.save();

        // Send OTP via SMS
        await sendOTPSMS(user.phone, otp);

        res.json({
            success: true,
            message: 'OTP sent to your phone number',
            phone: user.phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') // Mask phone
        });
    } catch (error) {
        console.error('Send phone OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP. Please try again.'
        });
    }
}

/**
 * Verify Phone OTP
 * POST /api/verification/verify-phone
 */
export async function verifyPhone(req, res) {
    try {
        const { otp } = req.body;

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit OTP'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user.phoneVerificationOTP) {
            return res.status(400).json({
                success: false,
                message: 'No OTP request found. Please request a new OTP.'
            });
        }

        if (user.verificationStatus.phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is already verified'
            });
        }

        // Check if OTP expired
        if (isOTPExpired(user.phoneVerificationOTPExpiry)) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check max attempts
        if (isMaxAttemptsExceeded(user.phoneVerificationAttempts)) {
            return res.status(400).json({
                success: false,
                message: 'Maximum verification attempts exceeded. Please request a new OTP.'
            });
        }

        // Verify OTP
        const isValid = await verifyOTP(otp, user.phoneVerificationOTP);

        if (!isValid) {
            user.phoneVerificationAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.',
                attemptsLeft: 5 - user.phoneVerificationAttempts
            });
        }

        // Mark phone as verified
        user.verificationStatus.phone = true;
        user.phoneVerificationOTP = undefined;
        user.phoneVerificationOTPExpiry = undefined;
        user.phoneVerificationAttempts = 0;

        // Update overall verification status
        if (user.verificationStatus.email && user.verificationStatus.phone) {
            user.isVerified = true;
        } else if (user.userType === 'general_user' && (user.verificationStatus.email || user.verificationStatus.phone)) {
            user.isVerified = true;
        }

        await user.save();

        // Send success SMS
        await sendVerificationSuccessSMS(user.phone, user.firstName);

        res.json({
            success: true,
            message: 'Phone number verified successfully!',
            verificationStatus: user.verificationStatus
        });
    } catch (error) {
        console.error('Verify phone error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
}

/**
 * Get Verification Status
 * GET /api/verification/status
 */
export async function getVerificationStatus(req, res) {
    try {
        const user = await User.findById(req.user.id).select('email phone verificationStatus isVerified userType');

        const requiresBoth = ['admin', 'super_admin', 'contractor'].includes(user.userType);

        res.json({
            success: true,
            data: {
                email: user.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
                phone: user.phone ? user.phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') : null,
                verificationStatus: user.verificationStatus,
                isVerified: user.isVerified,
                requiresBoth,
                userType: user.userType
            }
        });
    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch verification status'
        });
    }
}
