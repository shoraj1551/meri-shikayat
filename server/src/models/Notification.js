/**
 * Notification Model
 * User and admin notifications
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
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
        required: [true, 'Notification type is required'],
        enum: ['complaint_update', 'assignment', 'message', 'system', 'reminder'],
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    link: {
        type: String
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, {
    timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Mark as read method
notificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

export default mongoose.model('Notification', notificationSchema);
