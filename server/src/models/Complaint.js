import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'audio', 'video'],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    media: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media'
    }],
    location: {
        address: String,
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        pincode: String
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    adminComments: [{
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    internalNotes: [{
        note: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ 'location.pincode': 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ media: 1 });

// Auto-assign department based on category
complaintSchema.pre('save', async function (next) {
    if (this.isModified('category') && !this.department) {
        try {
            const Category = mongoose.model('Category');
            const category = await Category.findById(this.category);
            if (category && category.department) {
                this.department = category.department;
            }
        } catch (error) {
            console.error('Error auto-assigning department:', error);
        }
    }
    next();
});

export default mongoose.model('Complaint', complaintSchema);
