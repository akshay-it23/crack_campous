/**
 * Practice Routes
 * 
 * Protected endpoints for practice tracking.
 * All routes require authentication.
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as practiceService from '../services/practice.service';
import {
    logPracticeSchema,
    getPracticeHistorySchema,
    getPracticeStatsSchema,
} from '../validators/practice.validator';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/practice
 * 
 * Log a practice session
 * 
 * Request body:
 * {
 *   "topicId": "507f1f77bcf86cd799439011",
 *   "questionTitle": "Two Sum",
 *   "questionUrl": "https://leetcode.com/problems/two-sum",
 *   "difficulty": "Easy",
 *   "timeSpentMinutes": 15,
 *   "solved": true,
 *   "notes": "Used hash map approach"
 * }
 * 
 * Response (201 Created):
 * {
 *   "_id": "...",
 *   "userId": "...",
 *   "topicId": "...",
 *   "topicName": "Arrays",
 *   "questionTitle": "Two Sum",
 *   "difficulty": "Easy",
 *   "timeSpentMinutes": 15,
 *   "solved": true,
 *   "practicedAt": "2024-01-01T10:00:00Z",
 *   ...
 * }
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = logPracticeSchema.parse(req.body);
        const userId = req.user!.userId;

        const practiceLog = await practiceService.logPractice(userId, validatedData);

        res.status(201).json(practiceLog);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/practice/history
 * 
 * Get practice history
 * 
 * Query params:
 * - topicId (optional): Filter by topic
 * - limit (optional): Number of results (default: 20, max: 100)
 * - skip (optional): Pagination offset (default: 0)
 * 
 * Example: GET /api/practice/history?topicId=507f...&limit=10&skip=0
 * 
 * Response (200 OK):
 * [
 *   {
 *     "_id": "...",
 *     "topicName": "Arrays",
 *     "questionTitle": "Two Sum",
 *     "difficulty": "Easy",
 *     "timeSpentMinutes": 15,
 *     "solved": true,
 *     "practicedAt": "2024-01-01T10:00:00Z",
 *     ...
 *   },
 *   ...
 * ]
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedQuery = getPracticeHistorySchema.parse(req.query);
        const userId = req.user!.userId;

        const history = await practiceService.getPracticeHistory(userId, validatedQuery);

        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/practice/stats
 * 
 * Get overall practice statistics
 * 
 * Response (200 OK):
 * {
 *   "totalTopics": 12,
 *   "topicsStarted": 3,
 *   "totalQuestions": 25,
 *   "questionsSolved": 18,
 *   "totalTimeMinutes": 300,
 *   "overallAccuracy": 72,
 *   "topicStats": [
 *     {
 *       "topicId": "...",
 *       "topicName": "Arrays",
 *       "totalQuestions": 10,
 *       "questionsSolved": 7,
 *       "accuracyPercentage": 70,
 *       "difficultyBreakdown": { ... },
 *       ...
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedQuery = getPracticeStatsSchema.parse(req.query);
        const userId = req.user!.userId;

        const stats = await practiceService.getPracticeStats(userId, validatedQuery.topicId);

        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/practice/stats/:topicId
 * 
 * Get statistics for specific topic
 * 
 * Response (200 OK):
 * {
 *   "topicId": "...",
 *   "topicName": "Arrays",
 *   "totalQuestions": 10,
 *   "questionsSolved": 7,
 *   "totalTimeMinutes": 120,
 *   "averageTimePerQuestion": 12,
 *   "accuracyPercentage": 70,
 *   "lastPracticedAt": "2024-01-01T10:00:00Z",
 *   "difficultyBreakdown": {
 *     "Easy": { "attempted": 5, "solved": 4 },
 *     "Medium": { "attempted": 3, "solved": 2 },
 *     "Hard": { "attempted": 2, "solved": 1 }
 *   }
 * }
 */
router.get('/stats/:topicId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const topicId = req.params.topicId;

        const stats = await practiceService.getPracticeStats(userId, topicId);

        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
});

export default router;
