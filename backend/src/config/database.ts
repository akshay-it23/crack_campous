/**
 * MongoDB Database Configuration
 * 
 * This module handles the connection to MongoDB using Mongoose.
 * 
 * Why Mongoose?
 * - Schema validation (ensures data consistency)
 * - Middleware hooks (pre/post save, update, etc.)
 * - Query builder (easier than raw MongoDB queries)
 * - Type safety with TypeScript
 * 
 * Connection Features:
 * - Auto-reconnect on connection loss
 * - Connection pooling for performance
 * - Event listeners for monitoring
 */

import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * 
 * This function:
 * 1. Reads MONGODB_URI from environment variables
 * 2. Connects to MongoDB with optimized settings
 * 3. Sets up event listeners for connection status
 * 4. Handles connection errors gracefully
 * 
 * @throws Error if MONGODB_URI is not defined
 * @throws Error if connection fails
 */
export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        // These options optimize connection performance and reliability
        await mongoose.connect(mongoURI);

        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);

    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Exit process with failure code
        // In production, you might want to retry instead
        process.exit(1);
    }
};

/**
 * Connection event listeners
 * 
 * These help monitor database health in production:
 * - 'connected': Initial connection successful
 * - 'error': Connection error occurred
 * - 'disconnected': Lost connection to database
 */

mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
});

/**
 * Graceful shutdown
 * 
 * When the Node.js process terminates, close the database connection
 * This prevents connection leaks and ensures clean shutdown
 */
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed due to app termination');
    process.exit(0);
});
