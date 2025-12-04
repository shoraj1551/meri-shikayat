/**
 * Admin Role and Status Management Tests
 * Tests for admin authorization and complaint status updates
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes.js';
import complaintRoutes from '../routes/complaint.routes.js';
import adminRoutes from '../routes/admin.routes.js';
import './setup.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

describe('Admin Role and Status Management Tests', () => {
    let userToken;
    let adminToken;
    let complaintId;

    // Setup: Create user, admin, and a complaint
    beforeEach(async () => {
        // Register regular user
        const userResponse = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Regular User',
                email: 'user@example.com',
                password: 'User@123',
                phone: '9876543210',
                location: {
                    address: 'User Address',
                    coordinates: { lat: 19.0760, lng: 72.8777 }
                }
            });

        userToken = userResponse.body.token;

        // Create a complaint
        const complaintResponse = await request(app)
            .post('/api/complaints')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                category: 'roads',
                location: {
                    address: 'Test Road, Mumbai',
                    coordinates: { lat: 19.0760, lng: 72.8777 }
                },
                description: 'Test complaint for admin status update testing with sufficient characters.',
                type: 'text'
            });

        complaintId = complaintResponse.body.complaint._id;

        // Register admin (Note: In real scenario, admin would be created differently)
        // For testing, we'll use admin login endpoint
        const adminLoginResponse = await request(app)
            .post('/api/auth/admin/login')
            .send({
                email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
                password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123'
            });

        if (adminLoginResponse.status === 200) {
            adminToken = adminLoginResponse.body.token;
        }
    });

    describe('PATCH /api/admin/complaints/:id/status - Admin Status Change', () => {
        it('should allow admin to change complaint status', async () => {
            // Skip if admin token not available
            if (!adminToken) {
                console.log('Skipping admin test - admin credentials not configured');
                return;
            }

            const response = await request(app)
                .patch(`/api/admin/complaints/${complaintId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'In Progress',
                    note: 'Admin is reviewing the complaint'
                })
                .expect(200);

            // Verify response
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.complaint).toHaveProperty('status', 'In Progress');
        });

        it('should reject status change from non-admin user', async () => {
            const response = await request(app)
                .patch(`/api/admin/complaints/${complaintId}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    status: 'In Progress'
                })
                .expect(403);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/unauthorized|forbidden|admin/i);
        });
    });

    describe('GET /api/complaints/:id - Database Reflection', () => {
        it('should reflect status change in database', async () => {
            // Skip if admin token not available
            if (!adminToken) {
                console.log('Skipping database reflection test - admin credentials not configured');
                return;
            }

            // Change status
            await request(app)
                .patch(`/api/admin/complaints/${complaintId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'Resolved',
                    note: 'Issue has been fixed'
                });

            // Fetch complaint to verify
            const response = await request(app)
                .get(`/api/complaints/${complaintId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            // Verify status is updated
            expect(response.body.complaint).toHaveProperty('status', 'Resolved');

            // Verify status history if implemented
            if (response.body.complaint.statusHistory) {
                expect(response.body.complaint.statusHistory.length).toBeGreaterThan(0);
            }
        });

        it('should maintain complaint data integrity after status change', async () => {
            // Skip if admin token not available
            if (!adminToken) {
                console.log('Skipping data integrity test - admin credentials not configured');
                return;
            }

            // Get original complaint data
            const originalResponse = await request(app)
                .get(`/api/complaints/${complaintId}`)
                .set('Authorization', `Bearer ${userToken}`);

            const originalDescription = originalResponse.body.complaint.description;
            const originalCategory = originalResponse.body.complaint.category;

            // Change status
            await request(app)
                .patch(`/api/admin/complaints/${complaintId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'In Progress'
                });

            // Fetch again and verify data integrity
            const updatedResponse = await request(app)
                .get(`/api/complaints/${complaintId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(updatedResponse.body.complaint.description).toBe(originalDescription);
            expect(updatedResponse.body.complaint.category).toBe(originalCategory);
            expect(updatedResponse.body.complaint.status).toBe('In Progress');
        });
    });
});
