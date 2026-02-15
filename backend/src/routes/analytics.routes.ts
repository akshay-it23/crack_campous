/**
 * Analytics Routes
 * 
 * Admin endpoints for platform analytics
 */

import express, { Request, Response } from 'express';
import {
    getUserAnalytics,
    getPracticeAnalytics,
    getEngagementMetrics,
    getPerformanceMetrics,
    exportAnalyticsData,
} from '../services/analytics.service';
import { requireAdmin, requirePermission } from '../middleware/adminAuth.middleware';
import { AdminPermission } from '../types/admin.types';

const router = express.Router();

/**
 * GET /api/admin/analytics/users
 * Get user analytics
 */
router.get(
    '/users',
    requireAdmin,
    requirePermission(AdminPermission.VIEW_ANALYTICS),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query;

            const analytics = await getUserAnalytics(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            res.status(200).json({
                success: true,
                data: analytics,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get user analytics',
            });
        }
    }
);

/**
 * GET /api/admin/analytics/practice
 * Get practice analytics
 */
router.get(
    '/practice',
    requireAdmin,
    requirePermission(AdminPermission.VIEW_ANALYTICS),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { startDate, endDate } = req.query;

            const analytics = await getPracticeAnalytics(
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined
            );

            res.status(200).json({
                success: true,
                data: analytics,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get practice analytics',
            });
        }
    }
);

/**
 * GET /api/admin/analytics/engagement
 * Get engagement metrics
 */
router.get(
    '/engagement',
    requireAdmin,
    requirePermission(AdminPermission.VIEW_ANALYTICS),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const metrics = await getEngagementMetrics();

            res.status(200).json({
                success: true,
                data: metrics,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get engagement metrics',
            });
        }
    }
);

/**
 * GET /api/admin/analytics/performance
 * Get performance metrics
 */
router.get(
    '/performance',
    requireAdmin,
    requirePermission(AdminPermission.VIEW_ANALYTICS),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const metrics = await getPerformanceMetrics();

            res.status(200).json({
                success: true,
                data: metrics,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get performance metrics',
            });
        }
    }
);

/**
 * GET /api/admin/analytics/export
 * Export all analytics data
 */
router.get(
    '/export',
    requireAdmin,
    requirePermission(AdminPermission.EXPORT_DATA),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await exportAnalyticsData();

            res.status(200).json({
                success: true,
                data,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to export analytics',
            });
        }
    }
);

export default router;
