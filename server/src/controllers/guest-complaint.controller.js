import Complaint from '../models/Complaint.js';
import { betaFeatureUnavailable } from '../middleware/betaRestrictions.js';

// Kept as disabled exports so alternate router imports cannot restore unsafe writes.
export const createGuestComplaint = betaFeatureUnavailable;
export const claimGuestComplaint = betaFeatureUnavailable;

export async function searchComplaintById(req, res) {
    try {
        const { complaintId } = req.params;

        const complaint = await Complaint.findOne({
            complaintId,
            user: req.user._id,
            isGuest: { $ne: true }
        })
            .select('complaintId status priority category customCategory')
            .populate('category', 'name')
            .lean();

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Status lookup is intentionally minimal. Full complaint details are
        // available only through the authenticated owner's complaint listing.
        const responseData = {
            complaintId: complaint.complaintId,
            status: complaint.status,
            priority: complaint.priority,
            category: complaint.category?.name || complaint.customCategory || null
        };

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
