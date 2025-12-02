/**
 * Permission Request model schema
 */

import mongoose from 'mongoose';

const permissionRequestSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    requestedPermissions: [{
        type: String,
        required: true
    }],
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        minlength: [20, 'Reason must be at least 20 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: Date,
    reviewNotes: String
}, {
    timestamps: true
});

export default mongoose.model('PermissionRequest', permissionRequestSchema);
