/**
 * Recommendation Model
 * 
 * Stores AI-generated personalized recommendations for users
 * Includes topic suggestions, study plans, and weak area focus
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendedTopic {
    topicId: mongoose.Types.ObjectId;
    topicName: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number; // in minutes
}

export interface IStudyPlanItem {
    day: string; // e.g., "Monday", "2024-02-16"
    topics: mongoose.Types.ObjectId[];
    duration: number; // in minutes
    focus: string; // e.g., "Weak areas", "New topics"
}

export interface IRecommendation extends Document {
    userId: mongoose.Types.ObjectId;
    recommendedTopics: IRecommendedTopic[];
    studyPlan: IStudyPlanItem[];
    weakAreaFocus: {
        topicId: mongoose.Types.ObjectId;
        topicName: string;
        currentAccuracy: number;
        targetAccuracy: number;
        suggestedPracticeCount: number;
    }[];
    confidenceScore: number; // 0-100, how confident the AI is in these recommendations
    generatedAt: Date;
    expiresAt: Date; // Recommendations expire after 7 days
    isActive: boolean;
}

const RecommendationSchema = new Schema<IRecommendation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        recommendedTopics: [
            {
                topicId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Topic',
                    required: true,
                },
                topicName: {
                    type: String,
                    required: true,
                },
                reason: {
                    type: String,
                    required: true,
                },
                priority: {
                    type: String,
                    enum: ['high', 'medium', 'low'],
                    required: true,
                },
                estimatedTime: {
                    type: Number,
                    required: true,
                },
            },
        ],
        studyPlan: [
            {
                day: {
                    type: String,
                    required: true,
                },
                topics: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: 'Topic',
                    },
                ],
                duration: {
                    type: Number,
                    required: true,
                },
                focus: {
                    type: String,
                    required: true,
                },
            },
        ],
        weakAreaFocus: [
            {
                topicId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Topic',
                    required: true,
                },
                topicName: {
                    type: String,
                    required: true,
                },
                currentAccuracy: {
                    type: Number,
                    required: true,
                },
                targetAccuracy: {
                    type: Number,
                    required: true,
                },
                suggestedPracticeCount: {
                    type: Number,
                    required: true,
                },
            },
        ],
        confidenceScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for finding active recommendations
RecommendationSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

// Automatically deactivate expired recommendations
RecommendationSchema.pre('find', function () {
    this.where({ expiresAt: { $gt: new Date() } });
});

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
