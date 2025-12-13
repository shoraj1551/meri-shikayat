/**
 * Test Setup and Configuration
 * Sets up test environment and database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use test database
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/meri-shikayat-test';

// Connect to test database before all tests
beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
    console.log('Connected to test database');
});

// Clear database after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Disconnect after all tests
afterAll(async () => {
    await mongoose.connection.close();
    console.log('Disconnected from test database');
});

// Increase timeout for database operations
// jest.setTimeout(10000);
