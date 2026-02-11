/**
 * Progress Types
 * 
 * TypeScript interfaces for progress-related data structures.
 * These define the shape of data returned by the progress API.
 */

import { Document } from 'mongoose';

/**
 * UserProgress Document Interface
 * (Re-exported from model for convenience)
 */
export interface IUserProgress extends Document {
    userId: string;
    topicId: string;
    totalQuestionsAttempted: number;
    questionsSolved: number;
    accuracyPercentage: number;
    totalTimeMinutes: number;
    avgTimePerQuestion: number;
    recommendedQuestions: number;
    completionPercentage: number;
    strengthScore: number;
    consistencyScore: number;
    difficultyBreakdown: {
        easy: { attempted: number; solved: number };
        medium: { attempted: number; solved: number };
        hard: { attempted: number; solved: number };
    };
    lastPracticedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Topic Progress Response
 * 
 * Returned when querying progress for a specific topic.
 * Includes topic metadata + progress metrics.
 */
export interface TopicProgressResponse {
    topicId: string;
    topicName: string;
    category: string;
    difficulty: string;

    // Progress metrics
    strengthScore: number;
    accuracyPercentage: number;
    completionPercentage: number;
    consistencyScore: number;

    // Question stats
    totalQuestionsAttempted: number;
    questionsSolved: number;
    recommendedQuestions: number;

    // Time stats
    totalTimeMinutes: number;
    avgTimePerQuestion: number;

    // Difficulty breakdown
    difficultyBreakdown: {
        easy: { attempted: number; solved: number };
        medium: { attempted: number; solved: number };
        hard: { attempted: number; solved: number };
    };

    // Tracking
    lastPracticedAt?: Date;
    updatedAt: Date;
}

/**
 * Progress Overview Response
 * 
 * Returned when querying overall progress across all topics.
 * Provides high-level summary + per-topic breakdown.
 */
export interface ProgressOverviewResponse {
    // Overall stats
    totalTopics: number;               // Total topics in database
    topicsStarted: number;             // Topics user has practiced
    topicsNotStarted: number;          // Topics user hasn't touched

    // Aggregate metrics
    averageStrengthScore: number;      // Average across all started topics
    totalQuestionsAttempted: number;   // Sum across all topics
    totalQuestionsSolved: number;      // Sum across all topics
    overallAccuracyPercentage: number; // Overall accuracy
    totalTimeMinutes: number;          // Total time spent

    // Per-topic breakdown
    topicProgress: TopicProgressResponse[];
}

/**
 * Strengths and Weaknesses Response
 * 
 * Identifies top 5 strong topics and bottom 5 weak topics.
 */
export interface StrengthsWeaknessesResponse {
    strengths: TopicProgressResponse[];   // Top 5 by strength score
    weaknesses: TopicProgressResponse[];  // Bottom 5 by strength score
}

/**
 * Recalculate Progress Request
 * 
 * Optional: Specify which topics to recalculate.
 * If empty, recalculates all topics.
 */
export interface RecalculateProgressRequest {
    topicIds?: string[];  // Optional: specific topics to recalculate
}

/**
 * Recalculate Progress Response
 */
export interface RecalculateProgressResponse {
    message: string;
    topicsRecalculated: number;
    updatedAt: Date;
}
