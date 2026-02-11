/**
 * Practice-related TypeScript Types
 * 
 * Defines interfaces for practice tracking system.
 * Separated from auth types for better organization.
 */

import { Document } from 'mongoose';

/**
 * Topic Document Interface
 */
export interface ITopic extends Document {
    _id: string;
    name: string;
    category: string;
    difficulty: string;
    recommendedQuestions: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * PracticeLog Document Interface
 */
export interface IPracticeLog extends Document {
    _id: string;
    userId: string;
    topicId: string;
    questionTitle: string;
    questionUrl?: string;
    difficulty: string;
    timeSpentMinutes: number;
    solved: boolean;
    notes?: string;
    practicedAt: Date;
    createdAt: Date;
}

/**
 * DTOs (Data Transfer Objects)
 */

export interface LogPracticeDTO {
    topicId: string;
    questionTitle: string;
    questionUrl?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeSpentMinutes: number;
    solved: boolean;
    notes?: string;
    practicedAt?: Date; // Optional: defaults to now
}

export interface GetPracticeHistoryQuery {
    topicId?: string;
    limit?: number;
    skip?: number;
}

/**
 * Response Types
 */

export interface TopicResponse {
    _id: string;
    name: string;
    category: string;
    difficulty: string;
    recommendedQuestions: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TopicsByCategory {
    [category: string]: TopicResponse[];
}

export interface PracticeLogResponse {
    _id: string;
    userId: string;
    topicId: string;
    topicName?: string; // Populated from Topic
    questionTitle: string;
    questionUrl?: string;
    difficulty: string;
    timeSpentMinutes: number;
    solved: boolean;
    notes?: string;
    practicedAt: Date;
    createdAt: Date;
}

export interface PracticeStatsResponse {
    topicId: string;
    topicName: string;
    totalQuestions: number;
    questionsSolved: number;
    questionsAttempted: number;
    totalTimeMinutes: number;
    averageTimePerQuestion: number;
    accuracyPercentage: number;
    lastPracticedAt?: Date;
    difficultyBreakdown: {
        Easy: { attempted: number; solved: number };
        Medium: { attempted: number; solved: number };
        Hard: { attempted: number; solved: number };
    };
}

export interface OverallStatsResponse {
    totalTopics: number;
    topicsStarted: number;
    totalQuestions: number;
    questionsSolved: number;
    totalTimeMinutes: number;
    overallAccuracy: number;
    topicStats: PracticeStatsResponse[];
}
