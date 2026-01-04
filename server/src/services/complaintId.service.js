/**
 * Complaint ID Service
 * Generates unique complaint IDs in format: MSK-YYYY-NNNNNN
 */

import Complaint from '../models/Complaint.js';

/**
 * Generate unique complaint ID
 * Format: MSK-2024-001234
 */
export async function generateComplaintId() {
    const year = new Date().getFullYear();
    const prefix = `MSK-${year}-`;

    // Find the last complaint ID for this year
    const lastComplaint = await Complaint.findOne({
        complaintId: new RegExp(`^${prefix}`)
    }).sort({ complaintId: -1 });

    let sequence = 1;
    if (lastComplaint) {
        // Extract sequence number from last ID
        const lastSequence = parseInt(lastComplaint.complaintId.split('-')[2]);
        sequence = lastSequence + 1;
    }

    // Pad sequence to 6 digits
    const paddedSequence = sequence.toString().padStart(6, '0');
    return `${prefix}${paddedSequence}`;
}

/**
 * Validate complaint ID format
 */
export function isValidComplaintId(complaintId) {
    const pattern = /^MSK-\d{4}-\d{6}$/;
    return pattern.test(complaintId);
}

/**
 * Parse complaint ID to extract year and sequence
 */
export function parseComplaintId(complaintId) {
    if (!isValidComplaintId(complaintId)) {
        return null;
    }

    const parts = complaintId.split('-');
    return {
        prefix: parts[0],
        year: parseInt(parts[1]),
        sequence: parseInt(parts[2])
    };
}
