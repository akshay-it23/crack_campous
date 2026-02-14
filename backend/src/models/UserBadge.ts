/**
 * UserBadge Model
 * 
 * Tracks which badges users have earned.
 * Junction table between User and Badge.
 */

import mongoose, { Schema } from 'mongoose';
import { IUserBadge } from '../types/gamification.types';

const UserBadgeSchema = new Schema<IUserBadge>({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        ref: 'User',
        index: true,
    },
    badgeId: {
        type: String,
        required: [true, 'Badge ID is required'],
        ref: 'Badge',
        index: true,
    },
    earnedAt: {
        type: Date,
        required: [true, 'Earned date is required'],
        default: Date.now,
    },
    progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be negative'],
        max: [100, 'Progress cannot exceed 100'],
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
});

// Compound index: One badge per user (can't earn same badge twice)
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Index for recent achievements
UserBadgeSchema.index({ userId: 1, earnedAt: -1 });

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
