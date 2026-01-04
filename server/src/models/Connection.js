/**
 * Connection Model
 * Handles relationships between users (Friendships and Following)
 */

import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'following'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['friend', 'follow'],
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique relationship pair
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);
