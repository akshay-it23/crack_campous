/**
 * Leaderboard Routes
 * 
 * Endpoints for leaderboard system.
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as leaderboardService from '../services/leaderboard.service';
import { getLeaderboardSchema } from '../validators/gamification.validator';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/leaderboard/global
 * 
 * Get global leaderboard
 * Public endpoint
 */
router.get('/global', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedQuery = getLeaderboardSchema.parse(req.query);

        const leaderboard = await leaderboardService.getGlobalLeaderboard(
            validatedQuery.limit,
            validatedQuery.skip
        );

        res.status(200).json(leaderboard);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/leaderboard/topic/:topicId
 * 
 * Get topic-specific leaderboard
 * Public endpoint
 */
router.get('/topic/:topicId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topicId } = req.params;
        const validatedQuery = getLeaderboardSchema.parse(req.query);

        const leaderboard = await leaderboardService.getTopicLeaderboard(
            topicId,
            validatedQuery.limit
        );

        res.status(200).json(leaderboard);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/leaderboard/my-rank
 * 
 * Get current user's rank
 * Protected endpoint
 */
router.get('/my-rank', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const validatedQuery = getLeaderboardSchema.parse(req.query);

        const type = validatedQuery.topicId ? 'topic' : 'global';
        const rank = await leaderboardService.getUserRank(userId, type, validatedQuery.topicId);

        res.status(200).json(rank);
    } catch (error) {
        next(error);
    }
});

export default router;
