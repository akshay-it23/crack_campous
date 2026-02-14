/**
 * Challenge Service - Business Logic for Daily Challenges
 * 
 * Handles challenge generation, progress tracking, and completion.
 */

import { DailyChallenge } from '../models/DailyChallenge';
import { UserProgress } from '../models/UserProgress';
import { Topic } from '../models/Topic';
import { User } from '../models/User';
import { PracticeLog } from '../models/PracticeLog';
import { DailyChallengeResponse } from '../types/gamification.types';

/**
 * Generate daily challenges for a user
 * Called by cron job at midnight
 */
export const generateDailyChallenges = async (userId: string): Promise<void> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if challenge already exists for today
    const existing = await DailyChallenge.findOne({ userId, date: today });
    if (existing) return;

    // Find user's weak topics (lowest strength scores)
    const weakTopics = await UserProgress.find({ userId })
        .sort({ strengthScore: 1 })
        .limit(3);

    // If user has no progress, pick random topics
    let selectedTopics;
    if (weakTopics.length === 0) {
        selectedTopics = await Topic.find().limit(3);
    } else {
        selectedTopics = await Promise.all(
            weakTopics.map(wp => Topic.findById(wp.topicId))
        );
    }

    // Create challenges: 1 Easy, 1 Medium, 1 Hard
    const difficulties: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
    const challenges = selectedTopics.slice(0, 3).map((topic, index) => ({
        topicId: topic!._id.toString(),
        topicName: topic!.name,
        targetQuestions: 3,
        difficulty: difficulties[index],
        completed: false,
        questionsCompleted: 0,
    }));

    // Create daily challenge
    await DailyChallenge.create({
        userId,
        date: today,
        challenges,
        overallCompleted: false,
        rewardPoints: 50,
    });
};

/**
 * Get today's challenge for user
 */
export const getTodayChallenge = async (userId: string): Promise<DailyChallengeResponse | null> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await DailyChallenge.findOne({ userId, date: today });

    if (!challenge) {
        // Generate challenge if doesn't exist
        await generateDailyChallenges(userId);
        const newChallenge = await DailyChallenge.findOne({ userId, date: today });

        if (!newChallenge) return null;

        return {
            _id: newChallenge._id.toString(),
            date: newChallenge.date,
            challenges: newChallenge.challenges,
            overallCompleted: newChallenge.overallCompleted,
            completedAt: newChallenge.completedAt,
            rewardPoints: newChallenge.rewardPoints,
        };
    }

    return {
        _id: challenge._id.toString(),
        date: challenge.date,
        challenges: challenge.challenges,
        overallCompleted: challenge.overallCompleted,
        completedAt: challenge.completedAt,
        rewardPoints: challenge.rewardPoints,
    };
};

/**
 * Update challenge progress when user logs practice
 * Called after each practice log
 */
export const updateChallengeProgress = async (userId: string, topicId: string, difficulty: string, solved: boolean): Promise<void> => {
    if (!solved) return; // Only count solved questions

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenge = await DailyChallenge.findOne({ userId, date: today });
    if (!challenge) return;

    // Find matching challenge
    const matchingChallenge = challenge.challenges.find(
        c => c.topicId === topicId && c.difficulty === difficulty && !c.completed
    );

    if (!matchingChallenge) return;

    // Increment questions completed
    matchingChallenge.questionsCompleted += 1;

    // Check if challenge completed
    if (matchingChallenge.questionsCompleted >= matchingChallenge.targetQuestions) {
        matchingChallenge.completed = true;
    }

    // Check if all challenges completed
    const allCompleted = challenge.challenges.every(c => c.completed);
    if (allCompleted && !challenge.overallCompleted) {
        challenge.overallCompleted = true;
        challenge.completedAt = new Date();

        // Award reward points
        await User.findByIdAndUpdate(userId, {
            $inc: { 'gamification.totalPoints': challenge.rewardPoints },
        });
    }

    await challenge.save();
};

/**
 * Get challenge history for user
 */
export const getChallengeHistory = async (userId: string, limit: number = 7): Promise<DailyChallengeResponse[]> => {
    const challenges = await DailyChallenge.find({ userId })
        .sort({ date: -1 })
        .limit(limit);

    return challenges.map(c => ({
        _id: c._id.toString(),
        date: c.date,
        challenges: c.challenges,
        overallCompleted: c.overallCompleted,
        completedAt: c.completedAt,
        rewardPoints: c.rewardPoints,
    }));
};

/**
 * Generate challenges for all active users
 * Called by cron job at midnight
 */
export const generateChallengesForAllUsers = async (): Promise<void> => {
    console.log('🎯 Generating daily challenges for all users...');

    // Get all users who have practiced in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPracticeLogs = await PracticeLog.find({
        practicedAt: { $gte: thirtyDaysAgo }
    }).distinct('userId');

    // Generate challenges for each active user
    for (const userId of recentPracticeLogs) {
        try {
            await generateDailyChallenges(userId);
        } catch (error) {
            console.error(`Failed to generate challenge for user ${userId}:`, error);
        }
    }

    console.log(`✅ Generated challenges for ${recentPracticeLogs.length} active users`);
};
