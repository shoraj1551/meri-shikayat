import Contractor from '../models/Contractor.js';
import ContractorAssignment from '../models/ContractorAssignment.js';

/**
 * Get all active contractors
 * GET /api/contractors
 */
export const getAllContractors = async (req, res) => {
    try {
        const { specialization, city, verified } = req.query;

        // Build query
        const query = { isActive: true, status: 'active' };

        if (specialization) {
            query.specialization = specialization;
        }

        if (city) {
            query.city = city;
        }

        if (verified === 'true') {
            query.isVerified = true;
        }

        const contractors = await Contractor.find(query)
            .select('-certifications -__v')
            .sort({ avgRating: -1, totalJobsCompleted: -1 });

        const formattedContractors = contractors.map(contractor => ({
            id: contractor._id,
            companyName: contractor.companyName,
            companyNameHindi: contractor.companyNameHindi,
            primaryContact: contractor.primaryContactPerson,
            email: contractor.email,
            phone: contractor.phone,
            address: contractor.address,
            city: contractor.city,
            specialization: contractor.specialization,
            serviceAreas: contractor.serviceAreas,
            avgRating: contractor.avgRating,
            totalJobsCompleted: contractor.totalJobsCompleted,
            isVerified: contractor.isVerified,
            establishedYear: contractor.establishedYear
        }));

        res.json({
            success: true,
            count: formattedContractors.length,
            data: formattedContractors
        });
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contractors',
            error: error.message
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

        const contractor = await Contractor.findById(id);

        if (!contractor) {
            return res.status(404).json({
                success: false,
                message: 'Contractor not found'
            });
        }

        // Get recent assignments
        const recentAssignments = await ContractorAssignment.find({
            contractor: contractor._id
        })
            .populate('complaint', 'title status')
            .populate('department', 'name')
            .sort({ assignedDate: -1 })
            .limit(10);

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
            id: contractor._id,
            companyName: contractor.companyName,
            companyNameHindi: contractor.companyNameHindi,
            registrationNumber: contractor.registrationNumber,
            gstNumber: contractor.gstNumber,
            panNumber: contractor.panNumber,
            contact: {
                primaryPerson: contractor.primaryContactPerson,
                email: contractor.email,
                phone: contractor.phone,
                alternatePhone: contractor.alternatePhone
            },
            address: {
                street: contractor.address,
                city: contractor.city,
                state: contractor.state,
                pincode: contractor.pincode
            },
            specialization: contractor.specialization,
            serviceAreas: contractor.serviceAreas,
            establishedYear: contractor.establishedYear,
            contract: {
                startDate: contractor.contractStartDate,
                endDate: contractor.contractEndDate,
                value: contractor.contractValue
            },
            certifications: contractor.certifications,
            performance: {
                totalJobsCompleted: contractor.totalJobsCompleted,
                avgRating: contractor.avgRating,
                onTimeCompletion: `${onTimeRate}%`
            },
            isVerified: contractor.isVerified,
            status: contractor.status,
            recentJobs: recentAssignments.map(assignment => ({
                id: assignment._id,
                complaintTitle: assignment.complaint?.title,
                department: assignment.department?.name,
                assignedDate: assignment.assignedDate,
                completionDate: assignment.actualCompletionDate,
                status: assignment.status,
                rating: assignment.rating
            }))
        };

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error fetching contractor details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contractor details',
            error: error.message
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

        const contractor = await Contractor.findById(id);

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
            message: 'Error fetching contractor statistics',
            error: error.message
        });
    }
};
