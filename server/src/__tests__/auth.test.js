/**
 * User Authentication API Tests
 * Tests for registration and login endpoints
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes.js';
import './setup.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('User Authentication Tests', () => {
    describe('POST /api/auth/register - Valid Registration', () => {
        it('should register a new user with valid data', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test@123',
                phone: '9876543210',
                location: {
                    address: 'Test Address, Mumbai',
                    coordinates: {
                        lat: 19.0760,
                        lng: 72.8777
                    }
                }
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Verify response structure
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');

            // Verify user data
            expect(response.body.user).toHaveProperty('name', userData.name);
            expect(response.body.user).toHaveProperty('email', userData.email);
            expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned

            // Verify token is a string
            expect(typeof response.body.token).toBe('string');
        });

        it('should reject registration with duplicate email', async () => {
            const userData = {
                name: 'Test User',
                email: 'duplicate@example.com',
                password: 'Test@123',
                phone: '9876543210',
                location: {
                    address: 'Test Address',
                    coordinates: { lat: 19.0760, lng: 72.8777 }
                }
            };

            // Register first time
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to register again with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/already exists|already registered/i);
        });
    });

    describe('POST /api/auth/login - Invalid Login', () => {
        it('should reject login with invalid credentials', async () => {
            const invalidCredentials = {
                email: 'nonexistent@example.com',
                password: 'WrongPassword123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(invalidCredentials)
                .expect(401);

            // Verify error response
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/invalid|not found|incorrect/i);
        });

        it('should reject login with correct email but wrong password', async () => {
            // First register a user
            const userData = {
                name: 'Test User',
                email: 'validuser@example.com',
                password: 'CorrectPassword123',
                phone: '9876543210',
                location: {
                    address: 'Test Address',
                    coordinates: { lat: 19.0760, lng: 72.8777 }
                }
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to login with wrong password
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: 'WrongPassword123'
                })
                .expect(401);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/invalid|incorrect|password/i);
        });
    });
});
