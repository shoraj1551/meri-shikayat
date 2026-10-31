/**
 * Complaint ID Service
 * Generates opaque complaint IDs in format: MSK-YYYY-<16 hex chars>
 */

import crypto from 'node:crypto';
import Complaint from '../models/Complaint.js';

const MAX_COMPLAINT_ID_ATTEMPTS = 5;

/**
 * Generate unique complaint ID
 * A database unique index remains the final collision guard. A 64-bit random
 * suffix prevents practical guessing/enumeration without a database read.
 */
export async function generateComplaintId() {
    const year = new Date().getFullYear();
    return `MSK-${year}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
}

export function isComplaintIdDuplicate(error) {
    if (error?.code !== 11000 && error?.code !== 11001) return false;

    return Boolean(
        error.keyPattern?.complaintId ||
        Object.hasOwn(error.keyValue || {}, 'complaintId') ||
        /complaintId(?:_1)?/i.test(error.message || '')
    );
}

/**
 * Insert a complaint with a bounded retry for the only recoverable collision.
 * Other duplicate indexes, validation failures and database errors propagate
 * immediately instead of being hidden behind retries.
 */
export async function createComplaintWithUniqueId(
    complaintData,
    {
        idGenerator = generateComplaintId,
        complaintModel = Complaint,
        maxAttempts = MAX_COMPLAINT_ID_ATTEMPTS,
        createOptions
    } = {}
) {
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
        throw new TypeError('maxAttempts must be a positive integer');
    }

    let lastCollision;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const complaintId = await idGenerator();
        try {
            const values = { ...complaintData, complaintId };
            if (createOptions) {
                const created = await complaintModel.create([values], createOptions);
                return created[0];
            }
            return await complaintModel.create(values);
        } catch (error) {
            if (!isComplaintIdDuplicate(error)) throw error;
            lastCollision = error;
        }
    }

    throw lastCollision;
}

/**
 * Validate complaint ID format
 */
export function isValidComplaintId(complaintId) {
    // Retain legacy six-digit identifiers for existing complaints.
    const pattern = /^MSK-\d{4}-(?:\d{6}|[A-F0-9]{16})$/;
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
        sequence: /^\d{6}$/.test(parts[2]) ? parseInt(parts[2]) : null,
        opaqueId: /^[A-F0-9]{16}$/.test(parts[2]) ? parts[2] : null
    };
}
