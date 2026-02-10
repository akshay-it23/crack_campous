/**
 * Authentication Middleware
 * 
 * This middleware verifies JWT tokens and protects routes.
 * 
 * Usage in routes:
 *   router.get('/protected', authenticateToken, (req, res) => {
 *     // req.user contains { userId, iat, exp }
 *   });
 * 
 * How it works:
 * 1. Extract token from Authorization header
 * 2. Verify token using JWT secret
 * 3. Attach user data to request object
 * 4. Call next() to proceed to route handler
 * 5. If invalid, return 401 Unauthorized
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { TokenPayload } from '../types/auth.types';

/**
 * Extend Express Request to include user property
 * 
 * This allows TypeScript to know that req.user exists in protected routes
 */
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

/**
 * Authenticate JWT Token Middleware
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * 
 * Expected header format:
 *   Authorization: Bearer <token>
 * 
 * On success:
 * - Attaches user data to req.user
 * - Calls next()
 * 
 * On failure:
 * - Returns 401 Unauthorized
 * - Does NOT call next()
 */
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No authorization header provided',
            });
            return;
        }

        // Check if header starts with "Bearer "
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid authorization header format. Expected: Bearer <token>',
            });
            return;
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.substring(7);

        if (!token) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided',
            });
            return;
        }

        // Verify token
        const decoded = verifyToken(token);

        // Attach user data to request
        req.user = decoded;

        // Proceed to route handler
        next();
    } catch (error) {
        // Token verification failed
        const errorMessage = error instanceof Error ? error.message : 'Invalid token';

        res.status(401).json({
            error: 'Unauthorized',
            message: errorMessage,
        });
    }
};
