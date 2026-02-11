/**
 * Topic Model
 * 
 * Represents predefined topics for practice tracking.
 * Topics are created by admins/seeding scripts, not by users.
 * 
 * Examples:
 * - Arrays (DSA, Beginner, 50 questions)
 * - Dynamic Programming (DSA, Advanced, 40 questions)
 * - System Design (System Design, Advanced, 10 questions)
 * 
 * Why predefined topics?
 * - Ensures consistency across all users
 * - Easier to calculate and compare statistics
 * - Structured learning path
 * - Can add recommended resources later
 */

import mongoose, { Schema, Document } from 'mongoose';

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
 * Topic Schema
 * 
 * Fields:
 * - name: Topic name (e.g., "Arrays", "Dynamic Programming")
 * - category: Broad category (e.g., "DSA", "System Design", "Aptitude")
 * - difficulty: Beginner, Intermediate, or Advanced
 * - recommendedQuestions: Target number of questions to complete
 * - description: Brief description of the topic
 */
const TopicSchema = new Schema<ITopic>(
    {
        name: {
            type: String,
            required: [true, 'Topic name is required'],
            unique: true,
            trim: true,
            index: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['DSA', 'System Design', 'Aptitude', 'Other'],
            index: true, // Fast filtering by category
        },
        difficulty: {
            type: String,
            required: [true, 'Difficulty is required'],
            enum: ['Beginner', 'Intermediate', 'Advanced'],
        },
        recommendedQuestions: {
            type: Number,
            required: [true, 'Recommended questions count is required'],
            min: [1, 'Must recommend at least 1 question'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Topic = mongoose.model<ITopic>('Topic', TopicSchema);
