/**
 * Leaderboard Service - Business Logic for Rankings
 * 
 * Handles leaderboard calculations, caching, and user rankings.
 */

import { Leaderboard } from '../models/Leaderboard';
import { User } from '../models/User';
import { UserProgress } from '../models/UserProgress';
import { Topic } from '../models/Topic';
import { LeaderboardResponse, LeaderboardEntry } from '../types/gamification.types';

/**
 * Get global leaderboard
 */
export const getGlobalLeaderboard = async (limit: number = 50, skip: number = 0): Promise<LeaderboardResponse> => {
    // Try to get cached leaderboard
    const cached = await Leaderboard.findOne({
        type: 'global',
        expiresAt: { $gt: new Date() }
    });

    if (cached) {
        return {
            type: 'global',
            rankings: cached.rankings.slice(skip, skip + limit),
            lastUpdated: cached.lastUpdated,
        };
    }

    // Calculate fresh leaderboard
    const rankings = await calculateGlobalRankings();

    // Cache it
    await cacheLeaderboard('global', rankings);

    return {
        type: 'global',
        rankings: rankings.slice(skip, skip + limit),
        lastUpdated: new Date(),
    };
};

/**
 * Get topic-specific leaderboard
 */
export const getTopicLeaderboard = async (topicId: string, limit: number = 50): Promise<LeaderboardResponse> => {
    // Try to get cached leaderboard
    const cached = await Leaderboard.findOne({
        type: 'topic',
        topicId,
        expiresAt: { $gt: new Date() }
    });

    if (cached) {
        const topic = await Topic.findById(topicId);
        return {
            type: 'topic',
            topicId,
            topicName: topic?.name,
            rankings: cached.rankings.slice(0, limit),
            lastUpdated: cached.lastUpdated,
        };
    }

    // Calculate fresh leaderboard
    const rankings = await calculateTopicRankings(topicId);

    // Cache it
    await cacheLeaderboard('topic', rankings, topicId);

    const topic = await Topic.findById(topicId);

    return {
        type: 'topic',
        topicId,
        topicName: topic?.name,
        rankings: rankings.slice(0, limit),
        lastUpdated: new Date(),
    };
};

/**
 * Get user's rank in global leaderboard
 */
export const getUserRank = async (userId: string, type: string = 'global', topicId?: string): Promise<LeaderboardEntry | null> => {
    let leaderboard;

    if (type === 'global') {
        leaderboard = await Leaderboard.findOne({ type: 'global' });
        if (!leaderboard) {
            // Calculate fresh
            const rankings = await calculateGlobalRankings();
            await cacheLeaderboard('global', rankings);
            leaderboard = await Leaderboard.findOne({ type: 'global' });
        }
    } else if (type === 'topic' && topicId) {
        leaderboard = await Leaderboard.findOne({ type: 'topic', topicId });
        if (!leaderboard) {
            const rankings = await calculateTopicRankings(topicId);
            await cacheLeaderboard('topic', rankings, topicId);
            leaderboard = await Leaderboard.findOne({ type: 'topic', topicId });
        }
    }

    if (!leaderboard) return null;

    const userEntry = leaderboard.rankings.find(r => r.userId === userId);
    return userEntry || null;
};

/**
 * Calculate global rankings
 */
const calculateGlobalRankings = async (): Promise<LeaderboardEntry[]> => {
    const users = await User.find().select('_id fullName gamification');

    const rankings: LeaderboardEntry[] = [];

    for (const user of users) {
        const progress = await UserProgress.find({ userId: user._id.toString() });
        const totalSolved = progress.reduce((sum, p) => sum + p.questionsSolved, 0);

        rankings.push({
            userId: user._id.toString(),
            userName: user.fullName,
            rank: 0, // Will be set after sorting
            score: user.gamification?.totalPoints || 0,
            questionsSolved: totalSolved,
            streak: user.gamification?.currentStreak || 0,
            badges: user.gamification?.badgesEarned || 0,
        });
    }

    // Sort by score (descending)
    rankings.sort((a, b) => b.score - a.score);

    // Assign ranks
    rankings.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    return rankings;
};

/**
 * Calculate topic-specific rankings
 */
const calculateTopicRankings = async (topicId: string): Promise<LeaderboardEntry[]> => {
    const progress = await UserProgress.find({ topicId }).sort({ strengthScore: -1 });

    const rankings: LeaderboardEntry[] = [];

    for (const p of progress) {
        const user = await User.findById(p.userId).select('fullName gamification');
        if (!user) continue;

        rankings.push({
            userId: p.userId,
            userName: user.fullName,
            rank: 0,
            score: p.strengthScore,
            questionsSolved: p.questionsSolved,
            streak: user.gamification?.currentStreak || 0,
            badges: user.gamification?.badgesEarned || 0,
        });
    }

    // Assign ranks
    rankings.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    return rankings;
};

/**
 * Cache leaderboard in database
 */
const cacheLeaderboard = async (type: string, rankings: LeaderboardEntry[], topicId?: string): Promise<void> => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute cache

    await Leaderboard.findOneAndUpdate(
        { type, topicId: topicId || null },
        {
            type,
            topicId,
            rankings,
            lastUpdated: new Date(),
            expiresAt,
        },
        { upsert: true, new: true }
    );
};

/**
 * Update all leaderboard caches (called by cron job)
 */
export const updateLeaderboardCache = async (): Promise<void> => {
    console.log('🔄 Updating leaderboard cache...');

    // Update global leaderboard
    const globalRankings = await calculateGlobalRankings();
    await cacheLeaderboard('global', globalRankings);

    // Update topic leaderboards
    const topics = await Topic.find().select('_id');
    for (const topic of topics) {
        const topicRankings = await calculateTopicRankings(topic._id.toString());
        await cacheLeaderboard('topic', topicRankings, topic._id.toString());
    }

    console.log('✅ Leaderboard cache updated');
};
