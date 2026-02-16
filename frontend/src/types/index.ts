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

// Generic API Response
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Study Room Types
export interface StudyRoom {
    _id: string;
    roomId: string;
    name: string;
    topic: Topic;
    topicName: string;
    createdBy: User;
    participants: RoomParticipant[];
    maxParticipants: number;
    startTime: string;
    endTime?: string;
    isActive: boolean;
    isPublic: boolean;
    password?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoomParticipant {
    userId: User | string;
    userName: string;
    joinedAt: string;
    isActive: boolean;
    currentProgress: number;
}

export interface CreateRoomData {
    name: string;
    topicId: string;
    maxParticipants?: number;
    isPublic?: boolean;
    password?: string;
}

// Socket Event Types
export interface ChatMessage {
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
}

export interface RoomEvent {
    type: 'join' | 'leave' | 'progress' | 'milestone';
    userId: string;
    userName: string;
    data?: any;
    timestamp: Date;
}

export interface UserJoinedEvent {
    userId: string;
    userName: string;
    timestamp: Date;
}

export interface UserLeftEvent {
    userId: string;
    userName: string;
    timestamp: Date;
}

export interface ProgressUpdatedEvent {
    userId: string;
    userName: string;
    progress: number;
    timestamp: Date;
}
