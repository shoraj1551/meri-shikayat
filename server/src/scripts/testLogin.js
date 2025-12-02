import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'admin@merishikayat.com';
        const password = 'adminpassword123';

        console.log(`Attempting login for: ${email}`);

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            console.log('❌ Admin not found');
            process.exit(1);
        }

        console.log('✅ Admin found');
        console.log(`Stored Hashed Password: ${admin.password}`);

        const isMatch = await bcrypt.compare(password, admin.password);

        if (isMatch) {
            console.log('✅ Password Match: SUCCESS');
            console.log(`Status: ${admin.status}`);
            console.log(`Role: ${admin.role}`);
        } else {
            console.log('❌ Password Match: FAILED');

            // Debug: Hash the input password and print it (just for comparison, though salts differ)
            const testHash = await bcrypt.hash(password, 10);
            console.log(`Test Hash of input: ${testHash}`);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testLogin();
