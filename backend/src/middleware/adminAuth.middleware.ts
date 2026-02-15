/**
 * Admin Authentication Middleware
 * 
 * Middleware for protecting admin routes and checking permissions
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAdminAuthPayload, AdminPermission, AdminRole } from '../types/admin.types';
import Admin from '../models/Admin';

/**
 * Extend Express Request to include admin
 */
declare global {
    namespace Express {
        interface Request {
            admin?: IAdminAuthPayload;
        }
    }
}

/**
 * Middleware: Require Admin Authentication
 * 
 * Verifies JWT token and attaches admin payload to request
 */
export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided. Admin authentication required.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, jwtSecret) as IAdminAuthPayload;

        // Verify admin exists and is active
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            res.status(401).json({
                success: false,
                message: 'Admin not found',
            });
            return;
        }

        if (!admin.isActive) {
            res.status(403).json({
                success: false,
                message: 'Admin account is deactivated',
            });
            return;
        }

        // Attach admin payload to request
        req.admin = decoded;

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }

        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: 'Token expired',
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message,
        });
    }
};

/**
 * Middleware Factory: Require Specific Permission
 * 
 * Returns middleware that checks if admin has specific permission
 */
export const requirePermission = (permission: AdminPermission) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.admin) {
                res.status(401).json({
                    success: false,
                    message: 'Admin authentication required',
                });
                return;
            }

            // Check if admin has permission
            if (!req.admin.permissions.includes(permission)) {
                res.status(403).json({
                    success: false,
                    message: `Permission denied. Required permission: ${permission}`,
                });
                return;
            }

            next();
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Permission check error',
                error: error.message,
            });
        }
    };
};

/**
 * Middleware Factory: Require Specific Role
 * 
 * Returns middleware that checks if admin has specific role
 */
export const requireRole = (role: AdminRole) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.admin) {
                res.status(401).json({
                    success: false,
                    message: 'Admin authentication required',
                });
                return;
            }

            // Check if admin has role
            if (req.admin.role !== role) {
                res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${role}`,
                });
                return;
            }

            next();
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Role check error',
                error: error.message,
            });
        }
    };
};

/**
 * Middleware: Require Super Admin
 * 
 * Shorthand for requiring super_admin role
 */
export const requireSuperAdmin = requireRole(AdminRole.SUPER_ADMIN);
