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
        type: String,
        required: [true, 'Category is required'],
        enum: ['Roads', 'Electricity', 'Water', 'Sanitation', 'Waste Management', 'Street Lights', 'Parks', 'Other']
    },
    mediaUrl: {
        type: String
    },
    location: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        pincode: String
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'rejected'],
        default: 'pending'
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
    }]
}, {
    timestamps: true
});

// Index for faster queries
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ 'location.pincode': 1 });

export default mongoose.model('Complaint', complaintSchema);
