/**
 * Department Model
 * Government departments for complaint routing
 */

import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true,
        unique: true,
        maxlength: [200, 'Department name cannot exceed 200 characters']
    },
    code: {
        type: String,
        required: [true, 'Department code is required'],
        trim: true,
        unique: true,
        uppercase: true,
        maxlength: [20, 'Department code cannot exceed 20 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    nameHindi: {
        type: String,
        trim: true,
        maxlength: [200, 'Hindi name cannot exceed 200 characters']
    },
    icon: {
        type: String,
        trim: true,
        maxlength: [10, 'Icon cannot exceed 10 characters']
    },
    color: {
        type: String,
        trim: true,
        match: [/^#[0-9A-Fa-f]{6}$/, 'Please provide a valid hex color code']
    },
    category: {
        type: String,
        enum: ['Primary', 'Additional'],
        default: 'Additional'
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    headAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    workingHours: {
        start: {
            type: String,
            default: '09:00'
        },
        end: {
            type: String,
            default: '17:00'
        },
        days: {
            type: [String],
            default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
departmentSchema.index({ code: 1 });
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });

export default mongoose.model('Department', departmentSchema);
