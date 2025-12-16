/**
 * Multi-Role Registration Controller
 * Handles registration for all 4 user types
 */

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ========================================
// GENERAL USER REGISTRATION
// ========================================
// @desc    Register general user (instant activation)
// @route   POST /api/auth/register/general-user
// @access  Public
export const registerGeneralUser = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, email, phone, password } = req.body;

        // Validate at least one contact method
        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Either email or phone number is required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email || null },
                { phone: phone || null }
            ].filter(condition => Object.values(condition)[0] !== null)
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'phone number';
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        // Create general user
        const user = await User.create({
            firstName,
            lastName,
            dateOfBirth: dateOfBirth || null, // Optional - can be added later in profile
            email,
            phone,
            password,
            userType: 'general_user',
            status: 'active', // Auto-activate general users
            registrationMetadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                referralSource: req.headers.referer || 'direct'
            }
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                status: user.status,
                isLocationSet: user.isLocationSet
            }
        });
    } catch (error) {
        console.error('General user registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// ========================================
// ADMIN REGISTRATION
// ========================================
// @desc    Register admin (requires approval)
// @route   POST /api/auth/register/admin
// @access  Public
export const registerAdmin = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            email,
            phone,
            password,
            department,
            designation,
            employeeId
        } = req.body;

        // Admins must have both email and phone
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Both email and phone number are required for admin registration'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email },
                { phone },
                { 'adminProfile.employeeId': employeeId }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email, phone, or employee ID already exists'
            });
        }

        // Create admin user (pending approval)
        const user = await User.create({
            firstName,
            lastName,
            dateOfBirth: dateOfBirth || new Date('1990-01-01'), // Default for admins
            email,
            phone,
            password,
            userType: 'admin',
            status: 'pending', // Requires approval
            adminProfile: {
                department,
                designation,
                employeeId,
                role: 'viewer', // Default role
                permissions: {
                    viewComplaints: true,
                    editComplaints: false,
                    deleteComplaints: false,
                    assignComplaints: false,
                    viewUsers: false,
                    editUsers: false,
                    deleteUsers: false,
                    viewReports: false,
                    manageAdmins: false,
                    systemSettings: false
                }
            },
            registrationMetadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                referralSource: req.headers.referer || 'direct'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Admin registration submitted successfully. Your account is pending approval.',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                status: user.status,
                department: user.adminProfile.department,
                designation: user.adminProfile.designation
            }
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin registration'
        });
    }
};

// ========================================
// CONTRACTOR REGISTRATION
// ========================================
// @desc    Register contractor (requires verification)
// @route   POST /api/auth/register/contractor
// @access  Public
export const registerContractor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            email,
            phone,
            password,
            companyName,
            companyNameHindi,
            registrationNumber,
            gstNumber,
            panNumber,
            specialization,
            serviceAreas
        } = req.body;

        // Contractors must have both email and phone
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Both email and phone number are required for contractor registration'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email },
                { phone },
                { 'contractorProfile.registrationNumber': registrationNumber },
                { 'contractorProfile.gstNumber': gstNumber },
                { 'contractorProfile.panNumber': panNumber }
            ].filter(condition => {
                const value = Object.values(condition)[0];
                return value !== null && value !== undefined && value !== '';
            })
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email, phone, or business registration already exists'
            });
        }

        // Create contractor user (pending verification)
        const user = await User.create({
            firstName,
            lastName,
            dateOfBirth: dateOfBirth || new Date('1990-01-01'), // Default for contractors
            email,
            phone,
            password,
            userType: 'contractor',
            status: 'pending', // Requires verification
            contractorProfile: {
                companyName,
                companyNameHindi,
                registrationNumber,
                gstNumber,
                panNumber,
                specialization: Array.isArray(specialization) ? specialization : [specialization],
                serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [serviceAreas],
                certifications: [],
                isVerified: false,
                rating: 0,
                totalJobsCompleted: 0,
                onTimeCompletionRate: 0
            },
            registrationMetadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                referralSource: req.headers.referer || 'direct'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Contractor registration submitted successfully. Your account is pending verification.',
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                status: user.status,
                companyName: user.contractorProfile.companyName,
                specialization: user.contractorProfile.specialization
            }
        });
    } catch (error) {
        console.error('Contractor registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during contractor registration'
        });
    }
};

// ========================================
// SUPER ADMIN REGISTRATION
// ========================================
// @desc    Register super admin (invitation only)
// @route   POST /api/auth/register/super-admin
// @access  Private (requires invitation code)
export const registerSuperAdmin = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            email,
            phone,
            password,
            invitationCode
        } = req.body;

        // Verify invitation code
        const validInvitationCode = process.env.SUPER_ADMIN_INVITATION_CODE || 'SUPER_ADMIN_2024';

        if (invitationCode !== validInvitationCode) {
            return res.status(403).json({
                success: false,
                message: 'Invalid invitation code. Super Admin registration is by invitation only.'
            });
        }

        // Super admins must have both email and phone
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Both email and phone number are required for super admin registration'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Create super admin user (auto-activated)
        const user = await User.create({
            firstName,
            lastName,
            dateOfBirth: dateOfBirth || new Date('1990-01-01'),
            email,
            phone,
            password,
            userType: 'super_admin',
            status: 'active', // Auto-activate super admins
            adminProfile: {
                role: 'super_admin',
                permissions: {
                    viewComplaints: true,
                    editComplaints: true,
                    deleteComplaints: true,
                    assignComplaints: true,
                    viewUsers: true,
                    editUsers: true,
                    deleteUsers: true,
                    viewReports: true,
                    manageAdmins: true,
                    systemSettings: true
                }
            },
            verificationStatus: {
                email: true,
                phone: true,
                identity: true,
                documents: true
            },
            isVerified: true,
            registrationMetadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                referralSource: 'invitation'
            }
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Super Admin account created successfully',
            token,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Super admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during super admin registration'
        });
    }
};
