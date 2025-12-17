/**
 * Database Index Migration
 * TASK-PR-009: Add database indexes for query optimization
 * 
 * Run this migration to create all necessary indexes
 * Usage: node src/migrations/add-indexes.js
 */

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import logger from '../utils/logger.js';

const indexes = [
    // Complaint indexes
    {
        collection: 'complaints',
        indexes: [
            { fields: { status: 1, createdAt: -1 }, name: 'status_created_idx' },
            { fields: { user: 1, createdAt: -1 }, name: 'user_created_idx' },
            { fields: { category: 1, status: 1 }, name: 'category_status_idx' },
            { fields: { assignedTo: 1, status: 1 }, name: 'assigned_status_idx' },
            { fields: { location: '2dsphere' }, name: 'location_geo_idx' },
            { fields: { createdAt: -1 }, name: 'created_desc_idx' },
            { fields: { priority: 1, status: 1 }, name: 'priority_status_idx' }
        ]
    },

    // User indexes
    {
        collection: 'users',
        indexes: [
            { fields: { email: 1 }, options: { unique: true, sparse: true }, name: 'email_unique_idx' },
            { fields: { phone: 1 }, options: { unique: true, sparse: true }, name: 'phone_unique_idx' },
            { fields: { role: 1, isActive: 1 }, name: 'role_active_idx' },
            { fields: { createdAt: -1 }, name: 'user_created_idx' }
        ]
    },

    // Admin indexes
    {
        collection: 'admins',
        indexes: [
            { fields: { email: 1 }, options: { unique: true }, name: 'admin_email_unique_idx' },
            { fields: { role: 1, isApproved: 1 }, name: 'admin_role_approved_idx' },
            { fields: { department: 1 }, name: 'admin_department_idx' }
        ]
    },

    // Comment indexes
    {
        collection: 'comments',
        indexes: [
            { fields: { complaint: 1, createdAt: -1 }, name: 'comment_complaint_idx' },
            { fields: { user: 1, createdAt: -1 }, name: 'comment_user_idx' }
        ]
    },

    // Notification indexes
    {
        collection: 'notifications',
        indexes: [
            { fields: { user: 1, isRead: 1, createdAt: -1 }, name: 'notification_user_idx' },
            { fields: { createdAt: -1 }, name: 'notification_created_idx' }
        ]
    },

    // OTP indexes
    {
        collection: 'otps',
        indexes: [
            { fields: { identifier: 1, type: 1 }, name: 'otp_identifier_idx' },
            { fields: { expiresAt: 1 }, options: { expireAfterSeconds: 0 }, name: 'otp_ttl_idx' }
        ]
    }
];

async function createIndexes() {
    try {
        await connectDatabase();
        logger.info('Starting index creation...');

        for (const { collection, indexes: collectionIndexes } of indexes) {
            logger.info(`Creating indexes for ${collection}...`);

            const db = mongoose.connection.db;
            const coll = db.collection(collection);

            for (const index of collectionIndexes) {
                try {
                    const { fields, options = {}, name } = index;
                    await coll.createIndex(fields, { ...options, name });
                    logger.info(`✓ Created index: ${name} on ${collection}`);
                } catch (error) {
                    if (error.code === 85) {
                        // Index already exists with different options
                        logger.warn(`Index ${index.name} exists with different options, dropping and recreating...`);
                        await coll.dropIndex(index.name);
                        await coll.createIndex(index.fields, { ...index.options, name: index.name });
                        logger.info(`✓ Recreated index: ${index.name} on ${collection}`);
                    } else if (error.code === 86) {
                        // Index already exists
                        logger.info(`- Index ${index.name} already exists on ${collection}`);
                    } else {
                        throw error;
                    }
                }
            }
        }

        logger.info('✅ All indexes created successfully');

        // Show index statistics
        for (const { collection } of indexes) {
            const stats = await mongoose.connection.db.collection(collection).stats();
            logger.info(`${collection} indexes:`, {
                count: stats.nindexes,
                size: `${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`
            });
        }

        process.exit(0);
    } catch (error) {
        logger.error('Index creation failed', { error: error.message });
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createIndexes();
}

export default createIndexes;
