/**
 * Sharing Routes
 * 
 * Endpoints for social sharing features.
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as sharingService from '../services/sharing.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/share/stats
 * 
 * Get shareable stats for current user
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const stats = await sharingService.getShareableStats(userId);

        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/share/card
 * 
 * Generate progress card for current user
 */
router.get('/card', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const cardUrl = await sharingService.generateProgressCard(userId);

        res.status(200).json({ cardUrl });
    } catch (error) {
        next(error);
    }
});

export default router;
