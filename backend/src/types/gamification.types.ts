/**
 * Gamification TypeScript Types
 * 
 * Defines interfaces for badges, leaderboards, challenges, and social sharing.
 */

import { Document } from 'mongoose';

/**
 * Badge Document Interface
 */
export interface IBadge extends Document {
    badgeId: string;
    name: string;
    description: string;
    category: 'consistency' | 'milestone' | 'mastery' | 'special';
    criteria: {
        type: 'solve_count' | 'streak_days' | 'topic_mastery' | 'time_based' | 'accuracy';
        value: number;
        topicId?: string;
    };
    iconUrl: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    createdAt: Date;
}

/**
 * UserBadge Document Interface
 */
export interface IUserBadge extends Document {
    userId: string;
    badgeId: string;
    earnedAt: Date;
    progress: number;
}

/**
 * DailyChallenge Document Interface
 */
export interface IDailyChallenge extends Document {
    userId: string;
    date: Date;
    challenges: Array<{
        topicId: string;
        topicName?: string;
        targetQuestions: number;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        completed: boolean;
        questionsCompleted: number;
    }>;
    overallCompleted: boolean;
    completedAt?: Date;
    rewardPoints: number;
}

/**
 * Leaderboard Document Interface
 */
export interface ILeaderboard extends Document {
    type: 'global' | 'topic';
    topicId?: string;
    rankings: Array<{
        userId: string;
        userName: string;
        rank: number;
        score: number;
        questionsSolved: number;
        streak: number;
        badges: number;
    }>;
    lastUpdated: Date;
    expiresAt: Date;
}

/**
 * Response Types
 */

export interface BadgeResponse {
    _id: string;
    badgeId: string;
    name: string;
    description: string;
    category: string;
    criteria: {
        type: string;
        value: number;
        topicId?: string;
    };
    iconUrl: string;
    rarity: string;
    points: number;
    earned?: boolean;
    earnedAt?: Date;
    progress?: number;
}

export interface UserBadgeResponse {
    _id: string;
    badgeId: string;
    badge: BadgeResponse;
    earnedAt: Date;
    progress: number;
}

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    rank: number;
    score: number;
    questionsSolved: number;
    streak: number;
    badges: number;
}

export interface LeaderboardResponse {
    type: string;
    topicId?: string;
    topicName?: string;
    rankings: LeaderboardEntry[];
    userRank?: LeaderboardEntry;
    lastUpdated: Date;
}

export interface DailyChallengeResponse {
    _id: string;
    date: Date;
    challenges: Array<{
        topicId: string;
        topicName?: string;
        targetQuestions: number;
        difficulty: string;
        completed: boolean;
        questionsCompleted: number;
    }>;
    overallCompleted: boolean;
    completedAt?: Date;
    rewardPoints: number;
}

export interface ShareStatsResponse {
    userName: string;
    totalQuestions: number;
    questionsSolved: number;
    currentStreak: number;
    longestStreak: number;
    badgesEarned: number;
    level: number;
    totalPoints: number;
}

/**
 * DTOs (Data Transfer Objects)
 */

export interface CompleteChallengeDTO {
    date?: Date;
}

export interface GetLeaderboardQuery {
    limit?: number;
    skip?: number;
    topicId?: string;
}
