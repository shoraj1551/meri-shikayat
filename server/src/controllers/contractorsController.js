import mongoose from 'mongoose';
import Contractor from '../models/Contractor.js';
import ContractorAssignment from '../models/ContractorAssignment.js';

const PUBLIC_CONTRACTOR_FIELDS = [
    '_id', 'companyName', 'companyNameHindi', 'city', 'state',
    'specialization', 'serviceAreas', 'establishedYear',
    'totalJobsCompleted', 'avgRating', 'isVerified'
].join(' ');

const publicContractorQuery = Object.freeze({
    isActive: true,
    isVerified: true,
    status: 'active'
});

const formatPublicContractor = contractor => ({
    id: contractor._id,
    companyName: contractor.companyName,
    companyNameHindi: contractor.companyNameHindi,
    city: contractor.city,
    state: contractor.state,
    specialization: contractor.specialization,
    serviceAreas: contractor.serviceAreas,
    establishedYear: contractor.establishedYear,
    totalJobsCompleted: contractor.totalJobsCompleted,
    avgRating: contractor.avgRating,
    isVerified: contractor.isVerified
});

export const getMyContractorDashboard = async (req, res) => {
    if (req.user.userType !== 'contractor') {
        return res.status(403).json({ success: false, message: 'Contractor account required' });
    }

    try {
        const assignments = await ContractorAssignment.find({ contractor: req.user._id })
            .sort({ assignedDate: -1 })
            .populate({ path: 'complaint', select: 'complaintId title status priority location category', populate: { path: 'category', select: 'name' } })
            .lean();
        const completed = assignments.filter(item => item.status === 'completed');
        res.json({ success: true, data: {
            contractor: {
                companyName: req.user.contractorProfile?.companyName,
                verificationStatus: req.user.status,
                rating: req.user.contractorProfile?.rating || 0
            },
            stats: {
                assigned: assignments.length,
                inProgress: assignments.filter(item => item.status === 'in_progress').length,
                completed: completed.length,
                totalEarnings: completed.reduce((total, item) => total + (item.actualCost || 0), 0)
            },
            assignments
        } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to load contractor dashboard' });
    }
};

/**
 * Get all active contractors
 * GET /api/contractors
 */
export const getAllContractors = async (req, res) => {
    try {
        const { specialization, city } = req.query;

        // Build query
        const query = { ...publicContractorQuery };

        if (specialization) {
            query.specialization = specialization;
        }

        if (city) {
            query.city = city;
        }

        const contractors = await Contractor.find(query)
            .select(PUBLIC_CONTRACTOR_FIELDS)
            .lean()
            .sort({ avgRating: -1, totalJobsCompleted: -1 });

        const formattedContractors = contractors.map(formatPublicContractor);

        res.json({
            success: true,
            count: formattedContractors.length,
            data: formattedContractors
        });
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contractors'
        });
    }
};

/**
 * Get detailed contractor information
 * GET /api/contractors/:id
 */
export const getContractorById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ success: false, message: 'Contractor not found' });
        }

        const contractor = await Contractor.findOne({ _id: id, ...publicContractorQuery })
            .select(PUBLIC_CONTRACTOR_FIELDS)
            .lean();

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Calculate on-time completion rate
        const completedAssignments = await ContractorAssignment.find({
            contractor: contractor._id,
            status: 'completed',
            actualCompletionDate: { $exists: true },
            expectedCompletionDate: { $exists: true }
        });

        const onTimeCount = completedAssignments.filter(a =>
            a.actualCompletionDate <= a.expectedCompletionDate
        ).length;

        const onTimeRate = completedAssignments.length > 0
            ? ((onTimeCount / completedAssignments.length) * 100).toFixed(0)
            : 0;

        const response = {
            ...formatPublicContractor(contractor),
            performance: {
                totalJobsCompleted: contractor.totalJobsCompleted,
                avgRating: contractor.avgRating,
                onTimeCompletion: `${onTimeRate}%`
            }
        };

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error fetching contractor details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contractor details'
        });
    }
};

/**
 * Get contractor statistics
 * GET /api/contractors/:id/statistics
 */
export const getContractorStatistics = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).json({ success: false, message: 'Contractor not found' });
        }

        const contractor = await Contractor.findOne({ _id: id, ...publicContractorQuery })
            .select('_id avgRating')
            .lean();

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        const assignments = await ContractorAssignment.find({
            contractor: contractor._id
        });

        const stats = {
            total: assignments.length,
            assigned: assignments.filter(a => a.status === 'assigned').length,
            inProgress: assignments.filter(a => a.status === 'in_progress').length,
            completed: assignments.filter(a => a.status === 'completed').length,
            cancelled: assignments.filter(a => a.status === 'cancelled').length,
            avgRating: contractor.avgRating,
            totalRatings: assignments.filter(a => a.rating).length
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching contractor statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contractor statistics'
        });
    }
};
