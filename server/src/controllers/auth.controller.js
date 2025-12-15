/**
 * Authentication controller
 */

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, email, phone, password } = req.body;

        // Validate at least one contact method
        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Either email or phone number is required'
            });
        }

        // Check if user already exists with email
        if (email) {
            const existingUserByEmail = await User.findOne({ email });
            if (existingUserByEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }
        }

        // Check if user already exists with phone
        if (phone) {
            const existingUserByPhone = await User.findOne({ phone });
            if (existingUserByPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this phone number already exists'
                });
            }
        }

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            dateOfBirth,
            email,
            phone,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                isLocationSet: user.isLocationSet,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { identifier, password, rememberMe = false } = req.body;

        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/phone and password'
            });
        }

        // Determine if identifier is email or phone
        const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
        const isPhone = /^[0-9]{10}$/.test(identifier);

        if (!isEmail && !isPhone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email or 10-digit phone number'
            });
        }

        // Find user by email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };
        const user = await User.findOne(query).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check account status
        if (user.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval. You will receive an email once your account is activated.'
            });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Your account registration was rejected. Please contact support for more information.'
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.'
            });
        }

        // Check if account is locked
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account is locked. Please try again in ${minutesLeft} minutes.`
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            // Increment failed login attempts
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

            // Lock account after 5 failed attempts for 1 hour
            if (user.failedLoginAttempts >= 5) {
                user.accountLockedUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
                await user.save();

                return res.status(403).json({
                    success: false,
                    message: 'Account locked due to too many failed login attempts. Please try again in 1 hour.'
                });
            }

            await user.save();

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset failed login attempts on successful login
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = undefined;

        // Generate access token (always)
        const accessToken = generateToken(user._id);

        // Generate refresh token if Remember Me is checked
        let refreshToken = null;
        if (rememberMe) {
            const { generateRefreshToken, getTokenExpiryDate } = await import('../services/token.service.js');
            const { token, tokenId } = generateRefreshToken(user);
            refreshToken = token;

            // Store refresh token in database
            user.refreshTokens.push({
                token: tokenId,
                expiresAt: getTokenExpiryDate(),
                deviceInfo: req.headers['user-agent'] || 'Unknown'
            });

            // Limit to 5 devices
            if (user.refreshTokens.length > 5) {
                user.refreshTokens = user.refreshTokens.slice(-5);
            }
        }

        await user.save();

        const response = {
            success: true,
            message: 'User logged in successfully',
            token: accessToken,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                status: user.status,
                isLocationSet: user.isLocationSet,
                location: user.location,
                // Include role-specific data
                ...(user.userType === 'admin' || user.userType === 'super_admin' ? {
                    adminProfile: {
                        department: user.adminProfile?.department,
                        designation: user.adminProfile?.designation,
                        role: user.adminProfile?.role,
                        permissions: user.adminProfile?.permissions
                    }
                } : {}),
                ...(user.userType === 'contractor' ? {
                    contractorProfile: {
                        companyName: user.contractorProfile?.companyName,
                        specialization: user.contractorProfile?.specialization,
                        rating: user.contractorProfile?.rating
                    }
                } : {})
            }
        };

        if (refreshToken) {
            response.refreshToken = refreshToken;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        const { refreshToken, logoutAll = false } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (logoutAll) {
            // Logout from all devices
            user.refreshTokens = [];
        } else if (refreshToken) {
            // Logout from current device only
            const { verifyRefreshToken } = await import('../services/token.service.js');
            try {
                const decoded = verifyRefreshToken(refreshToken);
                user.refreshTokens = user.refreshTokens.filter(
                    rt => rt.token !== decoded.tokenId
                );
            } catch (error) {
                // Token invalid, but still allow logout
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: logoutAll ? 'Logged out from all devices' : 'User logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const { verifyRefreshToken, generateRefreshToken, generateAccessToken, getTokenExpiryDate } = await import('../services/token.service.js');

        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Find user and check if token exists
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if refresh token exists in database
        const tokenExists = user.refreshTokens.some(rt => rt.token === decoded.tokenId);

        if (!tokenExists) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found or has been revoked'
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        // Rotate refresh token (security best practice)
        const { token: newRefreshToken, tokenId: newTokenId } = generateRefreshToken(user);

        // Remove old refresh token and add new one
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== decoded.tokenId);
        user.refreshTokens.push({
            token: newTokenId,
            expiresAt: getTokenExpiryDate(),
            deviceInfo: req.headers['user-agent'] || 'Unknown'
        });

        await user.save();

        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token refresh'
        });
    }
};

