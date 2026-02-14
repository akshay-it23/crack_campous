/**
 * Sharing Service - Business Logic for Social Sharing
 * 
 * Handles progress card generation and shareable stats.
 */

import { User } from '../models/User';
import { PracticeLog } from '../models/PracticeLog';
import { ShareStatsResponse } from '../types/gamification.types';

/**
 * Get shareable stats for user
 */
export const getShareableStats = async (userId: string): Promise<ShareStatsResponse> => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get total questions and solved count
    const totalQuestions = await PracticeLog.countDocuments({ userId });
    const questionsSolved = await PracticeLog.countDocuments({ userId, solved: true });

    return {
        userName: user.fullName,
        totalQuestions,
        questionsSolved,
        currentStreak: user.gamification?.currentStreak || 0,
        longestStreak: user.gamification?.longestStreak || 0,
        badgesEarned: user.gamification?.badgesEarned || 0,
        level: user.gamification?.level || 1,
        totalPoints: user.gamification?.totalPoints || 0,
    };
};

/**
 * Generate progress card URL
 * For now, returns a simple JSON response
 * In production, this would generate an actual image using canvas
 */
export const generateProgressCard = async (userId: string): Promise<string> => {
    const stats = await getShareableStats(userId);

    // In a full implementation, you would:
    // 1. Use 'canvas' library to create 1200x630px image
    // 2. Add user stats, badges, streaks
    // 3. Save to /uploads/share-cards/${userId}.png
    // 4. Return URL: /uploads/share-cards/${userId}.png

    // For now, return a placeholder URL
    return `/api/share/stats?userId=${userId}`;
};
