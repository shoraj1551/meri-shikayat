import mongoose from 'mongoose';

const contractorSchema = new mongoose.Schema({
    // Company Information
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyNameHindi: {
        type: String,
        trim: true
    },
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    panNumber: {
        type: String,
        trim: true
    },
    // Contact Information
    primaryContactPerson: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },
    // Address
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        default: 'Delhi'
    },
    pincode: {
        type: String
    },
    // Business Details
    specialization: [{
        type: String,
        enum: ['sanitation', 'road_repair', 'electrical', 'plumbing', 'construction', 'maintenance', 'other']
    }],
    serviceAreas: [{
        type: String
    }],
    establishedYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear()
    },
    // Contract Details
    contractStartDate: {
        type: Date
    },
    contractEndDate: {
        type: Date
    },
    contractValue: {
        type: Number,
        default: 0
    },
    // Performance
    totalJobsCompleted: {
        type: Number,
        default: 0
    },
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Certifications (embedded array)
    certifications: [{
        name: {
            type: String,
            required: true
        },
        number: String,
        issuingAuthority: String,
        issueDate: Date,
        expiryDate: Date,
        documentUrl: String,
        isVerified: {
            type: Boolean,
            default: false
        }
    }],
    // Status
    status: {
        type: String,
        enum: ['active', 'suspended', 'terminated'],
        default: 'active'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
contractorSchema.index({ status: 1 });
contractorSchema.index({ specialization: 1 });
contractorSchema.index({ city: 1 });
contractorSchema.index({ isActive: 1 });
contractorSchema.index({ isVerified: 1 });

// Virtual for active contract status
contractorSchema.virtual('hasActiveContract').get(function () {
    if (!this.contractEndDate) return false;
    return this.contractEndDate > new Date();
});

const Contractor = mongoose.model('Contractor', contractorSchema);

export default Contractor;
