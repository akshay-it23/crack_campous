/**
 * Study Room Model
 * 
 * Manages collaborative study sessions where users can study together in real-time
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
    userId: mongoose.Types.ObjectId;
    userName: string;
    joinedAt: Date;
    isActive: boolean;
    currentProgress: number; // percentage
}

export interface IStudyRoom extends Document {
    roomId: string;
    name: string;
    topic: mongoose.Types.ObjectId;
    topicName: string;
    createdBy: mongoose.Types.ObjectId;
    participants: IParticipant[];
    maxParticipants: number;
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
    isPublic: boolean; // Public rooms can be joined by anyone
    password?: string; // Optional password for private rooms
}

const StudyRoomSchema = new Schema<IStudyRoom>(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        topic: {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            required: true,
        },
        topicName: {
            type: String,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participants: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                userName: {
                    type: String,
                    required: true,
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                isActive: {
                    type: Boolean,
                    default: true,
                },
                currentProgress: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 100,
                },
            },
        ],
        maxParticipants: {
            type: Number,
            default: 10,
            min: 2,
            max: 50,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        password: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for finding active public rooms
StudyRoomSchema.index({ isActive: 1, isPublic: 1 });

// Index for finding rooms by topic
StudyRoomSchema.index({ topic: 1, isActive: 1 });

export default mongoose.model<IStudyRoom>('StudyRoom', StudyRoomSchema);
