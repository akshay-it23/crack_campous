/**
 * Badge Service - Business Logic for Badge System
 * 
 * Handles badge awarding, progress tracking, and criteria checking.
 */

import { Badge } from '../models/Badge';
import { UserBadge } from '../models/UserBadge';
import { User } from '../models/User';
import { PracticeLog } from '../models/PracticeLog';
import { UserProgress } from '../models/UserProgress';
import { BadgeResponse, UserBadgeResponse } from '../types/gamification.types';

/**
 * Check and award badges to user based on their activity
 * Called after each practice log
 */
export const checkAndAwardBadges = async (userId: string): Promise<void> => {
    // Get all badge definitions
    const allBadges = await Badge.find();

    // Get user's already earned badges
    const earnedBadges = await UserBadge.find({ userId }).select('badgeId');
    const earnedBadgeIds = earnedBadges.map(ub => ub.badgeId);

    // Filter out already earned badges
    const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.badgeId));

    // Check each unearned badge
    for (const badge of unearnedBadges) {
        const shouldAward = await checkBadgeCriteria(userId, badge);

        if (shouldAward) {
            await awardBadge(userId, badge.badgeId, badge.points);
        }
    }
};

/**
 * Check if user meets badge criteria
 */
const checkBadgeCriteria = async (userId: string, badge: any): Promise<boolean> => {
    const { criteria } = badge;

    switch (criteria.type) {
        case 'solve_count':
            // Check total questions solved
            const totalSolved = await PracticeLog.countDocuments({ userId, solved: true });
            return totalSolved >= criteria.value;

        case 'streak_days':
            // Check current streak
            const user = await User.findById(userId);
            return user?.gamification?.currentStreak >= criteria.value;

        case 'topic_mastery':
            // Check topic accuracy
            if (!criteria.topicId) return false;
            const progress = await UserProgress.findOne({
                userId,
                topicId: criteria.topicId
            });
            return progress?.accuracyPercentage >= criteria.value;

        case 'accuracy':
            // Check overall accuracy across all topics
            const allProgress = await UserProgress.find({ userId });
            if (allProgress.length === 0) return false;

            const avgAccuracy = allProgress.reduce((sum, p) => sum + p.accuracyPercentage, 0) / allProgress.length;
            return avgAccuracy >= criteria.value;

        case 'time_based':
            // Check if practiced on specific day/time (e.g., night owl)
            // For now, just check if they have any practice logs
            const practiceCount = await PracticeLog.countDocuments({ userId });
            return practiceCount >= criteria.value;

        default:
            return false;
    }
};

/**
 * Award a badge to user
 */
const awardBadge = async (userId: string, badgeId: string, points: number): Promise<void> => {
    // Create user badge record
    await UserBadge.create({
        userId,
        badgeId,
        earnedAt: new Date(),
        progress: 100,
    });

    // Update user's gamification stats
    await User.findByIdAndUpdate(userId, {
        $inc: {
            'gamification.badgesEarned': 1,
            'gamification.totalPoints': points,
        },
    });

    // Recalculate level
    await updateUserLevel(userId);
};

/**
 * Update user's level based on total points
 * Level = floor(totalPoints / 100) + 1
 */
const updateUserLevel = async (userId: string): Promise<void> => {
    const user = await User.findById(userId);
    if (!user) return;

    const newLevel = Math.floor((user.gamification?.totalPoints || 0) / 100) + 1;

    await User.findByIdAndUpdate(userId, {
        $set: { 'gamification.level': newLevel },
    });
};

/**
 * Get all badges earned by user
 */
export const getUserBadges = async (userId: string): Promise<UserBadgeResponse[]> => {
    const userBadges = await UserBadge.find({ userId }).sort({ earnedAt: -1 });

    const badges: UserBadgeResponse[] = [];

    for (const ub of userBadges) {
        const badge = await Badge.findOne({ badgeId: ub.badgeId });
        if (badge) {
            badges.push({
                _id: ub._id.toString(),
                badgeId: ub.badgeId,
                badge: {
                    _id: badge._id.toString(),
                    badgeId: badge.badgeId,
                    name: badge.name,
                    description: badge.description,
                    category: badge.category,
                    criteria: badge.criteria,
                    iconUrl: badge.iconUrl,
                    rarity: badge.rarity,
                    points: badge.points,
                },
                earnedAt: ub.earnedAt,
                progress: ub.progress,
            });
        }
    }

    return badges;
};

/**
 * Get all available badges in system
 */
export const getAllBadges = async (userId?: string): Promise<BadgeResponse[]> => {
    const allBadges = await Badge.find().sort({ rarity: 1, points: 1 });

    let earnedBadgeIds: string[] = [];
    if (userId) {
        const userBadges = await UserBadge.find({ userId }).select('badgeId earnedAt');
        earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    }

    return allBadges.map(badge => ({
        _id: badge._id.toString(),
        badgeId: badge.badgeId,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        criteria: badge.criteria,
        iconUrl: badge.iconUrl,
        rarity: badge.rarity,
        points: badge.points,
        earned: earnedBadgeIds.includes(badge.badgeId),
    }));
};

/**
 * Get badge progress for user
 */
export const getBadgeProgress = async (userId: string, badgeId: string): Promise<number> => {
    const badge = await Badge.findOne({ badgeId });
    if (!badge) throw new Error('Badge not found');

    const { criteria } = badge;
    let currentValue = 0;

    switch (criteria.type) {
        case 'solve_count':
            currentValue = await PracticeLog.countDocuments({ userId, solved: true });
            break;

        case 'streak_days':
            const user = await User.findById(userId);
            currentValue = user?.gamification?.currentStreak || 0;
            break;

        case 'topic_mastery':
        case 'accuracy':
            const progress = await UserProgress.findOne({
                userId,
                topicId: criteria.topicId
            });
            currentValue = progress?.accuracyPercentage || 0;
            break;

        default:
            currentValue = 0;
    }

    return Math.min(100, Math.floor((currentValue / criteria.value) * 100));
};
