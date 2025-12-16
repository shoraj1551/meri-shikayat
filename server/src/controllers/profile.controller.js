/**
 * Profile Controller
 * Handles all profile-related operations
 */

import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// GET PROFILE
// ========================================
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate profile completion
        const completion = calculateProfileCompletion(user);
        user.profileCompletion = completion;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

// ========================================
// UPDATE PERSONAL INFO
// ========================================
export const updatePersonalInfo = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            displayName,
            dateOfBirth,
            gender,
            phoneNumber,
            bio,
            address,
            pincode,
            city,
            state,
            district,
            landmark,
            residentialType
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update personal fields
        if (firstName) user.firstName = firstName;
        if (middleName !== undefined) user.middleName = middleName;
        if (lastName) user.lastName = lastName;
        if (displayName !== undefined) user.displayName = displayName;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (gender) user.gender = gender;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio !== undefined) user.bio = bio;

        // Update location
        if (!user.location) user.location = {};
        if (address !== undefined) user.location.address = address;
        if (pincode) user.location.pincode = pincode;
        if (city) user.location.city = city;
        if (state) user.location.state = state;
        if (district !== undefined) user.location.district = district;
        if (landmark !== undefined) user.location.landmark = landmark;
        if (residentialType) user.location.residentialType = residentialType;

        user.lastProfileUpdate = new Date();
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Personal information updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update Personal Info Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update personal information',
            error: error.message
        });
    }
};

// ========================================
// UPDATE EDUCATION
// ========================================
export const updateEducation = async (req, res) => {
    try {
        const {
            highestQualification,
            institutionName,
            fieldOfStudy,
            yearOfCompletion,
            certifications
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize education object if it doesn't exist
        if (!user.education) user.education = {};

        // Update education fields
        if (highestQualification) user.education.highestQualification = highestQualification;
        if (institutionName !== undefined) user.education.institutionName = institutionName;
        if (fieldOfStudy !== undefined) user.education.fieldOfStudy = fieldOfStudy;
        if (yearOfCompletion) user.education.yearOfCompletion = yearOfCompletion;
        if (certifications) {
            // Handle comma-separated string or array
            if (typeof certifications === 'string') {
                user.education.certifications = certifications.split(',').map(c => c.trim()).filter(c => c);
            } else if (Array.isArray(certifications)) {
                user.education.certifications = certifications;
            }
        }

        user.lastProfileUpdate = new Date();
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Education information updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update Education Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update education information',
            error: error.message
        });
    }
};

// ========================================
// UPDATE WORK
// ========================================
export const updateWork = async (req, res) => {
    try {
        const {
            employmentStatus,
            companyName,
            jobTitle,
            industry,
            yearsOfExperience,
            workLocation
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize work object if it doesn't exist
        if (!user.work) user.work = {};

        // Update work fields
        if (employmentStatus) user.work.employmentStatus = employmentStatus;
        if (companyName !== undefined) user.work.companyName = companyName;
        if (jobTitle !== undefined) user.work.jobTitle = jobTitle;
        if (industry !== undefined) user.work.industry = industry;
        if (yearsOfExperience !== undefined) user.work.yearsOfExperience = yearsOfExperience;
        if (workLocation !== undefined) user.work.workLocation = workLocation;

        user.lastProfileUpdate = new Date();
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Work information updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update Work Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update work information',
            error: error.message
        });
    }
};

// ========================================
// UPDATE SOCIAL LINKS
// ========================================
export const updateSocialLinks = async (req, res) => {
    try {
        const { linkedin, twitter, facebook, website } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize socialLinks object if it doesn't exist
        if (!user.socialLinks) user.socialLinks = {};

        // Update social links
        if (linkedin !== undefined) user.socialLinks.linkedin = linkedin;
        if (twitter !== undefined) user.socialLinks.twitter = twitter;
        if (facebook !== undefined) user.socialLinks.facebook = facebook;
        if (website !== undefined) user.socialLinks.website = website;

        user.lastProfileUpdate = new Date();
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Social links updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update Social Links Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update social links',
            error: error.message
        });
    }
};

// ========================================
// UPDATE PREFERENCES
// ========================================
export const updatePreferences = async (req, res) => {
    try {
        const {
            emailNotifications,
            smsNotifications,
            pushNotifications,
            newsletter,
            profileVisibility,
            language
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Initialize preferences object if it doesn't exist
        if (!user.preferences) user.preferences = {};

        // Update preferences
        if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
        if (smsNotifications !== undefined) user.preferences.smsNotifications = smsNotifications;
        if (pushNotifications !== undefined) user.preferences.pushNotifications = pushNotifications;
        if (newsletter !== undefined) user.preferences.newsletter = newsletter;
        if (profileVisibility) user.preferences.profileVisibility = profileVisibility;
        if (language) user.preferences.language = language;

        user.lastProfileUpdate = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update Preferences Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
            error: error.message
        });
    }
};

// ========================================
// UPLOAD PROFILE PICTURE
// ========================================
export const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old profile picture if exists
        if (user.profilePicture?.url) {
            const oldFilePath = path.join(__dirname, '../../', user.profilePicture.url);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Save new profile picture
        const fileUrl = `/uploads/profiles/${req.file.filename}`;
        user.profilePicture = {
            url: fileUrl,
            publicId: req.file.filename,
            uploadedAt: new Date()
        };

        user.lastProfileUpdate = new Date();
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                url: fileUrl,
                uploadedAt: user.profilePicture.uploadedAt
            }
        });
    } catch (error) {
        console.error('Upload Profile Picture Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture',
            error: error.message
        });
    }
};

// ========================================
// DELETE PROFILE PICTURE
// ========================================
export const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.profilePicture?.url) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture to delete'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../', user.profilePicture.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from database
        user.profilePicture = undefined;
        user.lastProfileUpdate = new Date();
        user.profileCompletion = calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Delete Profile Picture Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile picture',
            error: error.message
        });
    }
};

// ========================================
// GET STATS
// ========================================
export const getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('stats');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.stats || {
                reputationScore: 0,
                impactScore: 0,
                totalComplaints: 0,
                resolvedComplaints: 0,
                totalComments: 0,
                totalHypes: 0,
                totalShares: 0
            }
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats',
            error: error.message
        });
    }
};

// ========================================
// GET BADGES
// ========================================
export const getBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('badges stats profileCompletion verification');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check and award new badges
        await checkAndAwardBadges(user);

        res.status(200).json({
            success: true,
            data: user.badges || []
        });
    } catch (error) {
        console.error('Get Badges Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch badges',
            error: error.message
        });
    }
};

// ========================================
// VERIFICATION (Placeholder)
// ========================================
export const sendEmailVerification = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Email verification not implemented yet'
    });
};

export const verifyEmail = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Email verification not implemented yet'
    });
};

export const sendPhoneVerification = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Phone verification not implemented yet'
    });
};

export const verifyPhone = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Phone verification not implemented yet'
    });
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function calculateProfileCompletion(user) {
    let completion = 0;

    // Basic info (20%)
    if (user.firstName && user.lastName && user.phoneNumber) completion += 20;

    // Profile picture (10%)
    if (user.profilePicture?.url) completion += 10;

    // Location (15%)
    if (user.location?.pincode && user.location?.city) completion += 15;

    // Education (15%)
    if (user.education?.highestQualification) completion += 15;

    // Work (15%)
    if (user.work?.employmentStatus) completion += 15;

    // Social links (10%)
    if (user.socialLinks && Object.values(user.socialLinks).some(link => link)) completion += 10;

    // Verification (15%)
    if (user.verification?.email && user.verification?.phone) completion += 15;

    return completion;
}

async function checkAndAwardBadges(user) {
    const badges = user.badges || [];
    const badgeNames = badges.map(b => b.name);

    // Welcome Badge - Profile 100% complete
    if (user.profileCompletion === 100 && !badgeNames.includes('Welcome Badge')) {
        user.badges.push({
            name: 'Welcome Badge',
            icon: '👋',
            description: 'Completed your profile',
            earnedAt: new Date()
        });
    }

    // Active Citizen - 10 complaints filed
    if (user.stats?.totalComplaints >= 10 && !badgeNames.includes('Active Citizen')) {
        user.badges.push({
            name: 'Active Citizen',
            icon: '📝',
            description: 'Filed 10 complaints',
            earnedAt: new Date()
        });
    }

    // Problem Solver - 5 complaints resolved
    if (user.stats?.resolvedComplaints >= 5 && !badgeNames.includes('Problem Solver')) {
        user.badges.push({
            name: 'Problem Solver',
            icon: '✅',
            description: '5 complaints resolved',
            earnedAt: new Date()
        });
    }

    // Community Hero - 25 complaints resolved
    if (user.stats?.resolvedComplaints >= 25 && !badgeNames.includes('Community Hero')) {
        user.badges.push({
            name: 'Community Hero',
            icon: '🦸',
            description: '25 complaints resolved',
            earnedAt: new Date()
        });
    }

    // Verified User - Email + Phone verified
    if (user.verification?.email && user.verification?.phone && !badgeNames.includes('Verified User')) {
        user.badges.push({
            name: 'Verified User',
            icon: '✓',
            description: 'Completed all verifications',
            earnedAt: new Date()
        });
    }

    // Save if new badges were added
    if (user.badges.length > badges.length) {
        await user.save();
    }
}
