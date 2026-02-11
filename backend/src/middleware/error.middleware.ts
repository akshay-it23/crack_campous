/**
 * Global Error Handler Middleware
 * 
 * This middleware catches all errors thrown in the application
 * and returns consistent error responses.
 * 
 * Why global error handler?
 * - Consistent error format across all endpoints
 * - Centralized error logging
 * - Cleaner route handlers (no try-catch everywhere)
 * - Easy to add error tracking (Sentry, etc.)
 * 
 * IMPORTANT: This must be the LAST middleware in the chain!
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';

/**
 * Error Handler Middleware
 * 
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * 
 * Handles different error types:
 * - ZodError: Validation errors (400 Bad Request)
 * - MongooseError: Database errors (400/500)
 * - Custom errors: Application errors (varies)
 * - Unknown errors: Generic 500 Internal Server Error
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Safely log error
    console.error('❌ Error occurred:');
    if (err) {
        console.error('Message:', err.message || 'Unknown error');
        console.error('Stack:', err.stack || 'No stack trace');
    }

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid request data',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Mongoose validation errors
    if (err instanceof MongooseError.ValidationError) {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));

        res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid data',
            details: errors,
        });
        return;
    }

    // Mongoose duplicate key error (unique constraint)
    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        const field = Object.keys((err as any).keyPattern)[0];
        res.status(400).json({
            error: 'Duplicate Error',
            message: `${field} already exists`,
        });
        return;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err instanceof MongooseError.CastError) {
        res.status(400).json({
            error: 'Invalid ID',
            message: 'Invalid resource ID format',
        });
        return;
    }

    // Custom application errors
    // (errors thrown with specific messages in services)
    if (err.message) {
        // Determine status code based on error message
        let statusCode = 500;

        if (
            err.message.includes('not found') ||
            err.message.includes('Not found')
        ) {
            statusCode = 404;
        } else if (
            err.message.includes('already exists') ||
            err.message.includes('Invalid') ||
            err.message.includes('required')
        ) {
            statusCode = 400;
        } else if (
            err.message.includes('Unauthorized') ||
            err.message.includes('expired') ||
            err.message.includes('revoked')
        ) {
            statusCode = 401;
        }

        res.status(statusCode).json({
            error: err.name || 'Error',
            message: err.message,
        });
        return;
    }

    // Generic error (fallback)
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong',
    });
};

/**
 * 404 Not Found Handler
 * 
 * Catches requests to undefined routes
 * Must be placed BEFORE error handler, AFTER all route definitions
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
};
