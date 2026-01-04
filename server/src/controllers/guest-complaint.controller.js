/**
 * Guest Complaint Controller Functions
 * Handles guest complaint submission, search, and claiming
 */

import Complaint from '../models/Complaint.js';
import Media from '../models/Media.js';
import { generateComplaintId } from '../services/complaintId.service.js';

/**
 * Create guest complaint (no authentication required)
 * @route POST /api/complaints/guest
 */
export async function createGuestComplaint(req, res) {
    try {
        const { description, category, customCategory, location, guestContact } = req.body;

        // Validate required fields
        if (!description || description.length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 20 characters'
            });
        }

        if (!category && !customCategory) {
            return res.status(400).json({
                success: false,
                message: 'Please select a category or provide a custom category'
            });
        }

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: 'Location is required'
            });
        }

        // Generate unique complaint ID
        const complaintId = await generateComplaintId();

        // Handle media upload if present
        let mediaIds = [];
        if (req.file) {
            let mediaType = 'image';
            if (req.file.mimetype.startsWith('video')) mediaType = 'video';
            else if (req.file.mimetype.startsWith('audio')) mediaType = 'audio';

            const media = await Media.create({
                complaint: null,
                uploadedBy: null, // Guest upload
                type: mediaType,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/${req.file.filename}`
            });
            mediaIds.push(media._id);
        }

        // Create guest complaint
        const complaint = await Complaint.create({
            complaintId,
            isGuest: true,
            guestContact: guestContact || {},
            type: req.file ? (req.file.mimetype.startsWith('image') ? 'image' : 'text') : 'text',
            title: description.substring(0, 100), // Auto-generate title from description
            description,
            category: category || null,
            customCategory: customCategory || null,
            media: mediaIds,
            location
        });

        // Update media with complaint reference
        if (mediaIds.length > 0) {
            await Media.updateMany(
                { _id: { $in: mediaIds } },
                { complaint: complaint._id }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully!',
            data: {
                complaintId: complaint.complaintId,
                id: complaint._id
            }
        });
    } catch (error) {
        console.error('Create Guest Complaint Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit complaint. Please try again.'
        });
    }
}

/**
 * Search complaint by ID (public endpoint)
 * @route GET /api/complaints/search/:complaintId
 */
export async function searchComplaintById(req, res) {
    try {
        const { complaintId } = req.params;

        const complaint = await Complaint.findOne({ complaintId })
            .populate('category')
            .populate('department')
            .populate('media')
            .populate('user', 'firstName lastName');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Return limited info for guest complaints
        const responseData = {
            complaintId: complaint.complaintId,
            status: complaint.status,
            priority: complaint.priority,
            description: complaint.description,
            category: complaint.category?.name || complaint.customCategory,
            location: complaint.location,
            createdAt: complaint.createdAt,
            isGuest: complaint.isGuest,
            canClaim: complaint.isGuest && !complaint.user
        };

        // Add user info if authenticated complaint
        if (!complaint.isGuest && complaint.user) {
            responseData.submittedBy = `${complaint.user.firstName} ${complaint.user.lastName}`;
        }

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Search Complaint Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search complaint'
        });
    }
}

/**
 * Claim guest complaint (link to user account)
 * @route POST /api/complaints/:complaintId/claim
 * @access Private
 */
export async function claimGuestComplaint(req, res) {
    try {
        const { complaintId } = req.params;

        const complaint = await Complaint.findOne({ complaintId });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        if (!complaint.isGuest) {
            return res.status(400).json({
                success: false,
                message: 'This complaint is already linked to an account'
            });
        }

        if (complaint.user) {
            return res.status(400).json({
                success: false,
                message: 'This complaint has already been claimed'
            });
        }

        // Link complaint to user
        complaint.user = req.user.id;
        complaint.isGuest = false;
        await complaint.save();

        // Update user stats
        await req.user.constructor.findByIdAndUpdate(req.user.id, {
            $inc: {
                'stats.totalComplaints': 1,
                'stats.impactScore': 5
            }
        });

        res.json({
            success: true,
            message: 'Complaint successfully linked to your account!',
            data: complaint
        });
    } catch (error) {
        console.error('Claim Complaint Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to claim complaint'
        });
    }
}
