/**
 * Admin model schema
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
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
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    adminId: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        enum: ['viewer', 'moderator', 'manager', 'super_admin'],
        default: 'viewer'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: 'pending'
    },
    permissions: {
        viewComplaints: { type: Boolean, default: false },
        editComplaints: { type: Boolean, default: false },
        deleteComplaints: { type: Boolean, default: false },
        viewUsers: { type: Boolean, default: false },
        editUsers: { type: Boolean, default: false },
        deleteUsers: { type: Boolean, default: false },
        viewReports: { type: Boolean, default: false },
        manageAdmins: { type: Boolean, default: false },
        systemSettings: { type: Boolean, default: false }
    },
    department: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    rejectedAt: Date,
    rejectionReason: String,
    loginOtp: {
        type: String,
        select: false
    },
    loginOtpExpires: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
adminSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export default mongoose.model('Admin', adminSchema);
