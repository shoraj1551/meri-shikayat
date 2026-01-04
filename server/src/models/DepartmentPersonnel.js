import mongoose from 'mongoose';

const departmentPersonnelSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DepartmentOffice'
    },
    // Personal Information
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    designationHindi: {
        type: String,
        trim: true
    },
    // Contact
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    // Hierarchy
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DepartmentPersonnel'
    },
    hierarchyLevel: {
        type: Number,
        default: 1,
        min: 1
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    joinedDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
departmentPersonnelSchema.index({ department: 1 });
departmentPersonnelSchema.index({ office: 1 });
departmentPersonnelSchema.index({ hierarchyLevel: 1 });
departmentPersonnelSchema.index({ isActive: 1 });

const DepartmentPersonnel = mongoose.model('DepartmentPersonnel', departmentPersonnelSchema);

export default DepartmentPersonnel;
