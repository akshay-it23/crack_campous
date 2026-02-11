/**
 * Progress Routes
 * 
 * Protected endpoints for progress tracking and analytics.
 * All routes require authentication.
 * 
 * Endpoints:
 * - GET /api/progress/overview - Overall progress summary
 * - GET /api/progress/topic/:topicId - Specific topic progress
 * - GET /api/progress/strengths-weaknesses - Top/bottom topics
 * - POST /api/progress/recalculate - Manually trigger recalculation
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progress.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/progress/overview
 * 
 * Get overall progress across all topics
 * 
 * Response (200 OK):
 * {
 *   "totalTopics": 15,
 *   "topicsStarted": 3,
 *   "topicsNotStarted": 12,
 *   "averageStrengthScore": 58,
 *   "totalQuestionsAttempted": 45,
 *   "totalQuestionsSolved": 32,
 *   "overallAccuracyPercentage": 71,
 *   "totalTimeMinutes": 540,
 *   "topicProgress": [
 *     {
 *       "topicId": "...",
 *       "topicName": "Arrays",
 *       "strengthScore": 65,
 *       "accuracyPercentage": 80,
 *       "completionPercentage": 50,
 *       ...
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const overview = await progressService.getProgressOverview(userId);
        res.status(200).json(overview);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/progress/topic/:topicId
 * 
 * Get detailed progress for a specific topic
 * 
 * Response (200 OK):
 * {
 *   "topicId": "...",
 *   "topicName": "Arrays",
 *   "category": "DSA",
 *   "difficulty": "Beginner",
 *   "strengthScore": 65,
 *   "accuracyPercentage": 80,
 *   "completionPercentage": 50,
 *   "consistencyScore": 71,
 *   "totalQuestionsAttempted": 25,
 *   "questionsSolved": 20,
 *   "recommendedQuestions": 50,
 *   "totalTimeMinutes": 300,
 *   "avgTimePerQuestion": 12,
 *   "difficultyBreakdown": {
 *     "easy": { "attempted": 15, "solved": 14 },
 *     "medium": { "attempted": 8, "solved": 5 },
 *     "hard": { "attempted": 2, "solved": 1 }
 *   },
 *   "lastPracticedAt": "2024-01-01T10:00:00Z",
 *   "updatedAt": "2024-01-01T10:05:00Z"
 * }
 * 
 * Errors:
 * - 404: Topic not found
 */
router.get('/topic/:topicId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { topicId } = req.params;

        const progress = await progressService.getTopicProgress(userId, topicId);
        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/progress/strengths-weaknesses
 * 
 * Get top 5 strong topics and bottom 5 weak topics
 * 
 * Response (200 OK):
 * {
 *   "strengths": [
 *     {
 *       "topicName": "Arrays",
 *       "strengthScore": 85,
 *       "accuracyPercentage": 90,
 *       ...
 *     },
 *     ...
 *   ],
 *   "weaknesses": [
 *     {
 *       "topicName": "Dynamic Programming",
 *       "strengthScore": 32,
 *       "accuracyPercentage": 45,
 *       ...
 *     },
 *     ...
 *   ]
 * }
 */
router.get(
    '/strengths-weaknesses',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const data = await progressService.getStrengthsWeaknesses(userId);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/progress/recalculate
 * 
 * Manually trigger progress recalculation
 * 
 * Request body (optional):
 * {
 *   "topicIds": ["507f1f77bcf86cd799439011", "..."]  // Optional: specific topics
 * }
 * 
 * If topicIds not provided, recalculates all topics.
 * 
 * Response (200 OK):
 * {
 *   "message": "Progress recalculated successfully",
 *   "topicsRecalculated": 3,
 *   "updatedAt": "2024-01-01T10:00:00Z"
 * }
 */
router.post('/recalculate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { topicIds } = req.body;

        const result = await progressService.recalculateProgress(userId, topicIds);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
