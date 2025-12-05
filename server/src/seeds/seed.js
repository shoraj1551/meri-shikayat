/**
 * Database Seeder
 * Seeds data based on environment (dev, uat, production)
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import dotenv from 'dotenv';

dotenv.config();

const ENVIRONMENT = process.env.NODE_ENV || 'development';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected (${ENVIRONMENT})`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Clear all data
const clearData = async () => {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    console.log('✅ Data cleared');
};

// Seed Categories
const seedCategories = async () => {
    console.log('📋 Seeding categories...');

    const categories = [
        { name: 'Road & Infrastructure', description: 'Potholes, street lights, drainage', icon: '🛣️', color: '#3b82f6', sortOrder: 1 },
        { name: 'Water Supply', description: 'Water shortage, quality issues', icon: '💧', color: '#06b6d4', sortOrder: 2 },
        { name: 'Electricity', description: 'Power cuts, billing issues', icon: '⚡', color: '#f59e0b', sortOrder: 3 },
        { name: 'Sanitation', description: 'Garbage collection, cleanliness', icon: '🗑️', color: '#10b981', sortOrder: 4 },
        { name: 'Public Transport', description: 'Bus services, metro issues', icon: '🚌', color: '#8b5cf6', sortOrder: 5 },
        { name: 'Healthcare', description: 'Hospital services, ambulance', icon: '🏥', color: '#ef4444', sortOrder: 6 },
        { name: 'Education', description: 'School facilities, teachers', icon: '🎓', color: '#6366f1', sortOrder: 7 },
        { name: 'Police & Safety', description: 'Crime, traffic violations', icon: '👮', color: '#dc2626', sortOrder: 8 },
        { name: 'Noise Pollution', description: 'Loud music, construction noise', icon: '🔊', color: '#f97316', sortOrder: 9 },
        { name: 'Other', description: 'Miscellaneous complaints', icon: '📝', color: '#64748b', sortOrder: 10 }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    return createdCategories;
};

// Seed Departments
const seedDepartments = async (categories) => {
    console.log('🏛️  Seeding departments...');

    const departments = [
        {
            name: 'Public Works Department',
            code: 'PWD',
            description: 'Handles road construction, maintenance, and infrastructure',
            email: 'pwd@government.in',
            phone: '1234567890',
            categories: [categories[0]._id], // Road & Infrastructure
            isActive: true
        },
        {
            name: 'Water Supply Department',
            code: 'WSD',
            description: 'Manages water supply and distribution',
            email: 'water@government.in',
            phone: '1234567891',
            categories: [categories[1]._id], // Water Supply
            isActive: true
        },
        {
            name: 'Electricity Board',
            code: 'EB',
            description: 'Electricity generation and distribution',
            email: 'electricity@government.in',
            phone: '1234567892',
            categories: [categories[2]._id], // Electricity
            isActive: true
        },
        {
            name: 'Municipal Corporation',
            code: 'MC',
            description: 'Sanitation, garbage collection, and civic services',
            email: 'municipal@government.in',
            phone: '1234567893',
            categories: [categories[3]._id], // Sanitation
            isActive: true
        },
        {
            name: 'Transport Department',
            code: 'TD',
            description: 'Public transport and traffic management',
            email: 'transport@government.in',
            phone: '1234567894',
            categories: [categories[4]._id], // Public Transport
            isActive: true
        }
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);
    return createdDepartments;
};

// Seed Development Data
const seedDevelopment = async () => {
    console.log('\n🔧 Seeding DEVELOPMENT data...\n');

    // Create test users
    const users = [];
    for (let i = 1; i <= 10; i++) {
        users.push({
            firstName: `Test`,
            lastName: `User${i}`,
            email: `testuser${i}@example.com`,
            phone: `98765432${i.toString().padStart(2, '0')}`,
            password: 'Test@123',
            dateOfBirth: new Date('1990-01-01'),
            isVerified: true,
            isLocationSet: i % 2 === 0,
            location: i % 2 === 0 ? {
                pincode: '110001',
                city: 'New Delhi',
                state: 'Delhi',
                country: 'India'
            } : undefined
        });
    }
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Create test admins
    const admins = [];
    for (let i = 1; i <= 5; i++) {
        admins.push({
            firstName: `Admin`,
            lastName: `User${i}`,
            email: `admin${i}@example.com`,
            phone: `98765431${i.toString().padStart(2, '0')}`,
            password: 'Admin@123',
            dateOfBirth: new Date('1985-01-01'),
            role: 'admin',
            isVerified: true
        });
    }
    const createdAdmins = await Admin.insertMany(admins);
    console.log(`✅ Created ${createdAdmins.length} test admins`);

    return { users: createdUsers, admins: createdAdmins };
};

// Seed UAT Data
const seedUAT = async () => {
    console.log('\n🧪 Seeding UAT data...\n');

    // Create realistic users
    const users = [];
    const firstNames = ['Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Pooja', 'Arjun', 'Kavya'];
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Iyer', 'Nair', 'Joshi'];

    for (let i = 0; i < 50; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        users.push({
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
            password: 'Test@123',
            dateOfBirth: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            isVerified: true,
            isLocationSet: true,
            location: {
                pincode: `11000${Math.floor(Math.random() * 9)}`,
                city: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)],
                state: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal'][Math.floor(Math.random() * 5)],
                country: 'India'
            }
        });
    }
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} UAT users`);

    // Create realistic admins
    const admins = [];
    for (let i = 0; i < 10; i++) {
        const firstName = firstNames[i];
        const lastName = lastNames[i];
        admins.push({
            firstName,
            lastName,
            email: `admin.${firstName.toLowerCase()}.${lastName.toLowerCase()}@government.in`,
            phone: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
            password: 'Admin@123',
            dateOfBirth: new Date(1975 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            role: 'admin',
            isVerified: true
        });
    }
    const createdAdmins = await Admin.insertMany(admins);
    console.log(`✅ Created ${createdAdmins.length} UAT admins`);

    return { users: createdUsers, admins: createdAdmins };
};

// Main seeder
const seed = async () => {
    try {
        await connectDB();
        await clearData();

        // Seed common data for all environments
        const categories = await seedCategories();
        const departments = await seedDepartments(categories);

        // Seed environment-specific data
        if (ENVIRONMENT === 'development') {
            await seedDevelopment();
        } else if (ENVIRONMENT === 'staging') {
            await seedUAT();
        } else {
            console.log('⚠️  Production environment - skipping user/admin seeding');
        }

        console.log('\n✅ Seeding completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run seeder
seed();
