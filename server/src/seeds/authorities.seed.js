import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import DepartmentOffice from '../models/DepartmentOffice.js';
import DepartmentPersonnel from '../models/DepartmentPersonnel.js';
import DepartmentStatistics from '../models/DepartmentStatistics.js';
import Contractor from '../models/Contractor.js';
import { connectDatabase } from '../config/database.js';

// Load environment variables
dotenv.config();

/**
 * Seed data for authorities and contractors
 * Run with: node src/seeds/authorities.seed.js
 */

const seedAuthorities = async () => {
    try {
        console.log('🌱 Starting authorities seed...');

        await connectDatabase();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await DepartmentOffice.deleteMany({});
        await DepartmentPersonnel.deleteMany({});
        await DepartmentStatistics.deleteMany({});
        await Contractor.deleteMany({});

        // Get all departments
        const departments = await Department.find({});
        console.log(`📋 Found ${departments.length} departments`);

        // Seed offices for each department
        console.log('🏢 Seeding offices...');
        const officesData = [];

        for (const dept of departments) {
            if (dept.code === 'municipal') {
                officesData.push(
                    {
                        department: dept._id,
                        officeName: 'Municipal Corporation - North Delhi',
                        officeNameHindi: 'नगर निगम - उत्तर दिल्ली',
                        officeCode: 'municipal_north',
                        address: 'Municipal Corporation Building, Civic Center, North Delhi - 110001',
                        city: 'New Delhi',
                        state: 'Delhi',
                        pincode: '110001',
                        officeHours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM',
                        location: { latitude: 28.7041, longitude: 77.1025 },
                        contactNumbers: [
                            { type: 'main', number: '+91-11-2345-6789', isPrimary: true },
                            { type: 'helpline', number: '+91-11-2345-6790' }
                        ],
                        emails: [
                            { type: 'complaints', address: 'complaints@municipal-north.gov.in', isPrimary: true },
                            { type: 'general', address: 'info@municipal-north.gov.in' }
                        ]
                    },
                    {
                        department: dept._id,
                        officeName: 'Municipal Corporation - South Delhi',
                        officeNameHindi: 'नगर निगम - दक्षिण दिल्ली',
                        officeCode: 'municipal_south',
                        address: 'Municipal Corporation Building, South Extension, South Delhi - 110049',
                        city: 'New Delhi',
                        state: 'Delhi',
                        pincode: '110049',
                        officeHours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM',
                        location: { latitude: 28.5706, longitude: 77.2144 },
                        contactNumbers: [
                            { type: 'main', number: '+91-11-2345-7890', isPrimary: true }
                        ],
                        emails: [
                            { type: 'complaints', address: 'complaints@municipal-south.gov.in', isPrimary: true }
                        ]
                    }
                );
            } else if (dept.code === 'police') {
                officesData.push(
                    {
                        department: dept._id,
                        officeName: 'Delhi Police - Central District',
                        officeNameHindi: 'दिल्ली पुलिस - केंद्रीय जिला',
                        officeCode: 'police_central',
                        address: 'Delhi Police Headquarters, ITO, New Delhi - 110002',
                        city: 'New Delhi',
                        state: 'Delhi',
                        pincode: '110002',
                        officeHours: '24/7 Emergency Services',
                        is24x7: true,
                        location: { latitude: 28.6304, longitude: 77.2177 },
                        contactNumbers: [
                            { type: 'emergency', number: '+91-11-100', isPrimary: true },
                            { type: 'main', number: '+91-11-2346-7890' }
                        ],
                        emails: [
                            { type: 'emergency', address: 'control@delhipolice.gov.in', isPrimary: true },
                            { type: 'complaints', address: 'complaints@delhipolice.gov.in' }
                        ]
                    }
                );
            } else if (dept.code === 'electricity') {
                officesData.push(
                    {
                        department: dept._id,
                        officeName: 'BSES Rajdhani - Customer Care Center',
                        officeNameHindi: 'बीएसईएस राजधानी - ग्राहक सेवा केंद्र',
                        officeCode: 'electricity_bses',
                        address: 'BSES Rajdhani Power Ltd., Nehru Place, New Delhi - 110019',
                        city: 'New Delhi',
                        state: 'Delhi',
                        pincode: '110019',
                        officeHours: 'Mon-Sat: 9:00 AM - 6:00 PM, Emergency: 24/7',
                        is24x7: true,
                        location: { latitude: 28.5494, longitude: 77.2501 },
                        contactNumbers: [
                            { type: 'helpline', number: '+91-11-1912', isPrimary: true },
                            { type: 'main', number: '+91-11-2347-8901' }
                        ],
                        emails: [
                            { type: 'complaints', address: 'complaints@bses.co.in', isPrimary: true },
                            { type: 'support', address: 'support@bses.co.in' }
                        ]
                    }
                );
            } else if (dept.code === 'water') {
                officesData.push(
                    {
                        department: dept._id,
                        officeName: 'Delhi Jal Board - Central Office',
                        officeNameHindi: 'दिल्ली जल बोर्ड - केंद्रीय कार्यालय',
                        officeCode: 'water_djb_central',
                        address: 'Delhi Jal Board, Varunalaya Phase-II, Karol Bagh, New Delhi - 110005',
                        city: 'New Delhi',
                        state: 'Delhi',
                        pincode: '110005',
                        officeHours: 'Mon-Fri: 9:00 AM - 5:00 PM, Emergency: 24/7',
                        is24x7: true,
                        location: { latitude: 28.6519, longitude: 77.1909 },
                        contactNumbers: [
                            { type: 'helpline', number: '+91-11-1916', isPrimary: true },
                            { type: 'main', number: '+91-11-2348-9012' }
                        ],
                        emails: [
                            { type: 'complaints', address: 'complaints@delhijal.gov.in', isPrimary: true },
                            { type: 'support', address: 'support@delhijal.gov.in' }
                        ]
                    }
                );
            } else {
                // Generic office for other departments
                officesData.push({
                    department: dept._id,
                    officeName: `${dept.name} - Main Office`,
                    officeNameHindi: `${dept.nameHindi} - मुख्य कार्यालय`,
                    officeCode: `${dept.code}_main`,
                    address: `${dept.name} Headquarters, Delhi`,
                    city: 'New Delhi',
                    state: 'Delhi',
                    pincode: '110001',
                    officeHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
                    contactNumbers: [
                        { type: 'main', number: `+91-11-2350-${Math.floor(1000 + Math.random() * 9000)}`, isPrimary: true }
                    ],
                    emails: [
                        { type: 'complaints', address: `complaints@${dept.code}.gov.in`, isPrimary: true }
                    ]
                });
            }
        }

        const offices = await DepartmentOffice.insertMany(officesData);
        console.log(`✅ Created ${offices.length} offices`);

        // Seed personnel
        console.log('👥 Seeding personnel...');
        const personnelData = [];

        for (const dept of departments) {
            const deptOffices = offices.filter(o => o.department.toString() === dept._id.toString());
            const mainOffice = deptOffices[0];

            if (dept.code === 'municipal') {
                personnelData.push(
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: 'Dr. Rajesh Kumar',
                        designation: 'Commissioner',
                        designationHindi: 'आयुक्त',
                        email: 'commissioner@municipal.gov.in',
                        phone: '+91-11-2345-6791',
                        hierarchyLevel: 1
                    },
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: 'Ms. Priya Sharma',
                        designation: 'Deputy Commissioner',
                        designationHindi: 'उप आयुक्त',
                        email: 'deputy@municipal.gov.in',
                        phone: '+91-11-2345-6792',
                        hierarchyLevel: 2
                    },
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: 'Er. Amit Verma',
                        designation: 'Chief Engineer',
                        designationHindi: 'मुख्य अभियंता',
                        email: 'engineer@municipal.gov.in',
                        phone: '+91-11-2345-6793',
                        hierarchyLevel: 2
                    }
                );
            } else if (dept.code === 'police') {
                personnelData.push(
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: 'Shri Rakesh Asthana',
                        designation: 'Commissioner of Police',
                        designationHindi: 'पुलिस आयुक्त',
                        email: 'cp@delhipolice.gov.in',
                        phone: '+91-11-2346-7891',
                        hierarchyLevel: 1
                    },
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: 'Shri Dinesh Kumar',
                        designation: 'Additional CP (Crime)',
                        designationHindi: 'अतिरिक्त सीपी (अपराध)',
                        email: 'acp-crime@delhipolice.gov.in',
                        phone: '+91-11-2346-7892',
                        hierarchyLevel: 2
                    },
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: 'Ms. Shweta Singh',
                        designation: 'DCP (Central)',
                        designationHindi: 'डीसीपी (केंद्रीय)',
                        email: 'dcp-central@delhipolice.gov.in',
                        phone: '+91-11-2346-7893',
                        hierarchyLevel: 3
                    }
                );
            } else {
                // Generic personnel for other departments
                personnelData.push(
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: `Head of ${dept.name}`,
                        designation: 'Director',
                        designationHindi: 'निदेशक',
                        email: `director@${dept.code}.gov.in`,
                        phone: `+91-11-2350-${Math.floor(1000 + Math.random() * 9000)}`,
                        hierarchyLevel: 1
                    },
                    {
                        department: dept._id,
                        office: mainOffice?._id,
                        fullName: `Deputy Head of ${dept.name}`,
                        designation: 'Deputy Director',
                        designationHindi: 'उप निदेशक',
                        email: `deputy@${dept.code}.gov.in`,
                        phone: `+91-11-2350-${Math.floor(1000 + Math.random() * 9000)}`,
                        hierarchyLevel: 2
                    }
                );
            }
        }

        const personnel = await DepartmentPersonnel.insertMany(personnelData);
        console.log(`✅ Created ${personnel.length} personnel`);

        // Seed statistics
        console.log('📊 Seeding statistics...');
        const statisticsData = [];
        const now = new Date();

        for (const dept of departments) {
            const baseComplaints = Math.floor(1000 + Math.random() * 5000);
            const resolved = Math.floor(baseComplaints * (0.8 + Math.random() * 0.15));
            const inProgress = Math.floor((baseComplaints - resolved) * 0.7);
            const received = baseComplaints - resolved - inProgress;

            statisticsData.push({
                department: dept._id,
                periodType: 'all_time',
                periodStart: new Date('2020-01-01'),
                periodEnd: now,
                totalComplaints: baseComplaints,
                receivedComplaints: received,
                inProgressComplaints: inProgress,
                resolvedComplaints: resolved,
                rejectedComplaints: 0,
                avgResponseTimeHours: 2 + Math.random() * 6,
                avgResolutionTimeHours: 24 + Math.random() * 72,
                resolutionRate: ((resolved / baseComplaints) * 100),
                avgRating: 3.5 + Math.random() * 1.5,
                totalRatings: Math.floor(resolved * 0.6)
            });
        }

        const statistics = await DepartmentStatistics.insertMany(statisticsData);
        console.log(`✅ Created ${statistics.length} statistics records`);

        // Seed contractors
        console.log('🏗️  Seeding contractors...');
        const contractorsData = [
            {
                companyName: 'ABC Services Pvt Ltd',
                companyNameHindi: 'एबीसी सर्विसेज प्रा. लिमिटेड',
                registrationNumber: 'REG001',
                gstNumber: 'GST001',
                primaryContactPerson: 'Mr. Ramesh Kumar',
                email: 'contact@abcservices.com',
                phone: '+91-98765-43210',
                address: '123, Industrial Area, Phase 1',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110020',
                specialization: ['sanitation', 'road_repair'],
                serviceAreas: ['North Delhi', 'Central Delhi'],
                establishedYear: 2010,
                contractStartDate: new Date('2023-01-01'),
                contractEndDate: new Date('2025-12-31'),
                contractValue: 5000000,
                totalJobsCompleted: 245,
                avgRating: 4.5,
                isVerified: true,
                certifications: [
                    {
                        name: 'ISO 9001:2015',
                        number: 'ISO123',
                        issuingAuthority: 'Bureau of Indian Standards',
                        issueDate: new Date('2022-01-01'),
                        expiryDate: new Date('2025-12-31'),
                        isVerified: true
                    }
                ],
                status: 'active'
            },
            {
                companyName: 'XYZ Infrastructure Ltd',
                companyNameHindi: 'एक्सवाईजेड इंफ्रास्ट्रक्चर लिमिटेड',
                registrationNumber: 'REG002',
                gstNumber: 'GST002',
                primaryContactPerson: 'Ms. Sunita Patel',
                email: 'info@xyzinfra.com',
                phone: '+91-98765-43211',
                address: '456, Sector 18, Noida',
                city: 'Noida',
                state: 'Uttar Pradesh',
                pincode: '201301',
                specialization: ['construction', 'road_repair'],
                serviceAreas: ['South Delhi', 'East Delhi'],
                establishedYear: 2015,
                contractStartDate: new Date('2023-06-01'),
                contractEndDate: new Date('2026-05-31'),
                contractValue: 7500000,
                totalJobsCompleted: 180,
                avgRating: 4.3,
                isVerified: true,
                status: 'active'
            },
            {
                companyName: 'Green Clean Solutions',
                companyNameHindi: 'ग्रीन क्लीन सॉल्यूशंस',
                registrationNumber: 'REG003',
                gstNumber: 'GST003',
                primaryContactPerson: 'Mr. Vikram Singh',
                email: 'contact@greenclean.com',
                phone: '+91-98765-43212',
                address: '789, Green Park',
                city: 'New Delhi',
                state: 'Delhi',
                pincode: '110016',
                specialization: ['sanitation', 'maintenance'],
                serviceAreas: ['West Delhi', 'South Delhi'],
                establishedYear: 2018,
                contractStartDate: new Date('2024-01-01'),
                contractEndDate: new Date('2026-12-31'),
                contractValue: 3500000,
                totalJobsCompleted: 120,
                avgRating: 4.7,
                isVerified: true,
                status: 'active'
            }
        ];

        const contractors = await Contractor.insertMany(contractorsData);
        console.log(`✅ Created ${contractors.length} contractors`);

        console.log('\n✅ Seed completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Offices: ${offices.length}`);
        console.log(`   - Personnel: ${personnel.length}`);
        console.log(`   - Statistics: ${statistics.length}`);
        console.log(`   - Contractors: ${contractors.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedAuthorities();
