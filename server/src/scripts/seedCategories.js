import mongoose from 'mongoose';
import Category from '../models/Category.js';
import '../config/env.js';
import { complaintCategories } from '../config/complaintTaxonomy.js';

const defaultCategories = complaintCategories.map(({ name, description, icon, color, sortOrder }) => ({
    name, description, icon, color, sortOrder, isActive: true
}));

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingCount = await Category.countDocuments();
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing categories; seed skipped`);
            process.exit(0);
        }

        const result = await Category.insertMany(defaultCategories);
        console.log(`Successfully seeded ${result.length} categories`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();
