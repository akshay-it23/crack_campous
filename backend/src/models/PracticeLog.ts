/**
 * PracticeLog Model
 * 
 * Tracks individual practice sessions for users.
 * Each log represents one question solved (or attempted).
 * 
 * Use cases:
 * - Student logs "Two Sum" problem (Arrays topic, Easy, 15 min, solved)
 * - View practice history for last 7 days
 * - Calculate statistics: total questions, accuracy, time spent
 * 
 * Relationships:
 * - Belongs to User (many logs per user)
 * - Belongs to Topic (many logs per topic)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPracticeLog extends Document {
    _id: string;
    userId: string;oiq 4nq4
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
 * PracticeLog Schema
 * 
 * Fields:
 * - userId: Reference to User who practiced
 * - topicId: Reference to Topic
 * - questionTitle: Name of the question (e.g., "Two Sum")
 * - questionUrl: Optional link to question (LeetCode, GFG, etc.)
 * - difficulty: Easy, Medium, or Hard
 * - timeSpentMinutes: How long they spent (1-300 minutes)
 * - solved: Did they solve it successfully?
 * - notes: Optional personal notes
 * - practicedAt: When they practiced (can be backdated)
 * 
 * Indexes for fast queries:
 * - userId + practicedAt: Get user's recent practice
 * - userId + topicId: Get user's practice for specific topic
 * - topicId: Aggregate stats across all users
 */
const PracticeLogSchema = new Schema<IPracticeLog>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User',
            index: true,
        },
        topicId: {
            type: String,
            required: [true, 'Topic ID is required'],
            ref: 'Topic',
            index: true,
        },
        questionTitle: {
            type: String,
            required: [true, 'Question title is required'],
            trim: true,
        },
        questionUrl: {
            type: String,
            trim: true,
        },
        difficulty: {
            type: String,
            required: [true, 'Difficulty is required'],
            enum: ['Easy', 'Medium', 'Hard'],
        },
        timeSpentMinutes: {
            type: Number,
            required: [true, 'Time spent is required'],
            min: [1, 'Time must be at least 1 minute'],
            max: [300, 'Time cannot exceed 300 minutes'],
        },
        solved: {
            type: Boolean,
            required: [true, 'Solved status is required'],
            default: false,
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        practicedAt: {
            type: Date,
            required: [true, 'Practice date is required'],
            default: Date.now,
            index: true, // Fast sorting by date
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false,
    }
);

/**
 * Compound Indexes for Performance
 * 
 * These optimize common queries:
 * 1. User's practice history sorted by date
 * 2. User's practice for specific topic
 */
PracticeLogSchema.index({ userId: 1, practicedAt: -1 });
PracticeLogSchema.index({ userId: 1, topicId: 1 });

export const PracticeLog = mongoose.model<IPracticeLog>('PracticeLog', PracticeLogSchema);
