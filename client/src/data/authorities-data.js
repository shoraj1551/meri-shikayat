/**
 * Authorities Data - Connected Government Departments
 * Centralized data for all government authorities
 */

export const authoritiesData = {
    municipal: {
        id: 'municipal',
        name: 'Municipal Corporation',
        nameHindi: 'नगर निगम',
        icon: '🏛️',
        category: 'Primary',
        color: '#1a237e',
        contact: {
            phone: ['+91-11-2345-6789', '+91-11-2345-6790'],
            email: ['complaints@municipal.gov.in', 'support@municipal.gov.in'],
            address: 'Municipal Corporation Building, Civic Center, New Delhi - 110001',
            hours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM'
        },
        personnel: [
            { role: 'Commissioner', name: 'Dr. Rajesh Kumar', email: 'commissioner@municipal.gov.in', phone: '+91-11-2345-6791' },
            { role: 'Deputy Commissioner', name: 'Ms. Priya Sharma', email: 'deputy@municipal.gov.in', phone: '+91-11-2345-6792' },
            { role: 'Chief Engineer', name: 'Er. Amit Verma', email: 'engineer@municipal.gov.in', phone: '+91-11-2345-6793' }
        ],
        responsibilities: [
            'Garbage collection and disposal',
            'Street cleaning and maintenance',
            'Public parks and gardens',
            'Building permits and approvals',
            'Property tax collection',
            'Birth and death certificates'
        ],
        stats: {
            totalComplaints: 5420,
            resolved: 4680,
            avgResponseTime: '2.5 days',
            resolutionRate: '86%'
        }
    },
    police: {
        id: 'police',
        name: 'Police Department',
        nameHindi: 'पुलिस विभाग',
        icon: '👮',
        category: 'Primary',
        color: '#0d47a1',
        contact: {
            phone: ['+91-11-100', '+91-11-2346-7890'],
            email: ['control@delhipolice.gov.in', 'complaints@delhipolice.gov.in'],
            address: 'Delhi Police Headquarters, ITO, New Delhi - 110002',
            hours: '24/7 Emergency Services'
        },
        personnel: [
            { role: 'Commissioner of Police', name: 'Shri Rakesh Asthana', email: 'cp@delhipolice.gov.in', phone: '+91-11-2346-7891' },
            { role: 'Additional CP (Crime)', name: 'Shri Dinesh Kumar', email: 'acp-crime@delhipolice.gov.in', phone: '+91-11-2346-7892' },
            { role: 'DCP (Central)', name: 'Ms. Shweta Singh', email: 'dcp-central@delhipolice.gov.in', phone: '+91-11-2346-7893' }
        ],
        responsibilities: [
            'Law and order maintenance',
            'Crime prevention and investigation',
            'Traffic management',
            'Emergency response (100)',
            'Public safety and security',
            'Women and child safety'
        ],
        stats: {
            totalComplaints: 3280,
            resolved: 2950,
            avgResponseTime: '1.2 days',
            resolutionRate: '90%'
        }
    },
    electricity: {
        id: 'electricity',
        name: 'Electricity Board',
        nameHindi: 'बिजली बोर्ड',
        icon: '⚡',
        category: 'Primary',
        color: '#f57c00',
        contact: {
            phone: ['+91-11-1912', '+91-11-2347-8901'],
            email: ['complaints@bses.co.in', 'support@bses.co.in'],
            address: 'BSES Rajdhani Power Ltd., Nehru Place, New Delhi - 110019',
            hours: 'Mon-Sat: 9:00 AM - 6:00 PM, Emergency: 24/7'
        },
        personnel: [
            { role: 'CEO', name: 'Mr. Amal Sinha', email: 'ceo@bses.co.in', phone: '+91-11-2347-8902' },
            { role: 'Chief Engineer', name: 'Er. Suresh Patel', email: 'ce@bses.co.in', phone: '+91-11-2347-8903' },
            { role: 'Customer Care Head', name: 'Ms. Neha Gupta', email: 'customercare@bses.co.in', phone: '+91-11-2347-8904' }
        ],
        responsibilities: [
            'Power supply and distribution',
            'Meter reading and billing',
            'Power outage resolution',
            'New connection requests',
            'Load management',
            'Electrical safety inspections'
        ],
        stats: {
            totalComplaints: 6850,
            resolved: 6120,
            avgResponseTime: '1.8 days',
            resolutionRate: '89%'
        }
    },
    water: {
        id: 'water',
        name: 'Water Supply Department',
        nameHindi: 'जल आपूर्ति विभाग',
        icon: '💧',
        category: 'Primary',
        color: '#0288d1',
        contact: {
            phone: ['+91-11-1916', '+91-11-2348-9012'],
            email: ['complaints@delhijal.gov.in', 'support@delhijal.gov.in'],
            address: 'Delhi Jal Board, Varunalaya Phase-II, Karol Bagh, New Delhi - 110005',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM, Emergency: 24/7'
        },
        personnel: [
            { role: 'CEO', name: 'Shri Udit Prakash Rai', email: 'ceo@delhijal.gov.in', phone: '+91-11-2348-9013' },
            { role: 'Chief Engineer', name: 'Er. Vinod Kumar', email: 'ce@delhijal.gov.in', phone: '+91-11-2348-9014' },
            { role: 'Customer Service Head', name: 'Ms. Kavita Sharma', email: 'cs@delhijal.gov.in', phone: '+91-11-2348-9015' }
        ],
        responsibilities: [
            'Water supply and distribution',
            'Pipeline maintenance and repairs',
            'Water quality monitoring',
            'New connection requests',
            'Billing and meter reading',
            'Sewage and drainage management'
        ],
        stats: {
            totalComplaints: 4920,
            resolved: 4230,
            avgResponseTime: '2.1 days',
            resolutionRate: '86%'
        }
    },
    sanitation: {
        id: 'sanitation',
        name: 'Sanitation Department',
        nameHindi: 'स्वच्छता विभाग',
        icon: '🚮',
        category: 'Additional',
        color: '#388e3c',
        contact: {
            phone: ['+91-11-2349-0123', '+91-11-2349-0124'],
            email: ['sanitation@municipal.gov.in', 'swachh@municipal.gov.in'],
            address: 'Sanitation Wing, Municipal Corporation, New Delhi - 110001',
            hours: 'Mon-Sat: 8:00 AM - 6:00 PM'
        },
        personnel: [
            { role: 'Chief Sanitation Officer', name: 'Dr. Meera Joshi', email: 'cso@municipal.gov.in', phone: '+91-11-2349-0125' },
            { role: 'Deputy CSO', name: 'Mr. Ravi Shankar', email: 'dcso@municipal.gov.in', phone: '+91-11-2349-0126' }
        ],
        responsibilities: [
            'Garbage collection and disposal',
            'Street sweeping and cleaning',
            'Public toilet maintenance',
            'Waste segregation programs',
            'Recycling initiatives',
            'Pest control services'
        ],
        stats: {
            totalComplaints: 7230,
            resolved: 6450,
            avgResponseTime: '1.5 days',
            resolutionRate: '89%'
        }
    },
    roads: {
        id: 'roads',
        name: 'Public Works Department (Roads)',
        nameHindi: 'लोक निर्माण विभाग (सड़कें)',
        icon: '🛣️',
        category: 'Additional',
        color: '#5d4037',
        contact: {
            phone: ['+91-11-2350-1234', '+91-11-2350-1235'],
            email: ['pwd@delhi.gov.in', 'roads@pwd.gov.in'],
            address: 'PWD Headquarters, Old Secretariat, New Delhi - 110054',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM'
        },
        personnel: [
            { role: 'Chief Engineer', name: 'Er. Ashok Verma', email: 'ce-pwd@delhi.gov.in', phone: '+91-11-2350-1236' },
            { role: 'Superintending Engineer', name: 'Er. Sunita Rao', email: 'se-pwd@delhi.gov.in', phone: '+91-11-2350-1237' }
        ],
        responsibilities: [
            'Road construction and maintenance',
            'Pothole repairs',
            'Street lighting',
            'Footpath construction',
            'Bridge maintenance',
            'Traffic signal installation'
        ],
        stats: {
            totalComplaints: 5680,
            resolved: 4920,
            avgResponseTime: '3.2 days',
            resolutionRate: '87%'
        }
    },
    health: {
        id: 'health',
        name: 'Health Department',
        nameHindi: 'स्वास्थ्य विभाग',
        icon: '🏥',
        category: 'Additional',
        color: '#c62828',
        contact: {
            phone: ['+91-11-2351-2345', '+91-11-2351-2346'],
            email: ['health@delhi.gov.in', 'complaints@health.gov.in'],
            address: 'Directorate of Health Services, F-17 Karkardooma, Delhi - 110092',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM, Emergency: 24/7'
        },
        personnel: [
            { role: 'Director General', name: 'Dr. Padma Srivastava', email: 'dg-health@delhi.gov.in', phone: '+91-11-2351-2347' },
            { role: 'Additional Director', name: 'Dr. Anil Kumar', email: 'ad-health@delhi.gov.in', phone: '+91-11-2351-2348' }
        ],
        responsibilities: [
            'Public health services',
            'Disease control and prevention',
            'Hospital administration',
            'Health camps and awareness',
            'Vaccination programs',
            'Food safety inspections'
        ],
        stats: {
            totalComplaints: 2340,
            resolved: 2110,
            avgResponseTime: '2.8 days',
            resolutionRate: '90%'
        }
    },
    education: {
        id: 'education',
        name: 'Education Department',
        nameHindi: 'शिक्षा विभाग',
        icon: '📚',
        category: 'Additional',
        color: '#6a1b9a',
        contact: {
            phone: ['+91-11-2352-3456', '+91-11-2352-3457'],
            email: ['education@delhi.gov.in', 'doe@delhi.gov.in'],
            address: 'Directorate of Education, Old Secretariat, Delhi - 110054',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM'
        },
        personnel: [
            { role: 'Director of Education', name: 'Dr. Himanshu Gupta', email: 'doe@delhi.gov.in', phone: '+91-11-2352-3458' },
            { role: 'Deputy Director', name: 'Ms. Rekha Singh', email: 'dd-education@delhi.gov.in', phone: '+91-11-2352-3459' }
        ],
        responsibilities: [
            'School administration',
            'Teacher recruitment and training',
            'Student admissions',
            'Curriculum development',
            'Infrastructure maintenance',
            'Mid-day meal programs'
        ],
        stats: {
            totalComplaints: 1820,
            resolved: 1640,
            avgResponseTime: '4.5 days',
            resolutionRate: '90%'
        }
    },
    transport: {
        id: 'transport',
        name: 'Transport Department',
        nameHindi: 'परिवहन विभाग',
        icon: '🚌',
        category: 'Additional',
        color: '#00796b',
        contact: {
            phone: ['+91-11-2353-4567', '+91-11-2353-4568'],
            email: ['transport@delhi.gov.in', 'dtc@delhi.gov.in'],
            address: 'Transport Department, IP Estate, New Delhi - 110002',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM'
        },
        personnel: [
            { role: 'Transport Commissioner', name: 'Shri Varsha Joshi', email: 'tc@delhi.gov.in', phone: '+91-11-2353-4569' },
            { role: 'Additional TC', name: 'Mr. Rajiv Bansal', email: 'atc@delhi.gov.in', phone: '+91-11-2353-4570' }
        ],
        responsibilities: [
            'Public transport management',
            'Bus route planning',
            'Vehicle registration',
            'Driving license issuance',
            'Traffic regulation',
            'Auto-rickshaw permits'
        ],
        stats: {
            totalComplaints: 3450,
            resolved: 3020,
            avgResponseTime: '3.5 days',
            resolutionRate: '88%'
        }
    },
    fire: {
        id: 'fire',
        name: 'Fire Department',
        nameHindi: 'अग्निशमन विभाग',
        icon: '🚒',
        category: 'Additional',
        color: '#d32f2f',
        contact: {
            phone: ['+91-11-101', '+91-11-2354-5678'],
            email: ['fire@delhi.gov.in', 'emergency@dfs.gov.in'],
            address: 'Delhi Fire Service, Connaught Place, New Delhi - 110001',
            hours: '24/7 Emergency Services'
        },
        personnel: [
            { role: 'Director', name: 'Shri Atul Garg', email: 'director-fire@delhi.gov.in', phone: '+91-11-2354-5679' },
            { role: 'Chief Fire Officer', name: 'Mr. Sunil Kumar', email: 'cfo@dfs.gov.in', phone: '+91-11-2354-5680' }
        ],
        responsibilities: [
            'Fire emergency response',
            'Rescue operations',
            'Fire safety inspections',
            'Fire NOC issuance',
            'Fire safety training',
            'Disaster management'
        ],
        stats: {
            totalComplaints: 1560,
            resolved: 1480,
            avgResponseTime: '0.5 days',
            resolutionRate: '95%'
        }
    },
    environment: {
        id: 'environment',
        name: 'Environment Department',
        nameHindi: 'पर्यावरण विभाग',
        icon: '🌳',
        category: 'Additional',
        color: '#2e7d32',
        contact: {
            phone: ['+91-11-2355-6789', '+91-11-2355-6790'],
            email: ['environment@delhi.gov.in', 'dpcc@delhi.gov.in'],
            address: 'Delhi Pollution Control Committee, 4th Floor, ISBT Building, Kashmere Gate, Delhi - 110006',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM'
        },
        personnel: [
            { role: 'Chairman', name: 'Dr. Ashwani Kumar', email: 'chairman-dpcc@delhi.gov.in', phone: '+91-11-2355-6791' },
            { role: 'Member Secretary', name: 'Dr. Priya Malhotra', email: 'ms-dpcc@delhi.gov.in', phone: '+91-11-2355-6792' }
        ],
        responsibilities: [
            'Air quality monitoring',
            'Pollution control',
            'Tree plantation drives',
            'Environmental clearances',
            'Waste management oversight',
            'Green initiatives'
        ],
        stats: {
            totalComplaints: 2890,
            resolved: 2540,
            avgResponseTime: '3.8 days',
            resolutionRate: '88%'
        }
    },
    revenue: {
        id: 'revenue',
        name: 'Revenue Department',
        nameHindi: 'राजस्व विभाग',
        icon: '💰',
        category: 'Additional',
        color: '#f57f17',
        contact: {
            phone: ['+91-11-2356-7890', '+91-11-2356-7891'],
            email: ['revenue@delhi.gov.in', 'landrecords@delhi.gov.in'],
            address: 'Revenue Department, Vikas Bhawan, IP Estate, New Delhi - 110002',
            hours: 'Mon-Fri: 9:00 AM - 5:00 PM'
        },
        personnel: [
            { role: 'Divisional Commissioner', name: 'Shri Anuj Jain', email: 'dc-revenue@delhi.gov.in', phone: '+91-11-2356-7892' },
            { role: 'Additional DC', name: 'Ms. Geeta Rani', email: 'adc-revenue@delhi.gov.in', phone: '+91-11-2356-7893' }
        ],
        responsibilities: [
            'Land records management',
            'Property registration',
            'Mutation of property',
            'Revenue collection',
            'Land acquisition',
            'Stamp duty collection'
        ],
        stats: {
            totalComplaints: 1920,
            resolved: 1680,
            avgResponseTime: '5.2 days',
            resolutionRate: '88%'
        }
    }
};

// Helper functions
export function getAllAuthorities() {
    return Object.values(authoritiesData);
}

export function getPrimaryAuthorities() {
    return Object.values(authoritiesData).filter(auth => auth.category === 'Primary');
}

export function getAdditionalAuthorities() {
    return Object.values(authoritiesData).filter(auth => auth.category === 'Additional');
}

export function getAuthorityById(id) {
    return authoritiesData[id] || null;
}

export function getTotalStats() {
    const all = getAllAuthorities();
    return {
        totalDepartments: all.length,
        totalComplaints: all.reduce((sum, auth) => sum + auth.stats.totalComplaints, 0),
        totalResolved: all.reduce((sum, auth) => sum + auth.stats.resolved, 0),
        avgResolutionRate: Math.round(all.reduce((sum, auth) => sum + parseFloat(auth.stats.resolutionRate), 0) / all.length) + '%'
    };
}
