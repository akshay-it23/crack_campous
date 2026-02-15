/**
 * Audit Log Middleware
 * 
 * Automatically logs admin actions
 */

import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

/**
 * Create audit log entry
 */
export const createAuditLog = async (
    adminId: string,
    adminEmail: string,
    action: string,
    resource: string,
    resourceId?: string,
    changes?: { before?: any; after?: any },
    req?: Request
) => {
    try {
        await AuditLog.create({
            adminId,
            adminEmail,
            action,
            resource,
            resourceId,
            changes,
            ipAddress: req?.ip || req?.socket.remoteAddress,
            userAgent: req?.headers['user-agent'],
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error - logging failure shouldn't break the main operation
    }
};

/**
 * Middleware: Log admin action
 * 
 * Usage: Add after route handler to log the action
 */
export const logAdminAction = (action: string, resource: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Store original send function
        const originalSend = res.send;

        // Override send function to log after successful response
        res.send = function (data: any): Response {
            // Only log if response was successful (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.admin) {
                createAuditLog(
                    req.admin.adminId,
                    req.admin.email,
                    action,
                    resource,
                    req.params.id,
                    undefined,
                    req
                );
            }

            // Call original send
            return originalSend.call(this, data);
        };

        next();
    };
};
