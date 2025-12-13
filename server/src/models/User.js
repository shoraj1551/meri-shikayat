/**
 * User model schema
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (value) {
                const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 13;
            },
            message: 'User must be at least 13 years old'
        }
    },
    email: {
        type: String,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        sparse: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (value) {
                // Password must contain at least one uppercase, one lowercase, one number, and one special character
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        },
        select: false
    },
    location: {
        pincode: {
            type: String,
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        },
        village: String,
        city: String,
        district: String,
        state: String,
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    isLocationSet: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Remember Me - Refresh Tokens
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        },
        deviceInfo: String
    }],
    // Password Reset
    passwordResetOTP: String,
    passwordResetOTPExpiry: Date,
    passwordResetAttempts: {
        type: Number,
        default: 0
    },
    lastPasswordResetRequest: Date,
    // Security
    lastPasswordChange: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLockedUntil: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Validate that at least one contact method is provided
userSchema.pre('validate', function (next) {
    if (!this.email && !this.phone) {
        this.invalidate('email', 'Either email or phone number is required');
        this.invalidate('phone', 'Either email or phone number is required');
    }
    next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('User', userSchema);
