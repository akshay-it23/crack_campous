/**
 * TypeScript Type Definitions
 */

// User Types
export interface User {
    _id: string;
    email: string;
    fullName: string;
    college?: string;
    graduationYear?: number;
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    fullName: string;
    college?: string;
    graduationYear?: number;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

// Topic Types
export interface Topic {
    _id: string;
    name: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description?: string;
    recommendedQuestions: number;
    createdAt: string;
}

// Practice Types
export interface PracticeLog {
    _id: string;
    userId: string;
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpent: number;
    isCorrect: boolean;
    createdAt: string;
}

export interface PracticeStats {
    totalPractices: number;
    totalTimeSpent: number;
    accuracy: number;
    topicsAttempted: number;
}

// Progress Types
export interface TopicProgress {
    topicId: Topic;
    problemsSolved: number;
    accuracy: number;
    consistency: number;
    lastPracticed?: string;
}

export interface UserProgress {
    userId: string;
    topicProgress: TopicProgress[];
    overallAccuracy: number;
    overallConsistency: number;
    totalProblemsSolved: number;
    createdAt: string;
    updatedAt: string;
}

// Recommendation Types
export interface RecommendedTopic {
    topicId: string;
    topicName: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
}

export interface StudyPlanItem {
    day: string;
    topics: string[];
    duration: number;
    focus: string;
}

export interface Recommendation {
    _id: string;
    userId: string;
    recommendedTopics: RecommendedTopic[];
    studyPlan: StudyPlanItem[];
    weakAreaFocus: any[];
    confidenceScore: number;
    generatedAt: string;
    expiresAt: string;
}

// Study Room Types
export interface Participant {
    userId: string;
    userName: string;
    joinedAt: string;
    isActive: boolean;
    currentProgress: number;
}

export interface StudyRoom {
    _id: string;
    roomId: string;
    name: string;
    topic: Topic;
    topicName: string;
    createdBy: string;
    participants: Participant[];
    maxParticipants: number;
    startTime: string;
    endTime?: string;
    isActive: boolean;
    isPublic: boolean;
}

// Badge Types
export interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    criteria: any;
    points: number;
    createdAt: string;
}

export interface UserBadge {
    badgeId: Badge;
    earnedAt: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
    userId: User;
    score: number;
    rank: number;
    problemsSolved: number;
    accuracy: number;
}

// Challenge Types
export interface DailyChallenge {
    _id: string;
    date: string;
    topic: Topic;
    difficulty: 'easy' | 'medium' | 'hard';
    targetProblems: number;
    isActive: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
