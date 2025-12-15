import mongoose from 'mongoose';

const departmentOfficeSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    officeName: {
        type: String,
        required: true,
        trim: true
    },
    officeNameHindi: {
        type: String,
        trim: true
    },
    officeCode: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    // Contact Information
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
    // Operating Hours
    officeHours: {
        type: String,
        default: 'Mon-Fri: 9:00 AM - 6:00 PM'
    },
    is24x7: {
        type: Boolean,
        default: false
    },
    // Location Coordinates
    location: {
        latitude: Number,
        longitude: Number
    },
    // Contact Numbers (embedded array)
    contactNumbers: [{
        type: {
            type: String,
            enum: ['main', 'emergency', 'helpline', 'fax'],
            default: 'main'
        },
        number: {
            type: String,
            required: true
        },
        extension: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    // Email Addresses (embedded array)
    emails: [{
        type: {
            type: String,
            enum: ['general', 'complaints', 'support', 'emergency'],
            default: 'general'
        },
        address: {
            type: String,
            required: true
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    // Status
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
departmentOfficeSchema.index({ department: 1 });
departmentOfficeSchema.index({ officeCode: 1 });
departmentOfficeSchema.index({ city: 1 });
departmentOfficeSchema.index({ isActive: 1 });

const DepartmentOffice = mongoose.model('DepartmentOffice', departmentOfficeSchema);

export default DepartmentOffice;
