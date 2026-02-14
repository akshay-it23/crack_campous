/**
 * DailyChallenge Model
 * 
 * Stores daily challenges assigned to users.
 * Auto-generated based on weak topics.
 */

import mongoose, { Schema } from 'mongoose';
import { IDailyChallenge } from '../types/gamification.types';

const DailyChallengeSchema = new Schema<IDailyChallenge>({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true,
    },
    date: {
        type: Date,
        required: [true, 'Challenge date is required'],
        index: true,
    },
    challenges: [{
        topicId: {
            type: String,
            required: [true, 'Topic ID is required'],
            ref: 'Topic',
        },
        topicName: {
            type: String,
        },
        targetQuestions: {
            type: Number,
            required: [true, 'Target questions is required'],
            min: [1, 'Target must be at least 1'],
            default: 3,
        },
        difficulty: {
            type: String,
            required: [true, 'Difficulty is required'],
            enum: ['Easy', 'Medium', 'Hard'],
        },
        completed: {
            type: Boolean,
            default: false,
        },
        questionsCompleted: {
            type: Number,
            default: 0,
            min: [0, 'Questions completed cannot be negative'],
        },
    }],
    overallCompleted: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    },
    rewardPoints: {
        type: Number,
        default: 50,
        min: [0, 'Reward points cannot be negative'],
    },
}, {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
});

// Unique constraint: One challenge set per user per day
DailyChallengeSchema.index({ userId: 1, date: 1 }, { unique: true });

// TTL index: Auto-delete challenges older than 30 days
DailyChallengeSchema.index({ date: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const DailyChallenge = mongoose.model<IDailyChallenge>('DailyChallenge', DailyChallengeSchema);
