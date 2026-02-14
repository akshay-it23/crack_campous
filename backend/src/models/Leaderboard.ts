/**
 * Leaderboard Model
 * 
 * Cached leaderboard rankings for performance.
 * Updated periodically via cron job.
 */

import mongoose, { Schema } from 'mongoose';
import { ILeaderboard } from '../types/gamification.types';

const LeaderboardSchema = new Schema<ILeaderboard>({
    type: {
        type: String,
        required: [true, 'Leaderboard type is required'],
        enum: ['global', 'topic'],
        index: true,
    },
    topicId: {
        type: String,
        ref: 'Topic',
        index: true,
    },
    rankings: [{
        userId: {
            type: String,
            required: [true, 'User ID is required'],
        },
        userName: {
            type: String,
            required: [true, 'User name is required'],
        },
        rank: {
            type: Number,
            required: [true, 'Rank is required'],
            min: [1, 'Rank must be at least 1'],
        },
        score: {
            type: Number,
            required: [true, 'Score is required'],
            default: 0,
        },
        questionsSolved: {
            type: Number,
            default: 0,
        },
        streak: {
            type: Number,
            default: 0,
        },
        badges: {
            type: Number,
            default: 0,
        },
    }],
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required'],
        index: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
});

// Unique constraint: One leaderboard per type + topicId combination
LeaderboardSchema.index({ type: 1, topicId: 1 }, { unique: true, sparse: true });

// TTL index: Auto-delete expired leaderboards
LeaderboardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);
