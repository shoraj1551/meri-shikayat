import mongoose from 'mongoose';

const departmentStatisticsSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DepartmentOffice'
    },
    // Time Period
    periodType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'all_time'],
        required: true
    },
    periodStart: {
        type: Date,
        required: true
    },
    periodEnd: {
        type: Date,
        required: true
    },
    // Statistics
    totalComplaints: {
        type: Number,
        default: 0
    },
    receivedComplaints: {
        type: Number,
        default: 0
    },
    inProgressComplaints: {
        type: Number,
        default: 0
    },
    resolvedComplaints: {
        type: Number,
        default: 0
    },
    rejectedComplaints: {
        type: Number,
        default: 0
    },
    // Performance Metrics
    avgResponseTimeHours: {
        type: Number,
        default: 0
    },
    avgResolutionTimeHours: {
        type: Number,
        default: 0
    },
    resolutionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Satisfaction
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    // Metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
departmentStatisticsSchema.index({ department: 1 });
departmentStatisticsSchema.index({ office: 1 });
departmentStatisticsSchema.index({ periodType: 1, periodStart: 1 });
departmentStatisticsSchema.index({ department: 1, office: 1, periodType: 1, periodStart: 1 }, { unique: true });

// Methods
departmentStatisticsSchema.methods.calculateResolutionRate = function () {
    if (this.totalComplaints === 0) return 0;
    return ((this.resolvedComplaints / this.totalComplaints) * 100).toFixed(2);
};

const DepartmentStatistics = mongoose.model('DepartmentStatistics', departmentStatisticsSchema);

export default DepartmentStatistics;
