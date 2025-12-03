import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from './src/models/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const approveAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'superadmin@example.com';
        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log('Admin not found');
            process.exit(1);
        }

        admin.status = 'active';
        admin.role = 'super_admin';
        await admin.save();

        console.log(`Admin ${email} approved and set to active/super_admin`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

approveAdmin();
