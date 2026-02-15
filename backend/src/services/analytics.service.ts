/**
 * Analytics Service
 * 
 * Provides comprehensive analytics for admin dashboard
 */

import { User } from '../models/User';
import { PracticeLog } from '../models/PracticeLog';
import { Topic } from '../models/Topic';
import { UserProgress } from '../models/UserProgress';

/**
 * Get User Analytics
 */
export const getUserAnalytics = async (startDate?: Date, endDate?: Date) => {
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    // Total users
    const totalUsers = await User.countDocuments();

    // New registrations in period
    const newUsers = await User.countDocuments({
        createdAt: dateFilter,
    });

    // Active users (users who practiced in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUserIds = await PracticeLog.distinct('userId', {
        createdAt: { $gte: sevenDaysAgo },
    });

    const activeUsers = activeUserIds.length;

    // Users by graduation year
    const usersByYear = await User.aggregate([
        {
            $group: {
                _id: '$graduationYear',
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return {
        totalUsers,
        newUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        usersByGraduationYear: usersByYear,
    };
};

/**
 * Get Practice Analytics
 */
export const getPracticeAnalytics = async (startDate?: Date, endDate?: Date) => {
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    // Total practice sessions
    const totalPractices = await PracticeLog.countDocuments({
        createdAt: dateFilter,
    });

    // Average questions per session
    const avgQuestionsResult = await PracticeLog.aggregate([
        { $match: { createdAt: dateFilter } },
        {
            $group: {
                _id: null,
                avgQuestions: { $avg: '$questionsAttempted' },
                avgCorrect: { $avg: '$questionsCorrect' },
            },
        },
    ]);

    const avgQuestions = avgQuestionsResult[0]?.avgQuestions || 0;
    const avgCorrect = avgQuestionsResult[0]?.avgCorrect || 0;
    const avgAccuracy = avgQuestions > 0 ? (avgCorrect / avgQuestions) * 100 : 0;

    // Most practiced topics
    const topTopics = await PracticeLog.aggregate([
        { $match: { createdAt: dateFilter } },
        {
            $group: {
                _id: '$topicId',
                practiceCount: { $sum: 1 },
                totalQuestions: { $sum: '$questionsAttempted' },
            },
        },
        { $sort: { practiceCount: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'topics',
                localField: '_id',
                foreignField: '_id',
                as: 'topic',
            },
        },
        { $unwind: '$topic' },
        {
            $project: {
                topicName: '$topic.name',
                category: '$topic.category',
                practiceCount: 1,
                totalQuestions: 1,
            },
        },
    ]);

    // Practice distribution by difficulty
    const practiceByDifficulty = await PracticeLog.aggregate([
        { $match: { createdAt: dateFilter } },
        {
            $lookup: {
                from: 'topics',
                localField: 'topicId',
                foreignField: '_id',
                as: 'topic',
            },
        },
        { $unwind: '$topic' },
        {
            $group: {
                _id: '$topic.difficulty',
                count: { $sum: 1 },
            },
        },
    ]);

    return {
        totalPractices,
        avgQuestionsPerSession: Math.round(avgQuestions * 10) / 10,
        avgCorrectPerSession: Math.round(avgCorrect * 10) / 10,
        avgAccuracy: Math.round(avgAccuracy * 10) / 10,
        topTopics,
        practiceByDifficulty,
    };
};

/**
 * Get Engagement Metrics
 */
export const getEngagementMetrics = async () => {
    const now = new Date();

    // Daily Active Users (last 24 hours)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dauIds = await PracticeLog.distinct('userId', {
        createdAt: { $gte: oneDayAgo },
    });
    const dau = dauIds.length;

    // Weekly Active Users (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const wauIds = await PracticeLog.distinct('userId', {
        createdAt: { $gte: sevenDaysAgo },
    });
    const wau = wauIds.length;

    // Monthly Active Users (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const mauIds = await PracticeLog.distinct('userId', {
        createdAt: { $gte: thirtyDaysAgo },
    });
    const mau = mauIds.length;

    // Average session duration (in minutes)
    const avgSessionResult = await PracticeLog.aggregate([
        {
            $group: {
                _id: null,
                avgDuration: { $avg: '$duration' },
            },
        },
    ]);

    const avgSessionDuration = avgSessionResult[0]?.avgDuration || 0;

    // Retention rate (users who practiced in last 7 days vs total users)
    const totalUsers = await User.countDocuments();
    const retentionRate = totalUsers > 0 ? (wau / totalUsers) * 100 : 0;

    return {
        dau,
        wau,
        mau,
        avgSessionDuration: Math.round(avgSessionDuration),
        retentionRate: Math.round(retentionRate * 10) / 10,
    };
};

/**
 * Get Performance Metrics
 */
export const getPerformanceMetrics = async () => {
    // Overall average score
    const avgScoreResult = await UserProgress.aggregate([
        {
            $group: {
                _id: null,
                avgScore: { $avg: '$currentScore' },
                avgMastery: { $avg: '$masteryLevel' },
            },
        },
    ]);

    const avgScore = avgScoreResult[0]?.avgScore || 0;
    const avgMastery = avgScoreResult[0]?.avgMastery || 0;

    // Users by mastery level
    const usersByMastery = await UserProgress.aggregate([
        {
            $bucket: {
                groupBy: '$masteryLevel',
                boundaries: [0, 25, 50, 75, 100],
                default: 'Other',
                output: {
                    count: { $sum: 1 },
                },
            },
        },
    ]);

    // Topic completion rates
    const topicCompletion = await UserProgress.aggregate([
        {
            $lookup: {
                from: 'topics',
                localField: 'topicId',
                foreignField: '_id',
                as: 'topic',
            },
        },
        { $unwind: '$topic' },
        {
            $group: {
                _id: '$topicId',
                topicName: { $first: '$topic.name' },
                avgMastery: { $avg: '$masteryLevel' },
                userCount: { $sum: 1 },
            },
        },
        { $sort: { avgMastery: -1 } },
        { $limit: 10 },
    ]);

    return {
        avgScore: Math.round(avgScore * 10) / 10,
        avgMastery: Math.round(avgMastery * 10) / 10,
        usersByMastery,
        topTopicsByCompletion: topicCompletion,
    };
};

/**
 * Export analytics data
 */
export const exportAnalyticsData = async () => {
    const userAnalytics = await getUserAnalytics();
    const practiceAnalytics = await getPracticeAnalytics();
    const engagementMetrics = await getEngagementMetrics();
    const performanceMetrics = await getPerformanceMetrics();

    return {
        generatedAt: new Date(),
        users: userAnalytics,
        practice: practiceAnalytics,
        engagement: engagementMetrics,
        performance: performanceMetrics,
    };
};
