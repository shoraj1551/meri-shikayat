/**
 * Session Model
 * Active user sessions tracking
 */

import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
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
    refreshToken: {
        type: String,
        required: [true, 'Refresh token is required'],
        unique: true
    },
    deviceInfo: {
        type: String,
        default: 'Unknown Device'
    },
    ipAddress: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required'],
        index: true
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Update last activity
sessionSchema.methods.updateActivity = function () {
    this.lastActivityAt = new Date();
    return this.save();
};

// Deactivate session
sessionSchema.methods.deactivate = function () {
    this.isActive = false;
    return this.save();
};

export default mongoose.model('Session', sessionSchema);
