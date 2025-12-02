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
            message: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or phone

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

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            token,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                isLocationSet: user.isLocationSet,
                location: user.location,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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
            message: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

