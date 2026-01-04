/**
 * Complaint Stories Controller
 * Handles Hype, Comment, Share, and Feed
 */

import Complaint from '../models/Complaint.js';

export const getStoriesFeed = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        // Custom Algorithm for "Hot" stories could be implemented here
        // For now, simple chronological Order of public stories
        const stories = await Complaint.find({ isStory: true })
            .sort({ createdAt: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('user', 'firstName lastName')
            .populate('category', 'name')
            .populate('comments.user', 'firstName lastName');

        res.json({ success: true, count: stories.length, data: stories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleHype = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

        const userId = req.user._id;
        const index = complaint.hypes.indexOf(userId);

        if (index === -1) {
            complaint.hypes.push(userId);
        } else {
            complaint.hypes.splice(index, 1);
        }

        await complaint.save();
        res.json({ success: true, hypes: complaint.hypes.length, isHyped: index === -1 });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Text required' });

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

        const comment = {
            user: req.user._id,
            text,
            createdAt: new Date()
        };

        complaint.comments.push(comment);
        await complaint.save();

        // Populate user for return
        const populatedComplaint = await complaint.populate('comments.user', 'firstName lastName');
        const newComment = populatedComplaint.comments[populatedComplaint.comments.length - 1];

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const trackShare = async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { $inc: { shares: 1 } },
            { new: true }
        );
        res.json({ success: true, shares: complaint.shares });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
