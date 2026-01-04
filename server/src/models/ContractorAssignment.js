import mongoose from 'mongoose';

const contractorAssignmentSchema = new mongoose.Schema({
    contractor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
        required: true
    },
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    // Assignment Details
    assignedDate: {
        type: Date,
        default: Date.now
    },
    expectedCompletionDate: {
        type: Date
    },
    actualCompletionDate: {
        type: Date
    },
    // Status
    status: {
        type: String,
        enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
        default: 'assigned'
    },
    // Performance
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String
    },
    // Work Details
    workDescription: {
        type: String
    },
    estimatedCost: {
        type: Number
    },
    actualCost: {
        type: Number
    }
}, {
    timestamps: true
});

// Indexes
contractorAssignmentSchema.index({ contractor: 1 });
contractorAssignmentSchema.index({ complaint: 1 });
contractorAssignmentSchema.index({ status: 1 });
contractorAssignmentSchema.index({ assignedDate: -1 });

// Virtual for on-time completion
contractorAssignmentSchema.virtual('isOnTime').get(function () {
    if (!this.actualCompletionDate || !this.expectedCompletionDate) return null;
    return this.actualCompletionDate <= this.expectedCompletionDate;
});

const ContractorAssignment = mongoose.model('ContractorAssignment', contractorAssignmentSchema);

export default ContractorAssignment;
