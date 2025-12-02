import Complaint from '../models/Complaint.js';

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User)
export const createComplaint = async (req, res) => {
    try {
        const { title, description, category, type, location } = req.body;

        // Handle file upload
        let mediaUrl = null;
        if (req.file) {
            // In production, this would be a cloud URL
            // For now, it's the relative path to the uploaded file
            mediaUrl = `/uploads/${req.file.filename}`;
        }

        // Parse location if it's sent as a string (from FormData)
        let parsedLocation = location;
        if (typeof location === 'string') {
            try {
                parsedLocation = JSON.parse(location);
            } catch (e) {
                console.error('Error parsing location:', e);
            }
        }

        const complaint = await Complaint.create({
            user: req.user.id,
            type,
            title,
            description,
            category,
            mediaUrl,
            location: parsedLocation
        });

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Create Complaint Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating complaint',
            error: error.message
        });
    }
};

// @desc    Get all complaints for logged in user
// @route   GET /api/complaints/my-complaints
// @access  Private (User)
export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user.id })
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
