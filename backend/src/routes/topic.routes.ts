/**
 * Topic Routes
 * 
 * Public endpoints for browsing topics.
 * No authentication required (anyone can view topics).
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as practiceService from '../services/practice.service';

const router = Router();

/**
 * GET /api/topics
 * 
 * Get all topics grouped by category
 * 
 * Response (200 OK):
 * {
 *   "DSA": [
 *     { "_id": "...", "name": "Arrays", "difficulty": "Beginner", ... },
 *     { "_id": "...", "name": "Dynamic Programming", "difficulty": "Advanced", ... }
 *   ],
 *   "System Design": [...],
 *   "Aptitude": [...]
 * }
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const topics = await practiceService.getAllTopics();
        res.status(200).json(topics);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/topics/:id
 * 
 * Get single topic by ID
 * 
 * Response (200 OK):
 * {
 *   "_id": "...",
 *   "name": "Arrays",
 *   "category": "DSA",
 *   "difficulty": "Beginner",
 *   "recommendedQuestions": 50,
 *   "description": "...",
 *   ...
 * }
 * 
 * Errors:
 * - 404: Topic not found
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topic = await practiceService.getTopicById(req.params.id);
        res.status(200).json(topic);
    } catch (error) {
        next(error);
    }
});

export default router;
