/**
 * Challenge Routes
 * 
 * Endpoints for daily challenge system.
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as challengeService from '../services/challenge.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/challenges/today
 * 
 * Get today's challenge for current user
 */
router.get('/today', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const challenge = await challengeService.getTodayChallenge(userId);

        res.status(200).json(challenge);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/challenges/history
 * 
 * Get challenge history for current user
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 7;

        const history = await challengeService.getChallengeHistory(userId, limit);

        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
});

export default router;
