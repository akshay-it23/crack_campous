/**
 * Express Server Entry Point
 * 
 * This is the main file that starts the Express server.
 * 
 * Setup order (IMPORTANT):
 * 1. Load environment variables
 * 2. Connect to MongoDB
 * 3. Create Express app
 * 4. Configure middleware (CORS, JSON parser)
 * 5. Register routes
 * 6. Add error handlers (404, global error handler)
 * 7. Start server
 * 
 * Why this order?
 * - Environment variables must be loaded first (other modules need them)
 * - Database must connect before handling requests
 * - Middleware must be registered before routes
 * - Error handlers must be LAST (catch errors from routes)
 */

import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import topicRoutes from './routes/topic.routes';
import practiceRoutes from './routes/practice.routes';
import progressRoutes from './routes/progress.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app: Application = express();

// Server port (from .env or default 5000)
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 * 
 * Order matters! Middleware is executed in the order it's registered.
 */

// 1. CORS - Allow cross-origin requests from frontend
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true, // Allow cookies
    })
);

// 2. JSON Parser - Parse JSON request bodies
app.use(express.json());

// 3. URL-encoded Parser - Parse form data
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 * 
 * All routes are prefixed with /api
 * - /api/auth/* - Authentication endpoints
 * - /api/users/* - User profile endpoints
 * - /api/topics/* - Topic browsing (public)
 * - /api/practice/* - Practice tracking (protected)
 */

// Health check endpoint (useful for monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Register route modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/progress', progressRoutes);

/**
 * Error Handlers
 * 
 * MUST be registered AFTER all routes!
 * Order: 404 handler → Global error handler
 */

// 404 Not Found - Catches undefined routes
app.use(notFoundHandler);

// Global Error Handler - Catches all errors
app.use(errorHandler);

/**
 * Start Server
 * 
 * 1. Connect to MongoDB
 * 2. Start Express server
 * 3. Log server info
 */
const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 Server started successfully!');
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API base URL: http://localhost:${PORT}/api`);
            console.log('');
            console.log('Available endpoints:');
            console.log('  Authentication:');
            console.log('    POST   /api/auth/register');
            console.log('    POST   /api/auth/login');
            console.log('    POST   /api/auth/refresh');
            console.log('    POST   /api/auth/logout');
            console.log('  User Profile:');
            console.log('    GET    /api/users/me (protected)');
            console.log('    PUT    /api/users/me (protected)');
            console.log('  Topics:');
            console.log('    GET    /api/topics');
            console.log('    GET    /api/topics/:id');
            console.log('  Practice:');
            console.log('    POST   /api/practice (protected)');
            console.log('    GET    /api/practice/history (protected)');
            console.log('    GET    /api/practice/stats (protected)');
            console.log('    GET    /api/practice/stats/:topicId (protected)');
            console.log('  Progress:');
            console.log('    GET    /api/progress/overview (protected)');
            console.log('    GET    /api/progress/topic/:topicId (protected)');
            console.log('    GET    /api/progress/strengths-weaknesses (protected)');
            console.log('    POST   /api/progress/recalculate (protected)');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
