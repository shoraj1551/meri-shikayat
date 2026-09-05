import Complaint from '../models/Complaint.js';
import { betaFeatureUnavailable } from '../middleware/betaRestrictions.js';

// Kept as disabled exports so alternate router imports cannot restore unsafe writes.
export const createGuestComplaint = betaFeatureUnavailable;
export const claimGuestComplaint = betaFeatureUnavailable;

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
            canClaim: false
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
