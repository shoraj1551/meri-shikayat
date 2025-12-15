/**
 * Main server entry point for Meri Shikayat API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { validateEnvironment } from './utils/validateEnv.js';
import { securityHeaders, mongoSanitization, globalRateLimiter } from './middleware/security.js';
import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import locationRoutes from './routes/location.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import socialRoutes from './routes/social.routes.js';
import storiesRoutes from './routes/stories.routes.js';
import departmentsRoutes from './routes/departments.js';
import contractorsRoutes from './routes/contractors.js';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

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

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Meri Shikayat API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);  // Changed from '/api' to '/api/social'
app.use('/api/stories', storiesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/contractors', contractorsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

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
