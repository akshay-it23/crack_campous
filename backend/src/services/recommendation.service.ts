/**
 * Recommendation Service
 * 
 * AI-powered recommendation engine that analyzes user progress and practice patterns
 * to generate personalized study recommendations
 */

import Recommendation, { IRecommendedTopic, IStudyPlanItem } from '../models/Recommendation';
import { UserProgress } from '../models/UserProgress';
import { PracticeLog } from '../models/PracticeLog';
import { Topic } from '../models/Topic';
import mongoose from 'mongoose';

export class RecommendationService {
    /**
     * Generate personalized recommendations for a user
     */
    static async generateRecommendations(userId: string) {
        // Deactivate old recommendations
        await Recommendation.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), isActive: true },
            { isActive: false }
        );

        // Get user progress data
        const userProgress = await UserProgress.findOne({ userId }).populate('topicProgress.topicId');
        if (!userProgress) {
            throw new Error('User progress not found');
        }

        // Get practice history (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const practiceHistory = await PracticeLog.find({
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: thirtyDaysAgo },
        }).populate('topicId');

        // Analyze weak areas
        const weakAreas = this.identifyWeakAreas(userProgress);

        // Analyze practice patterns
        const practicePatterns = this.analyzePracticePatterns(practiceHistory);

        // Generate topic recommendations
        const recommendedTopics = await this.generateTopicRecommendations(
            userProgress,
            weakAreas,
            practicePatterns
        );

        // Generate study plan
        const studyPlan = this.generateStudyPlan(recommendedTopics, practicePatterns);

        // Calculate confidence score
        const confidenceScore = this.calculateConfidenceScore(practiceHistory.length, weakAreas.length);

        // Create recommendation document
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        const recommendation = await Recommendation.create({
            userId: new mongoose.Types.ObjectId(userId),
            recommendedTopics,
            studyPlan,
            weakAreaFocus: weakAreas,
            confidenceScore,
            generatedAt: new Date(),
            expiresAt,
            isActive: true,
        });

        return recommendation;
    }

    /**
     * Get active recommendations for a user
     */
    static async getRecommendations(userId: string) {
        let recommendation = await Recommendation.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            isActive: true,
            expiresAt: { $gt: new Date() },
        });

        // Generate new recommendations if none exist or expired
        if (!recommendation) {
            recommendation = await this.generateRecommendations(userId);
        }

        return recommendation;
    }

    /**
     * Identify weak areas based on accuracy and consistency
     */
    private static identifyWeakAreas(userProgress: any) {
        const weakAreas: any[] = [];
        const WEAK_THRESHOLD = 60; // Topics with <60% accuracy are weak

        userProgress.topicProgress.forEach((tp: any) => {
            if (tp.accuracy < WEAK_THRESHOLD) {
                const targetAccuracy = 75; // Target 75% accuracy
                const suggestedPracticeCount = Math.ceil((targetAccuracy - tp.accuracy) / 5) * 10;

                weakAreas.push({
                    topicId: tp.topicId._id,
                    topicName: tp.topicId.name,
                    currentAccuracy: tp.accuracy,
                    targetAccuracy,
                    suggestedPracticeCount,
                });
            }
        });

        // Sort by lowest accuracy first
        weakAreas.sort((a, b) => a.currentAccuracy - b.currentAccuracy);

        return weakAreas.slice(0, 5); // Return top 5 weak areas
    }

    /**
     * Analyze practice patterns to understand user behavior
     */
    private static analyzePracticePatterns(practiceHistory: any[]) {
        if (practiceHistory.length === 0) {
            return {
                averageSessionDuration: 30,
                preferredDifficulty: 'medium',
                mostActiveHour: 18,
                practiceFrequency: 0,
            };
        }

        // Calculate average session duration
        const totalDuration = practiceHistory.reduce((sum, log) => sum + (log.timeSpent || 0), 0);
        const averageSessionDuration = Math.round(totalDuration / practiceHistory.length);

        // Find preferred difficulty
        const difficultyCount: any = { easy: 0, medium: 0, hard: 0 };
        practiceHistory.forEach((log) => {
            if (log.difficulty) {
                difficultyCount[log.difficulty]++;
            }
        });
        const preferredDifficulty = Object.keys(difficultyCount).reduce((a, b) =>
            difficultyCount[a] > difficultyCount[b] ? a : b
        );

        // Calculate practice frequency (sessions per week)
        const practiceFrequency = (practiceHistory.length / 30) * 7;

        return {
            averageSessionDuration,
            preferredDifficulty,
            mostActiveHour: 18, // Default to 6 PM
            practiceFrequency: Math.round(practiceFrequency * 10) / 10,
        };
    }

    /**
     * Generate topic recommendations based on weak areas and patterns
     */
    private static async generateTopicRecommendations(
        userProgress: any,
        weakAreas: any[],
        practicePatterns: any
    ): Promise<IRecommendedTopic[]> {
        const recommendations: IRecommendedTopic[] = [];

        // Recommend weak areas first (high priority)
        for (const weak of weakAreas.slice(0, 3)) {
            recommendations.push({
                topicId: weak.topicId,
                topicName: weak.topicName,
                reason: `Low accuracy (${weak.currentAccuracy}%). Focus here to improve fundamentals.`,
                priority: 'high',
                estimatedTime: practicePatterns.averageSessionDuration,
            });
        }

        // Recommend topics with low consistency (medium priority)
        const inconsistentTopics = userProgress.topicProgress.filter(
            (tp: any) => tp.consistency < 50 && tp.accuracy >= 60
        );

        for (const topic of inconsistentTopics.slice(0, 2)) {
            recommendations.push({
                topicId: topic.topicId._id,
                topicName: topic.topicId.name,
                reason: `Inconsistent performance. Practice regularly to build consistency.`,
                priority: 'medium',
                estimatedTime: practicePatterns.averageSessionDuration,
            });
        }

        // Recommend new topics (low priority)
        const practicedTopicIds = userProgress.topicProgress.map((tp: any) => tp.topicId._id.toString());
        const allTopics = await Topic.find({});
        const newTopics = allTopics.filter((t) => !practicedTopicIds.includes(t._id.toString()));

        if (newTopics.length > 0) {
            const randomNewTopic = newTopics[Math.floor(Math.random() * newTopics.length)];
            recommendations.push({
                topicId: randomNewTopic._id,
                topicName: randomNewTopic.name,
                reason: 'Expand your knowledge by exploring new topics.',
                priority: 'low',
                estimatedTime: practicePatterns.averageSessionDuration,
            });
        }

        return recommendations;
    }

    /**
     * Generate a 7-day study plan
     */
    private static generateStudyPlan(
        recommendedTopics: IRecommendedTopic[],
        practicePatterns: any
    ): IStudyPlanItem[] {
        const studyPlan: IStudyPlanItem[] = [];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Distribute topics across the week
        const highPriority = recommendedTopics.filter((t) => t.priority === 'high');
        const mediumPriority = recommendedTopics.filter((t) => t.priority === 'medium');
        const lowPriority = recommendedTopics.filter((t) => t.priority === 'low');

        days.forEach((day, index) => {
            const topics: mongoose.Types.ObjectId[] = [];
            let focus = '';

            if (index < 3 && highPriority.length > 0) {
                // First 3 days: focus on weak areas
                topics.push(highPriority[index % highPriority.length].topicId);
                focus = 'Weak areas';
            } else if (index < 5 && mediumPriority.length > 0) {
                // Next 2 days: consistency building
                topics.push(mediumPriority[(index - 3) % mediumPriority.length].topicId);
                focus = 'Consistency building';
            } else if (lowPriority.length > 0) {
                // Weekend: explore new topics
                topics.push(lowPriority[0].topicId);
                focus = 'New topics';
            }

            if (topics.length > 0) {
                studyPlan.push({
                    day,
                    topics,
                    duration: practicePatterns.averageSessionDuration,
                    focus,
                });
            }
        });

        return studyPlan;
    }

    /**
     * Calculate confidence score based on data availability
     */
    private static calculateConfidenceScore(practiceCount: number, weakAreasCount: number): number {
        let score = 50; // Base score

        // More practice data = higher confidence
        if (practiceCount > 50) score += 30;
        else if (practiceCount > 20) score += 20;
        else if (practiceCount > 10) score += 10;

        // Clear weak areas = higher confidence
        if (weakAreasCount > 0) score += 20;

        return Math.min(score, 100);
    }
}
