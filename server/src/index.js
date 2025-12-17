/**
 * Main server entry point for Meri Shikayat API
 */

// CRITICAL: Load environment variables FIRST before any other imports
// This ensures .env is loaded before modules that use process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { validateEnvironment } from './utils/validateEnv.js';
import { securityHeaders, mongoSanitization, globalRateLimiter } from './middleware/security.js';
import getRedisClient, { isRedisAvailable, closeRedisConnection } from './config/redis.js';
import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import locationRoutes from './routes/location.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import socialRoutes from './routes/social.routes.js';
import storiesRoutes from './routes/stories.routes.js';
import departmentsRoutes from './routes/departments.js';
import contractorsRoutes from './routes/contractors.js';
import registrationRoutes from './routes/registration.routes.js';
import profileRoutes from './routes/profile.routes.js';
import verificationRoutes from './routes/verification.routes.js';

// Validate environment variables
validateEnvironment();

// Initialize Redis connection
try {
    const redisClient = getRedisClient();
    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
        console.warn('⚠️  Redis connection failed - rate limiting will use memory store (single instance only)');
    }
} catch (error) {
    console.warn('⚠️  Redis initialization error:', error.message);
    console.warn('⚠️  Continuing without Redis - rate limiting will use memory store');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - restrict to allowed origins
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Security middleware
app.use(securityHeaders);
app.use(mongoSanitization);
app.use(globalRateLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Database connection middleware for Vercel
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState === 0) {
        try {
            await connectDatabase();
        } catch (error) {
            console.error('Database connection failed:', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }
    next();
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'OK', message: 'Meri Shikayat API v1 is running', version: '1.0.5' });
});

// Legacy health check (deprecated)
app.get('/api/health', (req, res) => {
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Deprecation-Info', 'Please use /api/v1/health instead');
    res.json({ status: 'OK', message: 'Meri Shikayat API is running (deprecated endpoint)' });
});

// API Routes with versioning (v1)
const API_VERSION = '/api/v1';

app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/auth`, registrationRoutes);  // Multi-role registration
app.use(`${API_VERSION}/users`, userRoutes);
app.use(`${API_VERSION}/complaints`, complaintRoutes);
app.use(`${API_VERSION}/location`, locationRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/social`, socialRoutes);
app.use(`${API_VERSION}/stories`, storiesRoutes);
app.use(`${API_VERSION}/departments`, departmentsRoutes);
app.use(`${API_VERSION}/contractors`, contractorsRoutes);
app.use(`${API_VERSION}/profile`, profileRoutes);
app.use(`${API_VERSION}/verification`, verificationRoutes);

// Import error handlers
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './middleware/errorHandler.js';

// Handle unhandled rejections and uncaught exceptions
handleUnhandledRejection();
handleUncaughtException();

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Centralized error handling middleware - must be last
app.use(errorHandler);

// Export app for Vercel
export default app;

// Start server locally
if (process.env.NODE_ENV !== 'production') {
    const startServer = async () => {
        try {
            await connectDatabase();
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log(`Environment: ${process.env.NODE_ENV}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };
    startServer();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await closeRedisConnection();
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await closeRedisConnection();
    await mongoose.connection.close();
    process.exit(0);
});
