/**
 * Seed Default Categories
 * Creates default complaint categories in the database
 */

import mongoose from 'mongoose';
import Category from '../models/Category.js';
import '../config/env.js';

const defaultCategories = [
    {
        name: 'Roads',
        description: 'Road damage, potholes, construction issues',
        icon: '🛣️',
        color: '#ef4444',
        sortOrder: 1,
        isActive: true
    },
    {
        name: 'Water Supply',
        description: 'Water shortage, leakage, quality issues',
        icon: '💧',
        color: '#3b82f6',
        sortOrder: 2,
        isActive: true
    },
    {
        name: 'Sanitation',
        description: 'Garbage collection, cleanliness issues',
        icon: '🧹',
        color: '#10b981',
        sortOrder: 3,
        isActive: true
    },
    {
        name: 'Electricity',
        description: 'Power outages, electrical faults',
        icon: '⚡',
        color: '#f59e0b',
        sortOrder: 4,
        isActive: true
    },
    {
        name: 'Street Lights',
        description: 'Non-functional or damaged street lights',
        icon: '💡',
        color: '#8b5cf6',
        sortOrder: 5,
        isActive: true
    },
    {
        name: 'Drainage',
        description: 'Blocked drains, sewage issues',
        icon: '🚰',
        color: '#06b6d4',
        sortOrder: 6,
        isActive: true
    },
    {
        name: 'Parks & Gardens',
        description: 'Park maintenance, garden issues',
        icon: '🌳',
        color: '#22c55e',
        sortOrder: 7,
        isActive: true
    },
    {
        name: 'Public Transport',
        description: 'Bus stops, transport facilities',
        icon: '🚌',
        color: '#ec4899',
        sortOrder: 8,
        isActive: true
    },
    {
        name: 'Other',
        description: 'Other civic issues',
        icon: '📋',
        color: '#6b7280',
        sortOrder: 99,
        isActive: true
    }
];

async function seedCategories() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if categories already exist
        const existingCount = await Category.countDocuments();

        if (existingCount > 0) {
            console.log(`ℹ️  Found ${existingCount} existing categories`);
            console.log('⚠️  Skipping seed to avoid duplicates');
            console.log('💡 To force reseed, delete existing categories first');
            process.exit(0);
        }

        // Insert default categories
        const result = await Category.insertMany(defaultCategories);
        console.log(`✅ Successfully seeded ${result.length} categories:`);

        result.forEach(cat => {
            console.log(`   ${cat.icon} ${cat.name} (${cat.color})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCategories();
