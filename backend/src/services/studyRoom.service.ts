/**
 * Study Room Service
 * 
 * Business logic for managing collaborative study rooms
 */

import StudyRoom from '../models/StudyRoom';
import { Topic } from '../models/Topic';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

export class StudyRoomService {
    /**
     * Create a new study room
     */
    static async createRoom(
        userId: string,
        topicId: string,
        name: string,
        isPublic: boolean = true,
        maxParticipants: number = 10,
        password?: string
    ) {
        // Verify topic exists
        const topic = await Topic.findById(topicId);
        if (!topic) {
            throw new Error('Topic not found');
        }

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate unique room ID
        const roomId = nanoid();

        // Create room
        const room = await StudyRoom.create({
            roomId,
            name,
            topic: new mongoose.Types.ObjectId(topicId),
            topicName: topic.name,
            createdBy: new mongoose.Types.ObjectId(userId),
            participants: [
                {
                    userId: new mongoose.Types.ObjectId(userId),
                    userName: user.fullName,
                    joinedAt: new Date(),
                    isActive: true,
                    currentProgress: 0,
                },
            ],
            maxParticipants,
            isPublic,
            password,
            isActive: true,
        });

        return room;
    }

    /**
     * Get all active public rooms
     */
    static async getActiveRooms(topicId?: string) {
        const query: any = { isActive: true, isPublic: true };
        if (topicId) {
            query.topic = new mongoose.Types.ObjectId(topicId);
        }

        const rooms = await StudyRoom.find(query)
            .populate('topic', 'name category')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .limit(20);

        return rooms;
    }

    /**
     * Get room by ID
     */
    static async getRoomById(roomId: string) {
        const room = await StudyRoom.findOne({ roomId, isActive: true })
            .populate('topic', 'name category')
            .populate('createdBy', 'fullName');

        if (!room) {
            throw new Error('Room not found or inactive');
        }

        return room;
    }

    /**
     * Join a study room
     */
    static async joinRoom(roomId: string, userId: string, password?: string) {
        const room = await StudyRoom.findOne({ roomId, isActive: true });
        if (!room) {
            throw new Error('Room not found or inactive');
        }

        // Check if room is full
        const activeParticipants = room.participants.filter((p) => p.isActive);
        if (activeParticipants.length >= room.maxParticipants) {
            throw new Error('Room is full');
        }

        // Check password for private rooms
        if (!room.isPublic && room.password !== password) {
            throw new Error('Incorrect password');
        }

        // Check if user already in room
        const existingParticipant = room.participants.find(
            (p) => p.userId.toString() === userId && p.isActive
        );
        if (existingParticipant) {
            throw new Error('Already in this room');
        }

        // Get user info
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Add participant
        room.participants.push({
            userId: new mongoose.Types.ObjectId(userId),
            userName: user.fullName,
            joinedAt: new Date(),
            isActive: true,
            currentProgress: 0,
        });

        await room.save();
        return room;
    }

    /**
     * Leave a study room
     */
    static async leaveRoom(roomId: string, userId: string) {
        const room = await StudyRoom.findOne({ roomId });
        if (!room) {
            throw new Error('Room not found');
        }

        // Find and deactivate participant
        const participant = room.participants.find((p) => p.userId.toString() === userId);
        if (!participant) {
            throw new Error('Not in this room');
        }

        participant.isActive = false;

        // If creator left, close the room
        if (room.createdBy.toString() === userId) {
            room.isActive = false;
            room.endTime = new Date();
        }

        await room.save();
        return room;
    }

    /**
     * Update participant progress
     */
    static async updateProgress(roomId: string, userId: string, progress: number) {
        const room = await StudyRoom.findOne({ roomId, isActive: true });
        if (!room) {
            throw new Error('Room not found or inactive');
        }

        const participant = room.participants.find(
            (p) => p.userId.toString() === userId && p.isActive
        );
        if (!participant) {
            throw new Error('Not in this room');
        }

        participant.currentProgress = Math.min(Math.max(progress, 0), 100);
        await room.save();

        return room;
    }

    /**
     * Close a study room
     */
    static async closeRoom(roomId: string, userId: string) {
        const room = await StudyRoom.findOne({ roomId });
        if (!room) {
            throw new Error('Room not found');
        }

        // Only creator can close the room
        if (room.createdBy.toString() !== userId) {
            throw new Error('Only room creator can close the room');
        }

        room.isActive = false;
        room.endTime = new Date();
        await room.save();

        return room;
    }
}
