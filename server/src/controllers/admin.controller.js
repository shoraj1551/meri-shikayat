/**
 * Admin Controller
 */

import Admin from '../models/Admin.js';
import PermissionRequest from '../models/PermissionRequest.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { createPendingAdmin, getDefaultPermissions } from '../utils/adminUtils.js';
import jwt from 'jsonwebtoken';
import { sendAdminApprovalEmail, sendAdminRejectionEmail } from '../services/notification.service.js';
import { sendAdminLoginOTP } from '../services/email.service.js';
import {
    generateOTP,
    hashOTP,
    verifyOTP,
    getOTPExpiry,
    isOTPExpired,
    isMaxAttemptsExceeded,
    getOTPConfig
} from '../services/otp.service.js';
import logger from '../utils/logger.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new admin
// @route   POST /api/admin/auth/register
// @access  Public
export const registerAdmin = async (req, res) => {
    try {
        const admin = await createPendingAdmin(req.body);

        if (admin) {
            res.status(201).json({
                success: true,
                message: 'Registration successful. Please wait for super admin approval.',
                data: {
                    _id: admin._id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    adminId: admin.adminId,
                    status: admin.status
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid admin data'
            });
        }
    } catch (error) {
        if (error.code === 'ADMIN_IDENTITY_EXISTS' || error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email, phone, or employee ID already exists'
            });
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login admin (Step 1: Validate credentials & Send OTP)
// @route   POST /api/admin/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Check for admin by email or phone
        const admin = await Admin.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found with this email'
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Password mismatch'
            });
        }

        if (admin && isMatch) {
            // Check status
            if (admin.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your account status is ${admin.status}`
                });
            }

            const otp = generateOTP();
            admin.loginOtp = await hashOTP(otp);
            admin.loginOtpExpires = getOTPExpiry();
            admin.loginOtpAttempts = 0;

            await admin.save();

            const delivery = await sendAdminLoginOTP(admin.email, otp, admin.firstName);
            if (!delivery.success) {
                await Admin.updateOne(
                    { _id: admin._id, loginOtp: admin.loginOtp },
                    { $unset: { loginOtp: 1, loginOtpExpires: 1, loginOtpAttempts: 1 } }
                );
                return res.status(503).json({
                    success: false,
                    message: 'Unable to deliver the verification code. Please try again later.'
                });
            }

            logger.security('Admin login OTP issued', {
                adminId: admin.adminId,
                emailDomain: admin.email.split('@')[1],
                expiresAt: admin.loginOtpExpires
            });

            res.json({
                success: true,
                message: 'OTP sent to your registered contact',
                requireOtp: true,
                adminId: admin._id
            });
        } else {
            // This block should be unreachable now but keeping for safety
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Verify Admin OTP (Step 2: Generate Token)
// @route   POST /api/admin/auth/verify-otp
// @access  Public
export const verifyAdminOtp = async (req, res) => {
    try {
        const { adminId, otp } = req.body;

        if (!/^[0-9]{6}$/.test(otp || '')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        const admin = await Admin.findById(adminId)
            .select('+loginOtp +loginOtpExpires +loginOtpAttempts');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (!admin.loginOtp || !admin.loginOtpExpires) {
            return res.status(400).json({
                success: false,
                message: 'No OTP request found. Please login again.'
            });
        }

        if (admin.status !== 'active') {
            await Admin.updateOne(
                { _id: admin._id, loginOtp: admin.loginOtp },
                { $unset: { loginOtp: 1, loginOtpExpires: 1, loginOtpAttempts: 1 } }
            );
            return res.status(403).json({
                success: false,
                message: 'Administrator account is not active'
            });
        }

        if (isOTPExpired(admin.loginOtpExpires)) {
            await Admin.updateOne(
                { _id: admin._id, loginOtp: admin.loginOtp },
                { $unset: { loginOtp: 1, loginOtpExpires: 1, loginOtpAttempts: 1 } }
            );
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        const { maxAttempts } = getOTPConfig();
        if (isMaxAttemptsExceeded(admin.loginOtpAttempts || 0)) {
            await Admin.updateOne(
                { _id: admin._id, loginOtp: admin.loginOtp },
                { $unset: { loginOtp: 1, loginOtpExpires: 1, loginOtpAttempts: 1 } }
            );
            return res.status(400).json({
                success: false,
                message: 'Maximum OTP verification attempts exceeded. Please login again.'
            });
        }

        const isMatch = await verifyOTP(otp, admin.loginOtp);

        if (!isMatch) {
            const attemptedAdmin = await Admin.findOneAndUpdate(
                {
                    _id: admin._id,
                    loginOtp: admin.loginOtp,
                    loginOtpExpires: { $gt: new Date() },
                    status: 'active',
                    loginOtpAttempts: { $lt: maxAttempts }
                },
                { $inc: { loginOtpAttempts: 1 } },
                { new: true, select: '+loginOtpAttempts' }
            );
            const locked = !attemptedAdmin || isMaxAttemptsExceeded(attemptedAdmin.loginOtpAttempts);
            if (locked) {
                await Admin.updateOne(
                    { _id: admin._id, loginOtp: admin.loginOtp },
                    { $unset: { loginOtp: 1, loginOtpExpires: 1, loginOtpAttempts: 1 } }
                );
            }
            return res.status(400).json({
                success: false,
                message: locked
                    ? 'Maximum OTP verification attempts exceeded. Please login again.'
                    : 'Invalid OTP'
            });
        }

        // Atomically consume the OTP so concurrent/replayed requests cannot both issue tokens.
        const verifiedAdmin = await Admin.findOneAndUpdate(
            {
                _id: admin._id,
                loginOtp: admin.loginOtp,
                loginOtpExpires: { $gt: new Date() },
                status: 'active',
                loginOtpAttempts: { $lt: maxAttempts }
            },
            { $unset: { loginOtp: 1, loginOtpExpires: 1, loginOtpAttempts: 1 } },
            { new: true }
        );

        if (!verifiedAdmin) {
            return res.status(400).json({
                success: false,
                message: 'OTP is invalid, expired, or has already been used'
            });
        }

        res.json({
            success: true,
            token: generateToken(verifiedAdmin._id),
            data: {
                _id: verifiedAdmin._id,
                firstName: verifiedAdmin.firstName,
                lastName: verifiedAdmin.lastName,
                email: verifiedAdmin.email,
                role: verifiedAdmin.role,
                permissions: verifiedAdmin.permissions,
                adminId: verifiedAdmin.adminId
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification'
        });
    }
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
export const getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
};

// @desc    Get pending admins
// @route   GET /api/admin/pending
// @access  Private (Super Admin)
export const getPendingAdmins = async (req, res) => {
    try {
        const pendingAdmins = await Admin.find({ status: 'pending' }).sort('-createdAt');

        res.json({
            success: true,
            count: pendingAdmins.length,
            data: pendingAdmins
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching pending admins'
        });
    }
};

// @desc    Approve admin
// @route   PUT /api/admin/approve/:id
// @access  Private (Super Admin)
export const approveAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (admin.status === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Admin is already active'
            });
        }

        // Update status and approval details
        admin.status = 'active';
        admin.approvedBy = req.admin._id;
        admin.approvedAt = Date.now();

        // Assign role if provided, otherwise keep default
        if (req.body.role) {
            admin.role = req.body.role;
            admin.permissions = getDefaultPermissions(req.body.role);
        }

        await admin.save();

        // Send approval notification
        await sendAdminApprovalEmail(admin, req.body.role || 'viewer');

        res.json({
            success: true,
            message: 'Admin approved successfully. Notification sent to admin.',
            data: admin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error approving admin'
        });
    }
};

// @desc    Reject admin
// @route   PUT /api/admin/reject/:id
// @access  Private (Super Admin)
export const rejectAdmin = async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason || reason.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required (minimum 20 characters)'
            });
        }

        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        admin.status = 'rejected';
        admin.rejectedBy = req.admin._id;
        admin.rejectedAt = Date.now();
        admin.rejectionReason = reason;

        await admin.save();

        // Send rejection notification
        await sendAdminRejectionEmail(admin, reason);

        res.json({
            success: true,
            message: 'Admin rejected successfully. Notification sent to admin.',
            data: admin
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error rejecting admin'
        });
    }
};

// @desc    Request permissions
// @route   POST /api/admin/request-permissions
// @access  Private (Admin)
export const requestPermissions = async (req, res) => {
    try {
        const { requestedPermissions, reason } = req.body;

        const request = await PermissionRequest.create({
            adminId: req.admin._id,
            requestedPermissions,
            reason
        });

        res.status(201).json({
            success: true,
            message: 'Permission request submitted',
            data: request
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error submitting request'
        });
    }
};

// @desc    Get permission requests
// @route   GET /api/admin/permission-requests
// @access  Private (Super Admin)
export const getPermissionRequests = async (req, res) => {
    try {
        const requests = await PermissionRequest.find({ status: 'pending' })
            .populate('adminId', 'firstName lastName email adminId role')
            .sort('-createdAt');

        res.json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching requests'
        });
    }
};

// @desc    Approve permission request
// @route   PUT /api/admin/permission-requests/:id/approve
// @access  Private (Super Admin)
export const approvePermissionRequest = async (req, res) => {
    try {
        const request = await PermissionRequest.findById(req.params.id).populate('adminId');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request is already processed'
            });
        }

        // Update request status
        request.status = 'approved';
        request.reviewedBy = req.admin._id;
        request.reviewedAt = Date.now();
        await request.save();

        // Update admin permissions
        const admin = request.adminId;
        request.requestedPermissions.forEach(permission => {
            admin.permissions[permission] = true;
        });
        await admin.save();

        res.json({
            success: true,
            message: 'Permissions granted successfully',
            data: request
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error approving request'
        });
    }
};

// @desc    Reject permission request
// @route   PUT /api/admin/permission-requests/:id/reject
// @access  Private (Super Admin)
export const rejectPermissionRequest = async (req, res) => {
    try {
        const { notes } = req.body;
        const request = await PermissionRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        request.status = 'rejected';
        request.reviewedBy = req.admin._id;
        request.reviewedAt = Date.now();
        request.reviewNotes = notes;
        await request.save();

        res.json({
            success: true,
            message: 'Request rejected',
            data: request
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error rejecting request'
        });
    }
};
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
    try {
        const [totalComplaints, pendingComplaints, resolvedComplaints, activeUsers] = await Promise.all([
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: 'pending' }),
            Complaint.countDocuments({ status: 'resolved' }),
            User.countDocuments({ status: 'active', isDeleted: { $ne: true } })
        ]);

        res.json({
            success: true,
            data: {
                totalComplaints,
                pendingComplaints,
                resolvedComplaints,
                activeUsers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching stats'
        });
    }
};
