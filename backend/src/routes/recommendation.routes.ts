/**
 * Recommendation Routes
 * 
 * API endpoints for AI-powered personalized recommendations
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { RecommendationService } from '../services/recommendation.service';

const router = express.Router();

/**
 * GET /api/recommendations
 * Get personalized recommendations for the current user
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const recommendations = await RecommendationService.getRecommendations(userId);

        res.json({
            success: true,
            data: recommendations,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get recommendations',
        });
    }
});

/**
 * POST /api/recommendations/refresh
 * Force refresh recommendations (generate new ones)
 */
router.post('/refresh', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const recommendations = await RecommendationService.generateRecommendations(userId);

        res.json({
            success: true,
            message: 'Recommendations refreshed successfully',
            data: recommendations,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to refresh recommendations',
        });
    }
});

/**
 * GET /api/recommendations/study-plan
 * Get AI-generated study plan
 */
router.get('/study-plan', authMiddleware, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const recommendations = await RecommendationService.getRecommendations(userId);

        res.json({
            success: true,
            data: {
                studyPlan: recommendations.studyPlan,
                generatedAt: recommendations.generatedAt,
                expiresAt: recommendations.expiresAt,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get study plan',
        });
    }
});

export default router;
