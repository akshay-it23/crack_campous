/**
 * Authentication Routes
 * 
 * This module defines HTTP endpoints for authentication.
 * Routes handle HTTP concerns (request/response), business logic is in services.
 * 
 * Endpoints:
 * - POST /api/auth/register - Create new account
 * - POST /api/auth/login - Login with email/password
 * - POST /api/auth/refresh - Get new access token
 * - POST /api/auth/logout - Invalidate refresh token
 * 
 * Why separate routes from services?
 * - Routes handle HTTP (status codes, headers, validation)
 * - Services handle business logic (database, algorithms)
 * - Clean separation of concerns
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/register
 * 
 * Register a new user account
 * 
 * Request body:
 * - email: Valid email address
 * - password: Min 8 chars, must have uppercase, lowercase, digit
 * - fullName: User's full name
 * - college: (Optional) College name
 * - graduationYear: (Optional) Year between 2020-2030
 * - targetCompanies: (Optional) List of company names
 * 
 * Response (201 Created):
 * - user: User profile
 * - accessToken: JWT for API requests (15 min expiry)
 * - refreshToken: JWT for token refresh (7 day expiry)
 * - tokenType: "Bearer"
 * 
 * Errors:
 * - 400: Validation error or email already exists
 * - 500: Server error
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body with Zod
        const validatedData = registerSchema.parse(req.body);

        // Call service to register user
        const result = await authService.registerUser(validatedData);

        // Return success response
        res.status(201).json(result);
    } catch (error) {
        // Pass error to error handler middleware
        next(error);
    }
});

/**
 * POST /api/auth/login
 * 
 * Login with email and password
 * 
 * Request body:
 * - email: User's email
 * - password: User's password
 * 
 * Response (200 OK):
 * - user: User profile
 * - accessToken: JWT for API requests
 * - refreshToken: JWT for token refresh
 * - tokenType: "Bearer"
 * 
 * Errors:
 * - 400: Validation error
 * - 401: Invalid credentials
 * - 500: Server error
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);

        // Call service to login user
        const result = await authService.loginUser(validatedData);

        // Return success response
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/refresh
 * 
 * Get new access token using refresh token
 * 
 * Request body:
 * - refreshToken: Valid refresh token
 * 
 * Response (200 OK):
 * - accessToken: New JWT for API requests
 * - tokenType: "Bearer"
 * 
 * Errors:
 * - 400: Validation error
 * - 401: Invalid or expired refresh token
 * - 500: Server error
 * 
 * When to use:
 * - When access token expires (15 min)
 * - Client should automatically call this when getting 401
 * - Avoids forcing user to re-login
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { refreshToken } = refreshTokenSchema.parse(req.body);

        // Call service to refresh token
        const newAccessToken = await authService.refreshAccessToken(refreshToken);

        // Return new access token
        res.status(200).json({
            accessToken: newAccessToken,
            tokenType: 'Bearer',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/logout
 * 
 * Logout user by invalidating refresh token
 * 
 * Request body:
 * - refreshToken: Refresh token to invalidate
 * 
 * Response (200 OK):
 * - message: Success message
 * 
 * How it works:
 * 1. Service deletes refresh token from database
 * 2. Token can no longer be used to get new access tokens
 * 3. Client should also discard both tokens
 * 
 * Note:
 * - Access token still valid until expiry (can't be revoked)
 * - But it expires in 15 min anyway
 * - Refresh token is the important one to revoke
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const { refreshToken } = refreshTokenSchema.parse(req.body);

        // Call service to logout
        await authService.logoutUser(refreshToken);

        // Return success message
        res.status(200).json({
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
