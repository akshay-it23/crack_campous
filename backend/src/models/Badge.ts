/**
 * Badge Model
 * 
 * Stores badge definitions (templates) for the gamification system.
 * These are the available badges that users can earn.
 */

import mongoose, { Schema } from 'mongoose';
import { IBadge } from '../types/gamification.types';

const BadgeSchema = new Schema<IBadge>({
    badgeId: {
        type: String,
        required: [true, 'Badge ID is required'],
        unique: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Badge name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Badge description is required'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Badge category is required'],
        enum: ['consistency', 'milestone', 'mastery', 'special'],
    },
    criteria: {
        type: {
            type: String,
            required: [true, 'Criteria type is required'],
            enum: ['solve_count', 'streak_days', 'topic_mastery', 'time_based', 'accuracy'],
        },
        value: {
            type: Number,
            required: [true, 'Criteria value is required'],
            min: [1, 'Criteria value must be at least 1'],
        },
        topicId: {
            type: String,
        },
    },
    iconUrl: {
        type: String,
        required: [true, 'Icon URL is required'],
        default: '/badges/default.png',
    },
    rarity: {
        type: String,
        required: [true, 'Rarity is required'],
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common',
    },
    points: {
        type: Number,
        required: [true, 'Points value is required'],
        min: [0, 'Points cannot be negative'],
        default: 10,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
