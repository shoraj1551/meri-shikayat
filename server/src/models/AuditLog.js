/**
 * AuditLog Model
 * System-wide audit trail for all actions
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        enum: ['User', 'Admin'],
        required: function () {
            return this.user != null;
        }
    },
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: [
            'login', 'logout', 'register',
            'create_complaint', 'update_complaint', 'delete_complaint',
            'assign_complaint', 'change_status',
            'upload_media', 'delete_media',
            'update_profile', 'change_password',
            'create_admin', 'update_admin', 'delete_admin',
            'system_config', 'other'
        ]
    },
    resource: {
        type: String,
        required: [true, 'Resource type is required'],
        enum: ['user', 'admin', 'complaint', 'media', 'category', 'department', 'system']
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: process.env.NODE_ENV || 'development'
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false // Using custom timestamp field
});

// Indexes
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ environment: 1 });

// TTL index - automatically delete logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export default mongoose.model('AuditLog', auditLogSchema);
