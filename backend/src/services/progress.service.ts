/**
 * Progress Service - Business Logic Layer
 * 
 * Handles all progress calculation and retrieval operations:
 * - Calculate progress metrics from practice logs
 * - Get overall progress overview
 * - Identify strengths and weaknesses
 * - Recalculate progress on demand
 * 
 * Key Concepts:
 * - Aggregation: Combining multiple practice logs into summary stats
 * - Weighted Scoring: Combining metrics with different importance
 * - Denormalization: Storing calculated values for performance
 */

import { PracticeLog } from '../models/PracticeLog';
import { Topic } from '../models/Topic';
import { UserProgress } from '../models/UserProgress';
import {
    TopicProgressResponse,
    ProgressOverviewResponse,
    StrengthsWeaknessesResponse,
    RecalculateProgressResponse,
} from '../types/progress.types';

/**
 * Calculate and update progress for a specific topic
 * 
 * This is the CORE function - it aggregates practice logs and calculates all metrics.
 * 
 * Steps:
 * 1. Fetch all practice logs for user + topic
 * 2. Calculate basic metrics (accuracy, time, etc.)
 * 3. Calculate difficulty breakdown
 * 4. Calculate consistency score
 * 5. Calculate overall strength score
 * 6. Update or create UserProgress record
 * 
 * @param userId - User's MongoDB _id
 * @param topicId - Topic's MongoDB _id
 * @returns Updated progress record
 */
export const calculateTopicProgress = async (
    userId: string,
    topicId: string
): Promise<void> => {
    // 1. Fetch all practice logs for this user + topic
    const logs = await PracticeLog.find({ userId, topicId }).sort({ practicedAt: 1 });

    // 2. Get topic info (for recommended questions count)
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Topic not found');
    }

    // If no practice logs, delete progress record (user hasn't started)
    if (logs.length === 0) {
        await UserProgress.findOneAndDelete({ userId, topicId });
        return;
    }

    // 3. Calculate basic metrics
    const totalQuestionsAttempted = logs.length;
    const questionsSolved = logs.filter((log) => log.solved).length;
    const accuracyPercentage = Math.round((questionsSolved / totalQuestionsAttempted) * 100);

    // 4. Calculate time metrics
    const totalTimeMinutes = logs.reduce((sum, log) => sum + log.timeSpentMinutes, 0);
    const avgTimePerQuestion = Math.round(totalTimeMinutes / totalQuestionsAttempted);

    // 5. Calculate completion percentage
    const completionPercentage = Math.round(
        (totalQuestionsAttempted / topic.recommendedQuestions) * 100
    );

    // 6. Calculate difficulty breakdown
    const difficultyBreakdown = {
        easy: { attempted: 0, solved: 0 },
        medium: { attempted: 0, solved: 0 },
        hard: { attempted: 0, solved: 0 },
    };

    logs.forEach((log) => {
        const diff = log.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
        if (difficultyBreakdown[diff]) {
            difficultyBreakdown[diff].attempted++;
            if (log.solved) {
                difficultyBreakdown[diff].solved++;
            }
        }
    });

    // 7. Calculate consistency score (how regularly practiced in last 7 days)
    const consistencyScore = calculateConsistencyScore(logs);

    // 8. Calculate difficulty bonus (reward for solving harder problems)
    const difficultyBonus = calculateDifficultyBonus(difficultyBreakdown);

    // 9. Calculate overall strength score (weighted combination)
    const strengthScore = calculateStrengthScore(
        accuracyPercentage,
        completionPercentage,
        consistencyScore,
        difficultyBonus
    );

    // 10. Get last practiced date
    const lastPracticedAt = logs[logs.length - 1].practicedAt;

    // 11. Update or create UserProgress record
    await UserProgress.findOneAndUpdate(
        { userId, topicId },
        {
            userId,
            topicId,
            totalQuestionsAttempted,
            questionsSolved,
            accuracyPercentage,
            totalTimeMinutes,
            avgTimePerQuestion,
            recommendedQuestions: topic.recommendedQuestions,
            completionPercentage,
            strengthScore,
            consistencyScore,
            difficultyBreakdown,
            lastPracticedAt,
        },
        { upsert: true, new: true }
    );
};

/**
 * Calculate consistency score
 * 
 * Measures how regularly the user practices this topic.
 * Looks at last 7 days of practice.
 * 
 * Formula: (unique days with practice in last 7 days / 7) * 100
 * 
 * @param logs - Practice logs sorted by date
 * @returns Consistency score (0-100)
 */
const calculateConsistencyScore = (logs: any[]): number => {
    if (logs.length === 0) return 0;

    // Get dates from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter logs from last 7 days
    const recentLogs = logs.filter((log) => new Date(log.practicedAt) >= sevenDaysAgo);

    if (recentLogs.length === 0) return 0;

    // Count unique days
    const uniqueDays = new Set(
        recentLogs.map((log) => new Date(log.practicedAt).toDateString())
    );

    // Calculate score
    const score = (uniqueDays.size / 7) * 100;
    return Math.round(score);
};

/**
 * Calculate difficulty bonus
 * 
 * Rewards solving harder problems.
 * 
 * Formula:
 * - Easy: 1 point per solve
 * - Medium: 2 points per solve
 * - Hard: 3 points per solve
 * - Normalize to 0-100 scale
 * 
 * @param breakdown - Difficulty breakdown
 * @returns Difficulty bonus (0-100)
 */
const calculateDifficultyBonus = (breakdown: any): number => {
    const totalSolved =
        breakdown.easy.solved + breakdown.medium.solved + breakdown.hard.solved;

    if (totalSolved === 0) return 0;

    // Calculate weighted points
    const points =
        breakdown.easy.solved * 1 +
        breakdown.medium.solved * 2 +
        breakdown.hard.solved * 3;

    // Average points per question (max is 3 for all hard)
    const avgPoints = points / totalSolved;

    // Normalize to 0-100 scale
    const score = (avgPoints / 3) * 100;
    return Math.round(score);
};

/**
 * Calculate overall strength score
 * 
 * Weighted combination of all metrics:
 * - 40% Accuracy (most important - can you solve correctly?)
 * - 30% Completion (coverage matters)
 * - 20% Consistency (regular practice beats cramming)
 * - 10% Difficulty (bonus for harder problems)
 * 
 * @param accuracy - Accuracy percentage (0-100)
 * @param completion - Completion percentage (0-100)
 * @param consistency - Consistency score (0-100)
 * @param difficulty - Difficulty bonus (0-100)
 * @returns Strength score (0-100)
 */
const calculateStrengthScore = (
    accuracy: number,
    completion: number,
    consistency: number,
    difficulty: number
): number => {
    const score =
        0.4 * accuracy +
        0.3 * completion +
        0.2 * consistency +
        0.1 * difficulty;

    return Math.round(score);
};

/**
 * Get progress for a specific topic
 * 
 * @param userId - User's MongoDB _id
 * @param topicId - Topic's MongoDB _id
 * @returns Topic progress with metadata
 */
export const getTopicProgress = async (
    userId: string,
    topicId: string
): Promise<TopicProgressResponse> => {
    // Get progress record
    const progress = await UserProgress.findOne({ userId, topicId });

    // Get topic metadata
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Topic not found');
    }

    // If no progress, return empty state
    if (!progress) {
        return {
            topicId: topic._id.toString(),
            topicName: topic.name,
            category: topic.category,
            difficulty: topic.difficulty,
            strengthScore: 0,
            accuracyPercentage: 0,
            completionPercentage: 0,
            consistencyScore: 0,
            totalQuestionsAttempted: 0,
            questionsSolved: 0,
            recommendedQuestions: topic.recommendedQuestions,
            totalTimeMinutes: 0,
            avgTimePerQuestion: 0,
            difficultyBreakdown: {
                easy: { attempted: 0, solved: 0 },
                medium: { attempted: 0, solved: 0 },
                hard: { attempted: 0, solved: 0 },
            },
            updatedAt: new Date(),
        };
    }

    // Return progress with topic metadata
    return {
        topicId: topic._id.toString(),
        topicName: topic.name,
        category: topic.category,
        difficulty: topic.difficulty,
        strengthScore: progress.strengthScore,
        accuracyPercentage: progress.accuracyPercentage,
        completionPercentage: progress.completionPercentage,
        consistencyScore: progress.consistencyScore,
        totalQuestionsAttempted: progress.totalQuestionsAttempted,
        questionsSolved: progress.questionsSolved,
        recommendedQuestions: progress.recommendedQuestions,
        totalTimeMinutes: progress.totalTimeMinutes,
        avgTimePerQuestion: progress.avgTimePerQuestion,
        difficultyBreakdown: progress.difficultyBreakdown,
        lastPracticedAt: progress.lastPracticedAt,
        updatedAt: progress.updatedAt,
    };
};

/**
 * Get overall progress overview
 * 
 * Aggregates progress across all topics.
 * 
 * @param userId - User's MongoDB _id
 * @returns Progress overview
 */
export const getProgressOverview = async (
    userId: string
): Promise<ProgressOverviewResponse> => {
    // Get all topics
    const allTopics = await Topic.find();
    const totalTopics = allTopics.length;

    // Get all progress records for user
    const progressRecords = await UserProgress.find({ userId });
    const topicsStarted = progressRecords.length;
    const topicsNotStarted = totalTopics - topicsStarted;

    // Calculate aggregate metrics
    let totalQuestionsAttempted = 0;
    let totalQuestionsSolved = 0;
    let totalTimeMinutes = 0;
    let totalStrengthScore = 0;

    progressRecords.forEach((progress) => {
        totalQuestionsAttempted += progress.totalQuestionsAttempted;
        totalQuestionsSolved += progress.questionsSolved;
        totalTimeMinutes += progress.totalTimeMinutes;
        totalStrengthScore += progress.strengthScore;
    });

    const averageStrengthScore =
        topicsStarted > 0 ? Math.round(totalStrengthScore / topicsStarted) : 0;

    const overallAccuracyPercentage =
        totalQuestionsAttempted > 0
            ? Math.round((totalQuestionsSolved / totalQuestionsAttempted) * 100)
            : 0;

    // Get per-topic progress
    const topicProgressPromises = progressRecords.map(async (progress) => {
        return await getTopicProgress(userId, progress.topicId);
    });

    const topicProgress = await Promise.all(topicProgressPromises);

    // Sort by strength score (descending)
    topicProgress.sort((a, b) => b.strengthScore - a.strengthScore);

    return {
        totalTopics,
        topicsStarted,
        topicsNotStarted,
        averageStrengthScore,
        totalQuestionsAttempted,
        totalQuestionsSolved,
        overallAccuracyPercentage,
        totalTimeMinutes,
        topicProgress,
    };
};

/**
 * Get strengths and weaknesses
 * 
 * Identifies top 5 strong topics and bottom 5 weak topics.
 * 
 * @param userId - User's MongoDB _id
 * @returns Strengths and weaknesses
 */
export const getStrengthsWeaknesses = async (
    userId: string
): Promise<StrengthsWeaknessesResponse> => {
    // Get all progress records
    const progressRecords = await UserProgress.find({ userId }).sort({ strengthScore: -1 });

    if (progressRecords.length === 0) {
        return {
            strengths: [],
            weaknesses: [],
        };
    }

    // Get top 5 (strengths)
    const topRecords = progressRecords.slice(0, 5);
    const strengthsPromises = topRecords.map((progress) =>
        getTopicProgress(userId, progress.topicId)
    );
    const strengths = await Promise.all(strengthsPromises);

    // Get bottom 5 (weaknesses)
    const bottomRecords = progressRecords.slice(-5).reverse();
    const weaknessesPromises = bottomRecords.map((progress) =>
        getTopicProgress(userId, progress.topicId)
    );
    const weaknesses = await Promise.all(weaknessesPromises);

    return {
        strengths,
        weaknesses,
    };
};

/**
 * Recalculate progress for all topics or specific topics
 * 
 * @param userId - User's MongoDB _id
 * @param topicIds - Optional: specific topics to recalculate
 * @returns Recalculation result
 */
export const recalculateProgress = async (
    userId: string,
    topicIds?: string[]
): Promise<RecalculateProgressResponse> => {
    let topicsToRecalculate: string[];

    if (topicIds && topicIds.length > 0) {
        // Recalculate specific topics
        topicsToRecalculate = topicIds;
    } else {
        // Recalculate all topics user has practiced
        const progressRecords = await UserProgress.find({ userId });
        topicsToRecalculate = progressRecords.map((p) => p.topicId);
    }

    // Recalculate each topic
    for (const topicId of topicsToRecalculate) {
        await calculateTopicProgress(userId, topicId);
    }

    return {
        message: 'Progress recalculated successfully',
        topicsRecalculated: topicsToRecalculate.length,
        updatedAt: new Date(),
    };
};
