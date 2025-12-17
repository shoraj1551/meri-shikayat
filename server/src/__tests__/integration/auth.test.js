/**
 * Integration Tests for Authentication Flow
 * Tests complete authentication workflows
 */

import request from 'supertest';
import app from '../../index.js';
import User from '../../models/User.js';
import { connectDB, disconnectDB } from '../../config/database.js';

describe('Authentication Integration Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await disconnectDB();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '9876543210',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('john@example.com');
            expect(response.body.data.token).toBeDefined();
        });

        it('should reject registration with invalid data', async () => {
            const invalidData = {
                firstName: 'J',
                lastName: 'Doe',
                email: 'invalid-email',
                password: 'weak'
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should prevent duplicate email registration', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            };

            await request(app).post('/api/v1/auth/register').send(userData);

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.message).toContain('already exists');
        });

        it('should sanitize XSS attempts', async () => {
            const xssData = {
                firstName: '<script>alert("xss")</script>John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(xssData)
                .expect(201);

            expect(response.body.data.user.firstName).not.toContain('<script>');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    identifier: 'john@example.com',
                    password: 'Test@1234'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    identifier: 'john@example.com',
                    password: 'WrongPassword'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should enforce rate limiting on login attempts', async () => {
            const loginData = {
                identifier: 'john@example.com',
                password: 'WrongPassword'
            };

            // Make multiple failed login attempts
            for (let i = 0; i < 6; i++) {
                await request(app).post('/api/v1/auth/login').send(loginData);
            }

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(loginData)
                .expect(429);

            expect(response.body.message).toContain('Too many');
        });
    });

    describe('GET /api/v1/auth/profile', () => {
        let token;

        beforeEach(async () => {
            const response = await request(app).post('/api/v1/auth/register').send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                password: 'Test@1234'
            });
            token = response.body.data.token;
        });

        it('should get profile with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.data.email).toBe('john@example.com');
        });

        it('should reject request without token', async () => {
            await request(app)
                .get('/api/v1/auth/profile')
                .expect(401);
        });

        it('should reject request with invalid token', async () => {
            await request(app)
                .get('/api/v1/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
});
