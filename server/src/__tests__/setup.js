/**
 * Test Setup and Configuration
 * Sets up test environment and database
 */

// Load environment variables first
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables
dotenv.config({ path: join(__dirname, '../../.env.test') });

// If .env.test doesn't exist, set test defaults
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only_minimum_64_characters_required_here_to_pass_validation';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/meri-shikayat-test';
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
}

import mongoose from 'mongoose';

// Use test database
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meri-shikayat-test';

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
