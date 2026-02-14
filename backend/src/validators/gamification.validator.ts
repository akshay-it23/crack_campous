/**
 * Gamification Validators
 * 
 * Zod schemas for validating gamification-related requests.
 */

import { z } from 'zod';

/**
 * Get Leaderboard Query Schema
 */
export const getLeaderboardSchema = z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : 50),
    skip: z.string().optional().transform(val => val ? parseInt(val) : 0),
    topicId: z.string().optional(),
});

/**
 * Complete Challenge Schema
 */
export const completeChallengeSchema = z.object({
    date: z.string().optional().transform(val => val ? new Date(val) : new Date()),
});

/**
 * Get Badge Progress Schema
 */
export const getBadgeProgressSchema = z.object({
    badgeId: z.string().min(1, 'Badge ID is required'),
});
