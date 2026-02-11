/**
 * UserProgress Model
 * 
 * Stores aggregated progress metrics per user per topic.
 * This is a DENORMALIZED table - we store calculated values for performance.
 * 
 * Why denormalize?
 * - Calculating from 1000+ practice logs is slow
 * - Pre-calculated metrics = fast API responses
 * - Trade-off: Storage space vs computation time
 * 
 * When to update?
 * - After every practice log (real-time)
 * - OR via background job (batch, once daily)
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * UserProgress Document Interface
 * 
 * Represents a user's progress on a specific topic
 */
export interface IUserProgress extends Document {
    userId: string;                    // Reference to User
    topicId: string;                   // Reference to Topic

    // Question metrics
    totalQuestionsAttempted: number;   // How many questions tried
    questionsSolved: number;           // How many got correct
    accuracyPercentage: number;        // (solved / attempted) * 100

    // Time metrics
    totalTimeMinutes: number;          // Total time spent on this topic
    avgTimePerQuestion: number;        // Average time per question

    // Completion metrics
    recommendedQuestions: number;      // Target from Topic model
    completionPercentage: number;      // (attempted / recommended) * 100

    // Strength calculation
    strengthScore: number;             // 0-100 overall score
    consistencyScore: number;          // How regularly practiced (0-100)

    // Difficulty breakdown
    difficultyBreakdown: {
        easy: {
            attempted: number;
            solved: number;
        };
        medium: {
            attempted: number;
            solved: number;
        };
        hard: {
            attempted: number;
            solved: number;
        };
    };

    // Tracking
    lastPracticedAt?: Date;            // When last practiced this topic
    createdAt: Date;
    updatedAt: Date;
}

/**
 * UserProgress Schema
 * 
 * Indexes:
 * - userId + topicId (unique): One progress record per user per topic
 * - userId + strengthScore: Fast sorting by strength
 */
const UserProgressSchema = new Schema<IUserProgress>({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        index: true,
    },
    topicId: {
        type: String,
        required: [true, 'Topic ID is required'],
        index: true,
    },

    // Question metrics
    totalQuestionsAttempted: {
        type: Number,
        default: 0,
        min: [0, 'Questions attempted cannot be negative'],
    },
    questionsSolved: {
        type: Number,
        default: 0,
        min: [0, 'Questions solved cannot be negative'],
    },
    accuracyPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Accuracy cannot be less than 0'],
        max: [100, 'Accuracy cannot exceed 100'],
    },

    // Time metrics
    totalTimeMinutes: {
        type: Number,
        default: 0,
        min: [0, 'Time cannot be negative'],
    },
    avgTimePerQuestion: {
        type: Number,
        default: 0,
        min: [0, 'Average time cannot be negative'],
    },

    // Completion metrics
    recommendedQuestions: {
        type: Number,
        required: [true, 'Recommended questions count is required'],
        min: [1, 'Recommended questions must be at least 1'],
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Completion cannot be less than 0'],
        max: [100, 'Completion cannot exceed 100'],
    },

    // Strength scores
    strengthScore: {
        type: Number,
        default: 0,
        min: [0, 'Strength score cannot be less than 0'],
        max: [100, 'Strength score cannot exceed 100'],
    },
    consistencyScore: {
        type: Number,
        default: 0,
        min: [0, 'Consistency score cannot be less than 0'],
        max: [100, 'Consistency score cannot exceed 100'],
    },

    // Difficulty breakdown
    difficultyBreakdown: {
        easy: {
            attempted: { type: Number, default: 0 },
            solved: { type: Number, default: 0 },
        },
        medium: {
            attempted: { type: Number, default: 0 },
            solved: { type: Number, default: 0 },
        },
        hard: {
            attempted: { type: Number, default: 0 },
            solved: { type: Number, default: 0 },
        },
    },

    // Tracking
    lastPracticedAt: {
        type: Date,
    },
}, {
    timestamps: true,  // Auto-add createdAt and updatedAt
    versionKey: false,
});

/**
 * Compound Indexes
 * 
 * 1. Unique constraint: One progress record per user per topic
 * 2. Fast queries: Get all progress for a user, sorted by strength
 */
UserProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, strengthScore: -1 });

/**
 * Export Model
 */
export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
