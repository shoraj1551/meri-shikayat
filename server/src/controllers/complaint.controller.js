import Complaint from '../models/Complaint.js';
import Media from '../models/Media.js';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User)
export const createComplaint = async (req, res) => {
    try {
        const { title, description, category, type, location } = req.body;

        // Parse location if it's sent as a string (from FormData)
        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                console.error('Error parsing location:', e);
            }
        }

        // Create Media document if file uploaded
        let mediaIds = [];
        if (req.file) {
            // Determine media type from MIME type
            let mediaType = 'document';
            if (req.file.mimetype.startsWith('image')) {
                mediaType = 'image';
            } else if (req.file.mimetype.startsWith('video')) {
                mediaType = 'video';
            } else if (req.file.mimetype.startsWith('audio')) {
                mediaType = 'audio';
            }

            const media = await Media.create({
                complaint: null, // Will be set after complaint creation
                uploadedBy: req.user.id,
                type: mediaType,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/${req.file.filename}`
            });
            mediaIds.push(media._id);
        }

        const complaint = await Complaint.create({
            user: req.user.id,
            type,
            title,
            description,
            category,
            media: mediaIds,
            location: parsedLocation
        });

        // Update Media documents with complaint reference
        if (mediaIds.length > 0) {
            await Media.updateMany(
                { _id: { $in: mediaIds } },
                { complaint: complaint._id }
            );
        }

        // Update user stats - increment totalComplaints and impactScore
        await req.user.constructor.findByIdAndUpdate(req.user.id, {
            $inc: {
                'stats.totalComplaints': 1,
                'stats.impactScore': 5  // 5 points for filing a complaint
            }
        });

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Create Complaint Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating complaint'
        });
    }
};

// @desc    Get all complaints for logged in user
// @route   GET /api/complaints/my-complaints
// @access  Private (User)
export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user.id })
            .populate('category')
            .populate('department')
            .populate('media')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        console.error('Get My Complaints Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching complaints'
        });
    }
};
// @desc    Get nearby complaints based on user's location
// @route   GET /api/complaints/nearby
// @access  Private (User)
export const getNearbyComplaints = async (req, res) => {
    try {
        const user = await req.user;

        // If user has no location set, return empty
        if (!user.location || !user.location.city) {
            return res.json({
                success: true,
                count: 0,
                data: []
            });
        }

        // Find complaints in the same city, excluding user's own complaints
        const complaints = await Complaint.find({
            'location.city': user.location.city,
            user: { $ne: req.user.id }
        })
            .populate('category')
            .populate('department')
            .populate('media')
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'firstName lastName');

        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        console.error('Get Nearby Complaints Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching nearby complaints'
        });
    }
};
