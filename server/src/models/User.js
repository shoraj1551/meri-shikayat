/**
 * Enhanced User Model - Unified Multi-Role System
 * Supports: General Users, Admins, Super Admins, Contractors
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // ========================================
    // COMMON FIELDS (All User Types)
    // ========================================
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function (value) {
                if (!value) return true; // Allow empty
                const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 13;
            },
            message: 'User must be at least 13 years old'
        }
    },
    email: {
        type: String,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        sparse: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        },
        select: false
    },

    // ========================================
    // ROLE & STATUS
    // ========================================
    userType: {
        type: String,
        enum: ['general_user', 'admin', 'super_admin', 'contractor'],
        required: true,
        default: 'general_user'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: function () {
            // General users are auto-activated, others require approval
            return this.userType === 'general_user' ? 'active' : 'pending';
        }
    },

    // ========================================
    // LOCATION (General Users)
    // ========================================
    location: {
        address: String,
        pincode: {
            type: String,
            match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
        },
        village: String,
        city: String,
        district: String,
        state: String,
        landmark: String,
        residentialType: {
            type: String,
            enum: ['Own', 'Rent', 'Other']
        },
        country: {
            type: String,
            default: 'India'
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    isLocationSet: {
        type: Boolean,
        default: false
    },

    // ========================================
    // ADMIN PROFILE (Admin & Super Admin)
    // ========================================
    adminProfile: {
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        },
        designation: {
            type: String,
            trim: true,
            maxlength: [100, 'Designation cannot exceed 100 characters']
        },
        employeeId: {
            type: String,
            trim: true,
            sparse: true,
            unique: true
        },
        adminId: {
            type: String,
            sparse: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['viewer', 'moderator', 'manager', 'super_admin'],
            default: 'viewer'
        },
        permissions: {
            viewComplaints: { type: Boolean, default: false },
            editComplaints: { type: Boolean, default: false },
            deleteComplaints: { type: Boolean, default: false },
            assignComplaints: { type: Boolean, default: false },
            viewUsers: { type: Boolean, default: false },
            editUsers: { type: Boolean, default: false },
            deleteUsers: { type: Boolean, default: false },
            viewReports: { type: Boolean, default: false },
            manageAdmins: { type: Boolean, default: false },
            systemSettings: { type: Boolean, default: false }
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rejectedAt: Date,
        rejectionReason: String
    },

    // ========================================
    // CONTRACTOR PROFILE
    // ========================================
    contractorProfile: {
        companyName: {
            type: String,
            trim: true,
            maxlength: [200, 'Company name cannot exceed 200 characters']
        },
        companyNameHindi: {
            type: String,
            trim: true,
            maxlength: [200, 'Hindi company name cannot exceed 200 characters']
        },
        registrationNumber: {
            type: String,
            trim: true,
            sparse: true,
            unique: true
        },
        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please provide a valid GST number']
        },
        panNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please provide a valid PAN number']
        },
        specialization: [{
            type: String,
            enum: ['sanitation', 'road_repair', 'electrical', 'plumbing', 'construction', 'landscaping', 'other']
        }],
        serviceAreas: [{
            type: String,
            trim: true
        }],
        certifications: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            number: String,
            issuingAuthority: String,
            issueDate: Date,
            expiryDate: Date,
            documentUrl: String
        }],
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: Date,
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalJobsCompleted: {
            type: Number,
            default: 0
        },
        onTimeCompletionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },

    // ========================================
    // VERIFICATION & SECURITY
    // ========================================
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        email: { type: Boolean, default: false },
        phone: { type: Boolean, default: false },
        identity: { type: Boolean, default: false },
        documents: { type: Boolean, default: false }
    },
    riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    registrationMetadata: {
        ipAddress: String,
        userAgent: String,
        deviceFingerprint: String,
        referralSource: String,
        registeredAt: {
            type: Date,
            default: Date.now
        }
    },

    // ========================================
    // AUTHENTICATION & SESSION
    // ========================================
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        },
        deviceInfo: String
    }],

    // ========================================
    // PASSWORD RESET
    // ========================================
    passwordResetOTP: String,
    passwordResetOTPExpiry: Date,
    passwordResetAttempts: {
        type: Number,
        default: 0
    },
    lastPasswordResetRequest: Date,

    // ========================================
    // SECURITY
    // ========================================
    // ENHANCED PROFILE FIELDS
    // ========================================

    // Profile Picture
    profilePicture: {
        url: String,
        publicId: String,  // Cloudinary ID
        uploadedAt: Date
    },

    // Additional Personal Info
    middleName: {
        type: String,
        trim: true,
        maxlength: [50, 'Middle name cannot exceed 50 characters']
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot exceed 150 characters']
    },
    phoneNumber: {
        type: String,
        match: [/^(\+91)?[0-9]{10}$/, 'Please provide a valid phone number']
    },

    // Enhanced Location (keeping existing location field, adding more details)
    // Note: location field already exists above, we're adding to it via updates

    // Education Information
    education: {
        highestQualification: {
            type: String,
            enum: ['High School', 'Diploma', 'Bachelor', 'Master', 'PhD', 'Other']
        },
        institutionName: String,
        fieldOfStudy: String,
        yearOfCompletion: {
            type: Number,
            min: 1950,
            max: 2030
        },
        certifications: [String]
    },

    // Work Information
    work: {
        employmentStatus: {
            type: String,
            enum: ['Employed', 'Self-employed', 'Student', 'Retired', 'Unemployed', 'Other']
        },
        companyName: String,
        jobTitle: String,
        industry: String,
        yearsOfExperience: {
            type: Number,
            min: 0,
            max: 50
        },
        workLocation: String
    },

    // Social Links
    socialLinks: {
        linkedin: {
            type: String,
            match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL']
        },
        twitter: {
            type: String,
            match: [/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.*$/, 'Please provide a valid Twitter/X URL']
        },
        facebook: {
            type: String,
            match: [/^https?:\/\/(www\.)?facebook\.com\/.*$/, 'Please provide a valid Facebook URL']
        },
        website: {
            type: String,
            match: [/^https?:\/\/.*$/, 'Please provide a valid URL']
        },
        other: [String]
    },

    // Preferences
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        language: { type: String, default: 'en', enum: ['en', 'hi'] },
        profileVisibility: { type: String, default: 'public', enum: ['public', 'private'] },
        newsletter: { type: Boolean, default: false }
    },

    // Verification Status
    verification: {
        email: { type: Boolean, default: false },
        phone: { type: Boolean, default: false },
        id: { type: Boolean, default: false },
        address: { type: Boolean, default: false }
    },

    // Civic Engagement Stats
    stats: {
        reputationScore: { type: Number, default: 0 },
        impactScore: { type: Number, default: 0 },
        totalComplaints: { type: Number, default: 0 },
        resolvedComplaints: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },
        totalHypes: { type: Number, default: 0 },
        totalShares: { type: Number, default: 0 }
    },

    // Badges
    badges: [{
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
        description: String
    }],

    // Profile Completion
    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Member Since
    memberSince: { type: Date, default: Date.now },
    lastProfileUpdate: Date,

    // ========================================
    // SECURITY
    // ========================================
    lastPasswordChange: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLockedUntil: Date,

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ========================================
// INDEXES
// ========================================
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ userType: 1, status: 1 });
userSchema.index({ 'adminProfile.employeeId': 1 });
userSchema.index({ 'contractorProfile.registrationNumber': 1 });
userSchema.index({ 'contractorProfile.gstNumber': 1 });

// ========================================
// VALIDATION
// ========================================
// At least one contact method required
userSchema.pre('validate', function (next) {
    if (!this.email && !this.phone) {
        this.invalidate('email', 'Either email or phone number is required');
        this.invalidate('phone', 'Either email or phone number is required');
    }
    next();
});

// ========================================
// MIDDLEWARE
// ========================================
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ========================================
// METHODS
// ========================================
// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Check if user is admin or super admin
userSchema.methods.isAdmin = function () {
    return this.userType === 'admin' || this.userType === 'super_admin';
};

// Check if user is super admin
userSchema.methods.isSuperAdmin = function () {
    return this.userType === 'super_admin';
};

// Check if user is contractor
userSchema.methods.isContractor = function () {
    return this.userType === 'contractor';
};

// Check if user has permission
userSchema.methods.hasPermission = function (permission) {
    if (this.userType === 'super_admin') return true;
    if (!this.adminProfile) return false;
    return this.adminProfile.permissions[permission] === true;
};

export default mongoose.model('User', userSchema);
