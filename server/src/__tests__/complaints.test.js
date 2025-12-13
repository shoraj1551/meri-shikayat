/**
 * Complaint Creation API Tests
 * Tests for complaint submission and validation
 */

import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes.js';
import complaintRoutes from '../routes/complaint.routes.js';
import Category from '../models/Category.js';
import './setup.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

describe('Complaint Creation Tests', () => {
    let authToken;
    let userId;
    let categoryId;

    // Register and login a user before tests
    beforeEach(async () => {
        // Create a test category
        const category = await Category.create({
            name: 'Roads',
            description: 'Road related issues',
            icon: '🛣️',
            color: '#000000'
        });
        categoryId = category._id;

        const userData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'complaintuser@example.com',
            password: 'Test@123',
            phone: '9876543210',
            dateOfBirth: '1990-01-01',
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
            .send(userData);



        authToken = response.body.token;
        userId = response.body.data.id;
    });

    describe('POST /api/complaints - Valid Complaint Creation', () => {
        it('should create a complaint with all required data', async () => {
            const complaintData = {
                category: categoryId,
                title: 'Test Complaint',
                location: {
                    address: 'MG Road, Mumbai',
                    coordinates: {
                        lat: 19.0760,
                        lng: 72.8777
                    }
                },
                description: 'Large pothole causing traffic issues. This is a detailed description with more than 50 characters.',
                type: 'text'
            };

            const response = await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${authToken}`)
                .send(complaintData)
                .expect(201);

            // Verify response structure
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');

            // Verify complaint data
            const complaint = response.body.data;
            expect(complaint).toHaveProperty('_id');
            expect(complaint.category.toString()).toBe(complaintData.category.toString());
            expect(complaint).toHaveProperty('description', complaintData.description);
            expect(complaint).toHaveProperty('status', 'pending');
            expect(complaint).toHaveProperty('user', userId);

            // Verify location data
            expect(complaint.location).toHaveProperty('address', complaintData.location.address);
            expect(complaint.location.coordinates).toHaveProperty('lat', complaintData.location.coordinates.lat);
            expect(complaint.location.coordinates).toHaveProperty('lng', complaintData.location.coordinates.lng);
        });

        it('should create a complaint and persist it in database', async () => {
            const complaintData = {
                category: categoryId,
                title: 'Test Complaint',
                location: {
                    address: 'Park Street, Mumbai',
                    coordinates: {
                        lat: 19.0760,
                        lng: 72.8777
                    }
                },
                description: 'Garbage not collected for 3 days. Causing health hazards in the area.',
                type: 'text'
            };

            await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${authToken}`)
                .send(complaintData)
                .expect(201);

            // Verify database persistence
            const savedComplaint = await mongoose.model('Complaint').findOne({ description: complaintData.description });
            expect(savedComplaint).toBeTruthy();
            expect(savedComplaint.category.toString()).toBe(complaintData.category.toString());
        });
    });

    describe('POST /api/complaints - Validation Tests', () => {
        it('should reject complaint without location coordinates', async () => {
            const incompleteData = {
                category: categoryId,
                title: 'Test Complaint',
                location: {
                    address: 'MG Road, Mumbai'
                    // Missing coordinates
                },
                description: 'This is a test complaint description with sufficient characters.',
                type: 'text'
            };

            const response = await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${authToken}`)
                .send(incompleteData)
                .expect(400);

            // Verify error response
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/location|coordinates|required/i);
        });

        it('should reject complaint without category', async () => {
            const incompleteData = {
                // Missing category
                location: {
                    address: 'MG Road, Mumbai',
                    coordinates: {
                        lat: 19.0760,
                        lng: 72.8777
                    }
                },
                description: 'This is a test complaint description with sufficient characters.',
                type: 'text'
            };

            const response = await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${authToken}`)
                .send(incompleteData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/category|required/i);
        });

        it('should reject complaint without description', async () => {
            const incompleteData = {
                category: categoryId,
                title: 'Test Complaint',
                location: {
                    address: 'MG Road, Mumbai',
                    coordinates: {
                        lat: 19.0760,
                        lng: 72.8777
                    }
                },
                // Missing description
                type: 'text'
            };

            const response = await request(app)
                .post('/api/complaints')
                .set('Authorization', `Bearer ${authToken}`)
                .send(incompleteData)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/description|required/i);
        });
    });
});
