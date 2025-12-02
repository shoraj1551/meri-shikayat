/**
 * Seed Super Admin Script
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import { generateAdminId, getDefaultPermissions } from '../utils/adminUtils.js';

dotenv.config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const superAdminEmail = 'admin@merishikayat.com';
        const superAdminExists = await Admin.findOne({ email: superAdminEmail });

        if (superAdminExists) {
            console.log('Super Admin already exists. Resetting password...');
            superAdminExists.password = 'adminpassword123';
            await superAdminExists.save();
            console.log('Super Admin password reset to: adminpassword123');
            process.exit();
        }

        const adminId = await generateAdminId();

        await Admin.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: superAdminEmail,
            phone: '9999999999',
            password: 'adminpassword123', // Should be changed immediately
            adminId,
            role: 'super_admin',
            status: 'active',
            permissions: getDefaultPermissions('super_admin'),
            department: 'IT',
            designation: 'System Administrator'
        });

        console.log('Super Admin created successfully');
        console.log(`Email: ${superAdminEmail}`);
        console.log('Password: adminpassword123');

        process.exit();
    } catch (error) {
        console.error('Error seeding super admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
