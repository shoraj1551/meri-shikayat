/**
 * Complaint Management Controller for Admins
 * Handles viewing, updating, and managing complaints
 */

import Complaint from '../models/Complaint.js';
import Admin from '../models/Admin.js';

// @desc    Get all complaints for admin with filters and pagination
// @route   GET /api/admin/complaints
// @access  Private (Admin with viewComplaints permission)
export const getComplaints = async (req, res) => {
    try {
        const {
            status,
            priority,
            category,
            assignedTo,
            page = 1,
            limit = 20,
            search
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;
        if (assignedTo) filter.assignedTo = assignedTo;

        // Search in title and description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get complaints with populated fields
        const complaints = await Complaint.find(filter)
            .populate('user', 'firstName lastName email phone')
            .populate('assignedTo', 'firstName lastName email')
            .populate('category')
            .populate('department')
            .populate('media')
            .sort('-createdAt')
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const total = await Complaint.countDocuments(filter);

        res.json({
            success: true,
            data: {
                complaints,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching complaints'
        });
    }
};

// @desc    Get single complaint details
// @route   GET /api/admin/complaints/:id
// @access  Private (Admin with viewComplaints permission)
export const getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'firstName lastName email phone location')
            .populate('assignedTo', 'firstName lastName email role')
            .populate('category')
            .populate('department')
            .populate('media')
            .populate('adminComments.admin', 'firstName lastName')
            .populate('internalNotes.addedBy', 'firstName lastName')
            .populate('statusHistory.changedBy', 'firstName lastName');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        res.json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching complaint'
        });
    }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private (Admin with editComplaints permission)
export const updateComplaintStatus = async (req, res) => {
    try {
        const { status, reason } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Add to status history
        complaint.statusHistory.push({
            status,
            changedBy: req.admin._id,
            changedAt: Date.now(),
            reason: reason || `Status changed to ${status}`
        });

        // Update current status
        complaint.status = status;

        await complaint.save();

        // Populate for response
        await complaint.populate('statusHistory.changedBy', 'firstName lastName');

        res.json({
            success: true,
            message: 'Complaint status updated successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating complaint status'
        });
    }
};

// @desc    Assign complaint to admin
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private (Admin with editComplaints permission)
export const assignComplaint = async (req, res) => {
    try {
        const { assignedTo, reason } = req.body;

        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID is required for assignment'
            });
        }

        // Check if assignee exists and is active
        const assignee = await Admin.findById(assignedTo);
        if (!assignee || assignee.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive admin'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Update assignment
        complaint.assignedTo = assignedTo;

        // Add internal note about assignment
        complaint.internalNotes.push({
            note: reason || `Assigned to ${assignee.firstName} ${assignee.lastName}`,
            addedBy: req.admin._id,
            addedAt: Date.now()
        });

        await complaint.save();

        // Populate for response
        await complaint.populate('assignedTo', 'firstName lastName email role');

        res.json({
            success: true,
            message: 'Complaint assigned successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Error assigning complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Server error assigning complaint'
        });
    }
};

// @desc    Add internal note to complaint
// @route   POST /api/admin/complaints/:id/notes
// @access  Private (Admin with viewComplaints permission)
export const addInternalNote = async (req, res) => {
    try {
        const { note } = req.body;

        if (!note || note.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Note content is required'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Add internal note
        complaint.internalNotes.push({
            note: note.trim(),
            addedBy: req.admin._id,
            addedAt: Date.now()
        });

        await complaint.save();

        // Populate for response
        await complaint.populate('internalNotes.addedBy', 'firstName lastName');

        res.json({
            success: true,
            message: 'Internal note added successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Error adding internal note:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding internal note'
        });
    }
};

// @desc    Update complaint priority
// @route   PUT /api/admin/complaints/:id/priority
// @access  Private (Admin with editComplaints permission)
export const updateComplaintPriority = async (req, res) => {
    try {
        const { priority } = req.body;

        if (!priority || !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Valid priority (low, medium, high) is required'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        complaint.priority = priority;

        // Add internal note
        complaint.internalNotes.push({
            note: `Priority changed to ${priority}`,
            addedBy: req.admin._id,
            addedAt: Date.now()
        });

        await complaint.save();

        res.json({
            success: true,
            message: 'Complaint priority updated successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Error updating complaint priority:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating complaint priority'
        });
    }
};
