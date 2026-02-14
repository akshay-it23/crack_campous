/**
 * Badge Routes
 * 
 * Endpoints for badge system.
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as badgeService from '../services/badge.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/badges
 * 
 * Get all available badges
 * Public endpoint (no auth required)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId; // Optional: show earned status if logged in
        const badges = await badgeService.getAllBadges(userId);

        res.status(200).json(badges);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/badges/my
 * 
 * Get badges earned by current user
 * Protected endpoint
 */
router.get('/my', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const badges = await badgeService.getUserBadges(userId);

        res.status(200).json(badges);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/badges/:badgeId/progress
 * 
 * Get progress toward specific badge
 * Protected endpoint
 */
router.get('/:badgeId/progress', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { badgeId } = req.params;

        const progress = await badgeService.getBadgeProgress(userId, badgeId);

        res.status(200).json({ badgeId, progress });
    } catch (error) {
        next(error);
    }
});

export default router;
