/**
 * Media Model
 * File uploads tracking for complaints
 */

import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: [true, 'Complaint reference is required']
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Uploader reference is required']
    },
    type: {
        type: String,
        required: [true, 'Media type is required'],
        enum: ['image', 'video', 'audio', 'document'],
        lowercase: true
    },
    filename: {
        type: String,
        required: [true, 'Filename is required']
    },
    originalName: {
        type: String,
        required: [true, 'Original filename is required']
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required']
    },
    size: {
        type: Number,
        required: [true, 'File size is required'],
        max: [10485760, 'File size cannot exceed 10MB'] // 10MB
    },
    url: {
        type: String,
        required: [true, 'File URL is required']
    },
    thumbnailUrl: {
        type: String
    },
    duration: {
        type: Number // For audio/video in seconds
    },
    metadata: {
        width: Number,
        height: Number,
        format: String,
        codec: String
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
mediaSchema.index({ complaint: 1 });
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ uploadedAt: -1 });

export default mongoose.model('Media', mediaSchema);
