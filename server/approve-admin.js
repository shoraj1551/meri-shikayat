import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/Admin.js';

dotenv.config();

const approveAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await Admin.findOne({ email: 'admin@example.com' });
        if (admin) {
            admin.status = 'active';
            admin.role = 'super_admin'; // Make super admin for full access
            await admin.save();
            console.log('Admin approved and promoted to Super Admin');
        } else {
            console.log('Admin not found');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

approveAdmin();
