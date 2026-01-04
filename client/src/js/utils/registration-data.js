/**
 * Department data with icons and descriptions
 */
export const DEPARTMENTS = [
    { id: 'municipal', name: 'Municipal Corporation', icon: '🏛️', color: '#1976d2' },
    { id: 'police', name: 'Police Department', icon: '👮', color: '#d32f2f' },
    { id: 'pwd', name: 'Public Works (PWD)', icon: '🏗️', color: '#f57c00' },
    { id: 'water', name: 'Water Supply', icon: '💧', color: '#0288d1' },
    { id: 'electricity', name: 'Electricity Board', icon: '⚡', color: '#fbc02d' },
    { id: 'sanitation', name: 'Sanitation', icon: '🧹', color: '#388e3c' },
    { id: 'health', name: 'Health Department', icon: '🏥', color: '#c62828' },
    { id: 'education', name: 'Education', icon: '📚', color: '#7b1fa2' },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#00796b' },
    { id: 'fire', name: 'Fire Department', icon: '🚒', color: '#d84315' },
    { id: 'environment', name: 'Environment', icon: '🌳', color: '#558b2f' },
    { id: 'revenue', name: 'Revenue', icon: '💰', color: '#5d4037' }
];

/**
 * Contractor specializations with icons
 */
export const SPECIALIZATIONS = [
    { id: 'sanitation', name: 'Sanitation & Waste Management', icon: '🧹' },
    { id: 'road_repair', name: 'Road Repair & Maintenance', icon: '🛣️' },
    { id: 'electrical', name: 'Electrical Works', icon: '⚡' },
    { id: 'plumbing', name: 'Plumbing & Water Supply', icon: '🔧' },
    { id: 'construction', name: 'Construction & Building', icon: '🏗️' },
    { id: 'landscaping', name: 'Landscaping & Gardening', icon: '🌳' },
    { id: 'painting', name: 'Painting & Decoration', icon: '🎨' },
    { id: 'carpentry', name: 'Carpentry & Woodwork', icon: '🪚' }
];

/**
 * Designation suggestions by department
 */
export const DESIGNATION_SUGGESTIONS = {
    municipal: [
        'Municipal Commissioner',
        'Assistant Commissioner',
        'Municipal Engineer',
        'Assistant Engineer',
        'Sanitary Inspector',
        'Health Officer'
    ],
    police: [
        'Commissioner of Police',
        'Deputy Commissioner',
        'Assistant Commissioner',
        'Inspector',
        'Sub-Inspector',
        'Constable'
    ],
    pwd: [
        'Chief Engineer',
        'Superintending Engineer',
        'Executive Engineer',
        'Assistant Engineer',
        'Junior Engineer',
        'Technical Assistant'
    ],
    water: [
        'Chief Engineer (Water)',
        'Executive Engineer',
        'Assistant Engineer',
        'Water Supply Officer',
        'Pump Operator',
        'Valve Man'
    ],
    electricity: [
        'Chief Engineer (Electrical)',
        'Superintending Engineer',
        'Executive Engineer',
        'Assistant Engineer',
        'Lineman',
        'Electrician'
    ],
    sanitation: [
        'Sanitation Officer',
        'Assistant Sanitation Officer',
        'Sanitary Inspector',
        'Sanitary Supervisor',
        'Sweeper Supervisor'
    ],
    health: [
        'Chief Medical Officer',
        'Medical Officer',
        'Health Inspector',
        'Sanitary Inspector',
        'Nurse',
        'Pharmacist'
    ],
    education: [
        'Education Officer',
        'Assistant Education Officer',
        'School Inspector',
        'Education Coordinator'
    ],
    transport: [
        'Transport Officer',
        'Traffic Manager',
        'Route Inspector',
        'Transport Supervisor'
    ],
    fire: [
        'Fire Officer',
        'Station Officer',
        'Sub Officer',
        'Leading Fireman',
        'Fireman'
    ],
    environment: [
        'Environment Officer',
        'Pollution Control Officer',
        'Forest Officer',
        'Wildlife Officer'
    ],
    revenue: [
        'Revenue Officer',
        'Tahsildar',
        'Naib Tahsildar',
        'Revenue Inspector'
    ]
};

/**
 * Validate GST number format
 */
export function validateGSTNumber(gstNumber) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber);
}

/**
 * Validate PAN number format
 */
export function validatePANNumber(panNumber) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panNumber);
}

/**
 * Validate employee ID format (alphanumeric, 5-15 characters)
 */
export function validateEmployeeID(employeeId) {
    const empIdRegex = /^[A-Z0-9]{5,15}$/;
    return empIdRegex.test(employeeId.toUpperCase());
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password) {
    let strength = 0;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    Object.values(requirements).forEach(met => {
        if (met) strength++;
    });

    let level = 'weak';
    if (strength >= 4) level = 'strong';
    else if (strength >= 3) level = 'medium';

    return { level, requirements, score: strength };
}
