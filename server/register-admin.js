import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/Admin.js';
import { generateAdminId, getDefaultPermissions } from './src/utils/adminUtils.js';

dotenv.config();

const registerAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if exists
        const exists = await Admin.findOne({ email: 'admin@example.com' });
        if (exists) {
            console.log('Admin already exists');
            process.exit();
        }

        const adminId = await generateAdminId();
        const admin = await Admin.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phone: '9998887777',
            password: 'Admin@123',
            adminId,
            department: 'IT',
            designation: 'Manager',
            role: 'viewer',
            status: 'pending',
            permissions: getDefaultPermissions('viewer')
        });

        console.log('Admin registered:', admin.email);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

registerAdmin();
