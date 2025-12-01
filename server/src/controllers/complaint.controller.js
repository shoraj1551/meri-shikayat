/**
 * Complaint controller
 */

import Complaint from '../models/Complaint.js';

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res) => {
    try {
        const { title, description, category, priority, location } = req.body;

        // Prepare media object
        const media = {
            text: description,
            images: [],
            audio: [],
            video: []
        };

        // Process uploaded files
        if (req.files) {
            if (req.files.images) {
                media.images = req.files.images.map(file => ({
                    url: `/uploads/images/${file.filename}`,
                    filename: file.filename,
                    uploadedAt: new Date()
                }));
            }
            if (req.files.videos) {
                media.video = req.files.videos.map(file => ({
                    url: `/uploads/videos/${file.filename}`,
                    filename: file.filename,
                    uploadedAt: new Date()
                }));
            }
            if (req.files.audio) {
                media.audio = req.files.audio.map(file => ({
                    url: `/uploads/audio/${file.filename}`,
                    filename: file.filename,
                    uploadedAt: new Date()
                }));
            }
        }

        // Create complaint
        const complaint = await Complaint.create({
            user: req.user.id,
            title,
            description,
            category,
            priority: priority || 'medium',
            location: location ? JSON.parse(location) : undefined,
            media
        });

        res.status(201).json({
            success: true,
            message: 'Complaint created successfully',
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        // For regular users, only show their complaints
        if (req.user.role !== 'admin') {
            query.user = req.user.id;
        }

        const complaints = await Complaint.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Complaint.countDocuments(query);

        res.status(200).json({
            success: true,
            data: complaints,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('comments.user', 'name');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user owns the complaint or is admin
        if (complaint.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this complaint'
            });
        }

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
export const updateComplaint = async (req, res) => {
    try {
        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user owns the complaint or is admin
        if (complaint.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this complaint'
            });
        }

        // Update complaint
        complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Complaint updated successfully',
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
export const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user owns the complaint or is admin
        if (complaint.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this complaint'
            });
        }

        await complaint.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add comment to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        complaint.comments.push({
            user: req.user.id,
            text,
            createdAt: new Date()
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

