/**
 * Migration Script: Migrate existing Admin model to unified User model
 * Run with: node server/src/migrations/migrate-admins-to-users.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';

// Load environment variables
dotenv.config();

// Old Admin model (for migration only)
const oldAdminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String,
    adminId: String,
    role: String,
    status: String,
    permissions: Object,
    department: String,
    designation: String,
    approvedBy: mongoose.Schema.Types.ObjectId,
    approvedAt: Date,
    rejectedBy: mongoose.Schema.Types.ObjectId,
    rejectedAt: Date,
    rejectionReason: String,
    createdAt: Date,
    updatedAt: Date
}, { collection: 'admins' });

const OldAdmin = mongoose.model('OldAdmin', oldAdminSchema);

// New User model
import User from '../models/User.js';

async function migrateAdminsToUsers() {
    try {
        console.log('🔄 Starting Admin to User migration...\n');

        // Connect to database
        await connectDatabase();

        // Fetch all admins
        const admins = await OldAdmin.find({});
        console.log(`📋 Found ${admins.length} admin(s) to migrate\n`);

        if (admins.length === 0) {
            console.log('✅ No admins to migrate. Exiting...');
            process.exit(0);
        }

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const admin of admins) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({
                    $or: [
                        { email: admin.email },
                        { phone: admin.phone },
                        { 'adminProfile.adminId': admin.adminId }
                    ]
                });

                if (existingUser) {
                    console.log(`⚠️  Skipping ${admin.email} - already exists as User`);
                    skippedCount++;
                    continue;
                }

                // Determine user type
                let userType = 'admin';
                if (admin.role === 'super_admin') {
                    userType = 'super_admin';
                }

                // Create new user from admin data
                const newUser = new User({
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    phone: admin.phone,
                    password: admin.password, // Already hashed
                    dateOfBirth: new Date('1990-01-01'), // Default DOB for admins
                    userType: userType,
                    status: admin.status || 'active',
                    adminProfile: {
                        adminId: admin.adminId,
                        designation: admin.designation,
                        role: admin.role,
                        permissions: admin.permissions || {},
                        department: admin.department,
                        approvedBy: admin.approvedBy,
                        approvedAt: admin.approvedAt,
                        rejectedBy: admin.rejectedBy,
                        rejectedAt: admin.rejectedAt,
                        rejectionReason: admin.rejectionReason
                    },
                    verificationStatus: {
                        email: true,
                        phone: true,
                        identity: true,
                        documents: true
                    },
                    isVerified: true,
                    createdAt: admin.createdAt || new Date(),
                    updatedAt: admin.updatedAt || new Date()
                });

                // Save without re-hashing password
                await newUser.save({ validateBeforeSave: false });

                console.log(`✅ Migrated: ${admin.email} (${userType})`);
                migratedCount++;

            } catch (error) {
                console.error(`❌ Error migrating ${admin.email}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Migrated: ${migratedCount}`);
        console.log(`   ⚠️  Skipped: ${skippedCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📋 Total: ${admins.length}\n`);

        if (migratedCount > 0) {
            console.log('⚠️  IMPORTANT: The old Admin collection still exists.');
            console.log('   After verifying the migration, you can drop it with:');
            console.log('   db.admins.drop()\n');
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateAdminsToUsers();
