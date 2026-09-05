/**
 * Test Database Helper
 * Utilities for managing test database and test data
 */

import mongoose from 'mongoose';
import { clearDatabase as clearOwnedDatabase } from '../../../test/harness/identity.mjs';
import User from '../../models/User.js';
import Complaint from '../../models/Complaint.js';
import Admin from '../../models/Admin.js';
import Department from '../../models/Department.js';
import Category from '../../models/Category.js';

/**
 * Create a test user
 */
export async function createTestUser(overrides = {}) {
    const defaultUser = {
        firstName: 'Test',
        lastName: 'User',
        email: generateRandomEmail(),
        phone: generateRandomPhone(),
        password: 'Test@123456',
        userType: 'general_user',
        status: 'active',
        location: {
            address: 'Test Address, Mumbai',
            pincode: '400001',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            coordinates: {
                latitude: 19.0760,
                longitude: 72.8777
            }
        }
    };

    const userData = { ...defaultUser, ...overrides };
    const user = await User.create(userData);
    return user;
}

/**
 * Create a test admin
 */
export async function createTestAdmin(overrides = {}) {
    const defaultAdmin = {
        firstName: 'Admin',
        lastName: 'User',
        email: generateRandomEmail(),
        phone: generateRandomPhone(),
        password: 'Admin@123456',
        adminId: `TEST-${Date.now()}`,
        status: 'active',
        designation: 'Test Admin',
        role: 'manager',
        permissions: {
            viewComplaints: true,
            editComplaints: true,
            viewUsers: true
        }
    };

    const adminData = { ...defaultAdmin, ...overrides };
    const admin = await Admin.create(adminData);
    return admin;
}

/**
 * Create a test complaint
 */
export async function createTestComplaint(userId, overrides = {}) {
    const defaultComplaint = {
        complaintId: `MSK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
        user: userId,
        type: 'text',
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        location: {
            address: 'Test Location, Mumbai',
            coordinates: {
                lat: 19.0760,
                lng: 72.8777
            },
            pincode: '400001'
        },
        status: 'pending',
        priority: 'medium'
    };

    const complaintData = { ...defaultComplaint, ...overrides };
    const complaint = await Complaint.create(complaintData);
    return complaint;
}

/**
 * Create a test department
 */
export async function createTestDepartment(overrides = {}) {
    const defaultDepartment = {
        name: 'Test Department',
        nameHindi: 'परीक्षण विभाग',
        code: `TEST${Date.now()}`,
        description: 'Test department for testing',
        icon: '🏛️',
        contactEmail: 'test@dept.gov.in',
        contactPhone: '1234567890'
    };

    const deptData = { ...defaultDepartment, ...overrides };
    const department = await Department.create(deptData);
    return department;
}

/**
 * Create a test category
 */
export async function createTestCategory(departmentId, overrides = {}) {
    const defaultCategory = {
        name: 'Test Category',
        nameHindi: 'परीक्षण श्रेणी',
        department: departmentId,
        description: 'Test category for testing',
        icon: '📝'
    };

    const categoryData = { ...defaultCategory, ...overrides };
    const category = await Category.create(categoryData);
    return category;
}

/**
 * Clear all collections
 */
export async function clearDatabase(identity) {
    await clearOwnedDatabase(mongoose.connection, identity);
}

/**
 * Close database connection
 */
export async function closeDatabase() {
    await mongoose.connection.close();
}

/**
 * Generate random email
 */
export function generateRandomEmail() {
    return `test${Date.now()}${Math.floor(Math.random() * 10000)}@example.com`;
}

/**
 * Generate random phone
 */
export function generateRandomPhone() {
    return `98765${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
}

export default {
    createTestUser,
    createTestAdmin,
    createTestComplaint,
    createTestDepartment,
    createTestCategory,
    clearDatabase,
    closeDatabase,
    generateRandomEmail,
    generateRandomPhone
};
