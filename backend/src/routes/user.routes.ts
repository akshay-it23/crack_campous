/**
 * User Profile Routes
 * 
 * This module defines HTTP endpoints for user profile management.
 * All routes are protected (require JWT authentication).
 * 
 * Endpoints:
 * - GET /api/users/me - Get current user profile
 * - PUT /api/users/me - Update current user profile
 * 
 * Why separate from auth routes?
 * - Different resource (users vs auth)
 * - All user routes are protected (require auth)
 * - Easier to add more user-related endpoints later
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { updateProfileSchema } from '../validators/auth.validator';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/users/me
 * 
 * Get current user profile
 * 
 * Headers:
 * - Authorization: Bearer <access_token>
 * 
 * Response (200 OK):
 * - _id: User ID
 * - email: User email
 * - fullName: Full name
 * - college: College name (optional)
 * - graduationYear: Graduation year (optional)
 * - targetCompanies: Target companies (optional)
 * - createdAt: Account creation date
 * - updatedAt: Last update date
 * 
 * Errors:
 * - 401: Unauthorized (no token or invalid token)
 * - 404: User not found
 * - 500: Server error
 * 
 * How it works:
 * 1. authenticateToken middleware verifies JWT
 * 2. Middleware attaches user data to req.user
 * 3. Route handler uses req.user.userId to fetch profile
 */
router.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.user is set by authenticateToken middleware
        const userId = req.user!.userId;

        // Fetch user profile
        const user = await authService.getUserById(userId);

        // Return user profile
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/users/me
 * 
 * Update current user profile
 * 
 * Headers:
 * - Authorization: Bearer <access_token>
 * 
 * Request body (all fields optional):
 * - fullName: New full name
 * - college: New college name
 * - graduationYear: New graduation year
 * - targetCompanies: New target companies array
 * 
 * Response (200 OK):
 * - Updated user profile (same format as GET /me)
 * 
 * Errors:
 * - 400: Validation error
 * - 401: Unauthorized
 * - 404: User not found
 * - 500: Server error
 * 
 * Note:
 * - Can update one field or multiple fields
 * - Email and password cannot be updated via this endpoint
 * - (Future: Add separate endpoints for email/password change)
 */
router.put('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body
        const validatedData = updateProfileSchema.parse(req.body);

        // Get user ID from token
        const userId = req.user!.userId;

        // Update profile
        const updatedUser = await authService.updateUserProfile(userId, validatedData);

        // Return updated profile
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

export default router;
