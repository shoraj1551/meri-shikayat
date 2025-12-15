import Department from '../models/Department.js';
import DepartmentOffice from '../models/DepartmentOffice.js';
import DepartmentPersonnel from '../models/DepartmentPersonnel.js';
import DepartmentStatistics from '../models/DepartmentStatistics.js';

/**
 * Get all departments with basic info
 * GET /api/departments
 */
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .select('code name nameHindi icon category color description')
            .sort({ category: 1, name: 1 });

        res.json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
};

/**
 * Get detailed department info with statistics, offices, and personnel
 * GET /api/departments/:code
 */
export const getDepartmentByCode = async (req, res) => {
    try {
        const { code } = req.params;

        // Find department
        const department = await Department.findOne({ code, isActive: true });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Get all-time statistics
        const statistics = await DepartmentStatistics.findOne({
            department: department._id,
            periodType: 'all_time'
        });

        // Get offices
        const offices = await DepartmentOffice.find({
            department: department._id,
            isActive: true
        }).select('-__v');

        // Get personnel
        const personnel = await DepartmentPersonnel.find({
            department: department._id,
            isActive: true
        })
            .sort({ hierarchyLevel: 1 })
            .select('-__v');

        // Format response
        const response = {
            id: department._id,
            code: department.code,
            name: department.name,
            nameHindi: department.nameHindi,
            icon: department.icon,
            category: department.category,
            color: department.color,
            description: department.description,
            statistics: statistics ? {
                totalComplaints: statistics.totalComplaints,
                received: statistics.receivedComplaints,
                inProgress: statistics.inProgressComplaints,
                resolved: statistics.resolvedComplaints,
                rejected: statistics.rejectedComplaints,
                avgResponseTime: `${statistics.avgResponseTimeHours.toFixed(1)} hours`,
                avgResolutionTime: `${statistics.avgResolutionTimeHours.toFixed(1)} hours`,
                resolutionRate: `${statistics.resolutionRate.toFixed(0)}%`,
                avgRating: statistics.avgRating.toFixed(1),
                totalRatings: statistics.totalRatings
            } : null,
            offices: offices.map(office => ({
                id: office._id,
                name: office.officeName,
                nameHindi: office.officeNameHindi,
                officeCode: office.officeCode,
                address: office.address,
                city: office.city,
                state: office.state,
                pincode: office.pincode,
                phones: office.contactNumbers.map(c => c.number),
                emails: office.emails.map(e => e.address),
                officeHours: office.officeHours,
                is24x7: office.is24x7,
                location: office.location
            })),
            personnel: personnel.map(person => ({
                id: person._id,
                name: person.fullName,
                designation: person.designation,
                designationHindi: person.designationHindi,
                email: person.email,
                phone: person.phone,
                hierarchyLevel: person.hierarchyLevel
            }))
        };

        res.json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error fetching department details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department details',
            error: error.message
        });
    }
};

/**
 * Get all offices for a specific department
 * GET /api/departments/:code/offices
 */
export const getDepartmentOffices = async (req, res) => {
    try {
        const { code } = req.params;

        const department = await Department.findOne({ code, isActive: true });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const offices = await DepartmentOffice.find({
            department: department._id,
            isActive: true
        }).select('-__v');

        const formattedOffices = offices.map(office => ({
            id: office._id,
            name: office.officeName,
            nameHindi: office.officeNameHindi,
            officeCode: office.officeCode,
            address: office.address,
            city: office.city,
            state: office.state,
            pincode: office.pincode,
            contactNumbers: office.contactNumbers,
            emails: office.emails,
            officeHours: office.officeHours,
            is24x7: office.is24x7,
            location: office.location
        }));

        res.json({
            success: true,
            data: formattedOffices
        });
    } catch (error) {
        console.error('Error fetching department offices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department offices',
            error: error.message
        });
    }
};

/**
 * Get detailed statistics for a department
 * GET /api/departments/:code/statistics
 */
export const getDepartmentStatistics = async (req, res) => {
    try {
        const { code } = req.params;
        const { period = 'all_time' } = req.query;

        const department = await Department.findOne({ code, isActive: true });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const statistics = await DepartmentStatistics.findOne({
            department: department._id,
            periodType: period
        });

        if (!statistics) {
            return res.json({
                success: true,
                data: {
                    overall: {
                        totalComplaints: 0,
                        received: 0,
                        inProgress: 0,
                        resolved: 0,
                        rejected: 0,
                        resolutionRate: '0%'
                    },
                    performance: {
                        avgResponseTime: '0 hours',
                        avgResolutionTime: '0 hours',
                        avgRating: 0,
                        totalRatings: 0
                    }
                }
            });
        }

        res.json({
            success: true,
            data: {
                overall: {
                    totalComplaints: statistics.totalComplaints,
                    received: statistics.receivedComplaints,
                    inProgress: statistics.inProgressComplaints,
                    resolved: statistics.resolvedComplaints,
                    rejected: statistics.rejectedComplaints,
                    resolutionRate: `${statistics.resolutionRate.toFixed(0)}%`
                },
                performance: {
                    avgResponseTime: `${statistics.avgResponseTimeHours.toFixed(1)} hours`,
                    avgResolutionTime: `${statistics.avgResolutionTimeHours.toFixed(1)} hours`,
                    avgRating: statistics.avgRating.toFixed(1),
                    totalRatings: statistics.totalRatings
                }
            }
        });
    } catch (error) {
        console.error('Error fetching department statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department statistics',
            error: error.message
        });
    }
};
