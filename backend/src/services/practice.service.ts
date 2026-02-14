/**
 * Practice Service - Business Logic Layer
 * 
 * Handles all practice tracking operations:
 * - Logging practice sessions
 * - Fetching practice history
 * - Calculating statistics
 * - Managing topics
 */

import { Topic } from '../models/Topic';
import { PracticeLog } from '../models/PracticeLog';
import {
    LogPracticeDTO,
    GetPracticeHistoryQuery,
    TopicResponse,
    TopicsByCategory,
    PracticeLogResponse,
    PracticeStatsResponse,
    OverallStatsResponse,
} from '../types/practice.types';

/**
 * Get all topics grouped by category
 * 
 * @returns Topics organized by category
 */
export const getAllTopics = async (): Promise<TopicsByCategory> => {
    const topics = await Topic.find().sort({ category: 1, difficulty: 1, name: 1 });

    // Group by category
    const grouped: TopicsByCategory = {};

    topics.forEach((topic) => {
        if (!grouped[topic.category]) {
            grouped[topic.category] = [];
        }

        grouped[topic.category].push({
            _id: topic._id.toString(),
            name: topic.name,
            category: topic.category,
            difficulty: topic.difficulty,
            recommendedQuestions: topic.recommendedQuestions,
            description: topic.description,
            createdAt: topic.createdAt,
            updatedAt: topic.updatedAt,
        });
    });

    return grouped;
};

/**
 * Get topic by ID
 * 
 * @param topicId - Topic's MongoDB _id
 * @returns Topic details
 * @throws Error if topic not found
 */
export const getTopicById = async (topicId: string): Promise<TopicResponse> => {
    const topic = await Topic.findById(topicId);

    if (!topic) {
        throw new Error('Topic not found');
    }

    return {
        _id: topic._id.toString(),
        name: topic.name,
        category: topic.category,
        difficulty: topic.difficulty,
        recommendedQuestions: topic.recommendedQuestions,
        description: topic.description,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
    };
};

/**
 * Log a practice session
 * 
 * @param userId - User's MongoDB _id
 * @param data - Practice session data
 * @returns Created practice log
 * @throws Error if topic not found
 */
export const logPractice = async (
    userId: string,
    data: LogPracticeDTO
): Promise<PracticeLogResponse> => {
    // Verify topic exists
    const topic = await Topic.findById(data.topicId);
    if (!topic) {
        throw new Error('Topic not found');
    }

    // Create practice log
    const practiceLog = new PracticeLog({
        userId,
        topicId: data.topicId,
        questionTitle: data.questionTitle,
        questionUrl: data.questionUrl,
        difficulty: data.difficulty,
        timeSpentMinutes: data.timeSpentMinutes,
        solved: data.solved,
        notes: data.notes,
        practicedAt: data.practicedAt || new Date(),
    });

    await practiceLog.save();

    // ===== GAMIFICATION INTEGRATION =====
    // Import gamification services dynamically to avoid circular dependencies
    const badgeService = await import('./badge.service');
    const challengeService = await import('./challenge.service');
    const { User } = await import('../models/User');

    // 1. Update user streak
    await updateUserStreak(userId);

    // 2. Award points based on difficulty
    const pointsMap = { Easy: 10, Medium: 20, Hard: 30 };
    const points = data.solved ? pointsMap[data.difficulty] : 0;

    if (points > 0) {
        await User.findByIdAndUpdate(userId, {
            $inc: { 'gamification.totalPoints': points },
        });

        // Recalculate level
        const user = await User.findById(userId);
        if (user) {
            const newLevel = Math.floor((user.gamification?.totalPoints || 0) / 100) + 1;
            await User.findByIdAndUpdate(userId, {
                $set: { 'gamification.level': newLevel },
            });
        }
    }

    // 3. Check and award badges
    await badgeService.checkAndAwardBadges(userId);

    // 4. Update daily challenge progress
    await challengeService.updateChallengeProgress(userId, data.topicId, data.difficulty, data.solved);

    return {
        _id: practiceLog._id.toString(),
        userId: practiceLog.userId,
        topicId: practiceLog.topicId,
        topicName: topic.name,
        questionTitle: practiceLog.questionTitle,
        questionUrl: practiceLog.questionUrl,
        difficulty: practiceLog.difficulty,
        timeSpentMinutes: practiceLog.timeSpentMinutes,
        solved: practiceLog.solved,
        notes: practiceLog.notes,
        practicedAt: practiceLog.practicedAt,
        createdAt: practiceLog.createdAt,
    };
};

/**
 * Update user's practice streak
 */
const updateUserStreak = async (userId: string): Promise<void> => {
    const { User } = await import('../models/User');
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastPractice = user.gamification?.lastPracticeDate;

    if (!lastPractice) {
        // First practice ever
        await User.findByIdAndUpdate(userId, {
            $set: {
                'gamification.currentStreak': 1,
                'gamification.longestStreak': 1,
                'gamification.lastPracticeDate': today,
            },
        });
        return;
    }

    const lastPracticeDate = new Date(lastPractice);
    lastPracticeDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        // Already practiced today, no change
        return;
    } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        const newStreak = (user.gamification?.currentStreak || 0) + 1;
        const longestStreak = Math.max(newStreak, user.gamification?.longestStreak || 0);

        await User.findByIdAndUpdate(userId, {
            $set: {
                'gamification.currentStreak': newStreak,
                'gamification.longestStreak': longestStreak,
                'gamification.lastPracticeDate': today,
            },
        });
    } else {
        // Streak broken, reset to 1
        await User.findByIdAndUpdate(userId, {
            $set: {
                'gamification.currentStreak': 1,
                'gamification.lastPracticeDate': today,
            },
        });
    }
};

/**
 * Get practice history for a user
 * 
 * @param userId - User's MongoDB _id
 * @param query - Filter and pagination options
 * @returns Array of practice logs
 */
export const getPracticeHistory = async (
    userId: string,
    query: GetPracticeHistoryQuery
): Promise<PracticeLogResponse[]> => {
    const { topicId, limit = 20, skip = 0 } = query;

    // Build filter
    const filter: any = { userId };
    if (topicId) {
        filter.topicId = topicId;
    }

    // Fetch logs
    const logs = await PracticeLog.find(filter)
        .sort({ practicedAt: -1 }) // Newest first
        .limit(limit)
        .skip(skip);

    // Get topic names for each log
    const topicIds = [...new Set(logs.map((log) => log.topicId))];
    const topics = await Topic.find({ _id: { $in: topicIds } });
    const topicMap = new Map(topics.map((t) => [t._id.toString(), t.name]));

    return logs.map((log) => ({
        _id: log._id.toString(),
        userId: log.userId,
        topicId: log.topicId,
        topicName: topicMap.get(log.topicId),
        questionTitle: log.questionTitle,
        questionUrl: log.questionUrl,
        difficulty: log.difficulty,
        timeSpentMinutes: log.timeSpentMinutes,
        solved: log.solved,
        notes: log.notes,
        practicedAt: log.practicedAt,
        createdAt: log.createdAt,
    }));
};

/**
 * Get practice statistics for a user
 * 
 * @param userId - User's MongoDB _id
 * @param topicId - Optional: filter by topic
 * @returns Statistics
 */
export const getPracticeStats = async (
    userId: string,
    topicId?: string
): Promise<PracticeStatsResponse | OverallStatsResponse> => {
    if (topicId) {
        // Stats for specific topic
        return await getTopicStats(userId, topicId);
    } else {
        // Overall stats across all topics
        return await getOverallStats(userId);
    }
};

/**
 * Get statistics for a specific topic
 */
const getTopicStats = async (
    userId: string,
    topicId: string
): Promise<PracticeStatsResponse> => {
    // Verify topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Topic not found');
    }

    // Fetch all logs for this topic
    const logs = await PracticeLog.find({ userId, topicId });

    if (logs.length === 0) {
        // No practice yet
        return {
            topicId,
            topicName: topic.name,
            totalQuestions: 0,
            questionsSolved: 0,
            questionsAttempted: 0,
            totalTimeMinutes: 0,
            averageTimePerQuestion: 0,
            accuracyPercentage: 0,
            difficultyBreakdown: {
                Easy: { attempted: 0, solved: 0 },
                Medium: { attempted: 0, solved: 0 },
                Hard: { attempted: 0, solved: 0 },
            },
        };
    }

    // Calculate stats
    const totalQuestions = logs.length;
    const questionsSolved = logs.filter((log) => log.solved).length;
    const totalTimeMinutes = logs.reduce((sum, log) => sum + log.timeSpentMinutes, 0);
    const averageTimePerQuestion = Math.round(totalTimeMinutes / totalQuestions);
    const accuracyPercentage = Math.round((questionsSolved / totalQuestions) * 100);

    // Difficulty breakdown
    const difficultyBreakdown = {
        Easy: { attempted: 0, solved: 0 },
        Medium: { attempted: 0, solved: 0 },
        Hard: { attempted: 0, solved: 0 },
    };

    logs.forEach((log) => {
        const diff = log.difficulty as 'Easy' | 'Medium' | 'Hard';
        difficultyBreakdown[diff].attempted++;
        if (log.solved) {
            difficultyBreakdown[diff].solved++;
        }
    });

    // Last practiced date
    const lastPracticedAt = logs.reduce((latest, log) => {
        return log.practicedAt > latest ? log.practicedAt : latest;
    }, logs[0].practicedAt);

    return {
        topicId,
        topicName: topic.name,
        totalQuestions,
        questionsSolved,
        questionsAttempted: totalQuestions,
        totalTimeMinutes,
        averageTimePerQuestion,
        accuracyPercentage,
        lastPracticedAt,
        difficultyBreakdown,
    };
};

/**
 * Get overall statistics across all topics
 */
const getOverallStats = async (userId: string): Promise<OverallStatsResponse> => {
    // Fetch all logs for user
    const logs = await PracticeLog.find({ userId });

    // Get unique topic IDs
    const topicIds = [...new Set(logs.map((log) => log.topicId))];

    // Fetch all topics
    const allTopics = await Topic.find();

    // Calculate overall stats
    const totalQuestions = logs.length;
    const questionsSolved = logs.filter((log) => log.solved).length;
    const totalTimeMinutes = logs.reduce((sum, log) => sum + log.timeSpentMinutes, 0);
    const overallAccuracy = totalQuestions > 0
        ? Math.round((questionsSolved / totalQuestions) * 100)
        : 0;

    // Get stats for each topic
    const topicStatsPromises = topicIds.map((topicId) => getTopicStats(userId, topicId));
    const topicStats = await Promise.all(topicStatsPromises);

    return {
        totalTopics: allTopics.length,
        topicsStarted: topicIds.length,
        totalQuestions,
        questionsSolved,
        totalTimeMinutes,
        overallAccuracy,
        topicStats,
    };
};
