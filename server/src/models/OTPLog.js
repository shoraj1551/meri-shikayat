/**
 * OTPLog Model
 * OTP audit trail for security and debugging
 */

import mongoose from 'mongoose';

const otpLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel',
        required: [true, 'User reference is required']
    },
    userModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin']
    },
    type: {
        type: String,
        required: [true, 'OTP type is required'],
        enum: ['password_reset', 'login_2fa', 'email_verification', 'phone_verification'],
        lowercase: true
    },
    otp: {
        type: String,
        required: [true, 'OTP hash is required'],
        select: false // Don't return in queries by default
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required'],
        index: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date
    },
    attempts: {
        type: Number,
        default: 0,
        max: [5, 'Maximum attempts exceeded']
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
otpLogSchema.index({ user: 1, type: 1, createdAt: -1 });
otpLogSchema.index({ verified: 1 });
otpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Increment attempts
otpLogSchema.methods.incrementAttempts = function () {
    this.attempts += 1;
    return this.save();
};

// Mark as verified
otpLogSchema.methods.markAsVerified = function () {
    this.verified = true;
    this.verifiedAt = new Date();
    return this.save();
};

export default mongoose.model('OTPLog', otpLogSchema);
