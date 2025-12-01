/**
 * Complaint model schema
 */

import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['infrastructure', 'public-service', 'utilities', 'safety', 'environment', 'other']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    location: {
        address: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    media: {
        text: {
            type: String,
            maxlength: [5000, 'Text content cannot exceed 5000 characters']
        },
        images: [{
            url: String,
            filename: String,
            uploadedAt: Date
        }],
        audio: [{
            url: String,
            filename: String,
            duration: Number,
            uploadedAt: Date
        }],
        video: [{
            url: String,
            filename: String,
            duration: Number,
            uploadedAt: Date
        }]
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model('Complaint', complaintSchema);
