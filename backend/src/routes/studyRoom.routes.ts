/**
 * Study Room Routes
 * 
 * API endpoints for collaborative study rooms
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { StudyRoomService } from '../services/studyRoom.service';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createRoomSchema = z.object({
    topicId: z.string().min(1, 'Topic ID is required'),
    name: z.string().min(3, 'Room name must be at least 3 characters'),
    isPublic: z.boolean().optional().default(true),
    maxParticipants: z.number().min(2).max(50).optional().default(10),
    password: z.string().optional(),
});

const joinRoomSchema = z.object({
    password: z.string().optional(),
});

/**
 * POST /api/study-rooms
 * Create a new study room
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const validatedData = createRoomSchema.parse(req.body);
        const userId = req.user!.userId;

        const room = await StudyRoomService.createRoom(
            userId,
            validatedData.topicId,
            validatedData.name,
            validatedData.isPublic,
            validatedData.maxParticipants,
            validatedData.password
        );

        res.status(201).json({
            success: true,
            message: 'Study room created successfully',
            data: room,
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create study room',
        });
    }
});

/**
 * GET /api/study-rooms/active
 * Get all active public study rooms
 */
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const topicId = req.query.topicId as string | undefined;
        const rooms = await StudyRoomService.getActiveRooms(topicId);

        res.json({
            success: true,
            data: rooms,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get active rooms',
        });
    }
});

/**
 * GET /api/study-rooms/:roomId
 * Get study room details
 */
router.get('/:roomId', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await StudyRoomService.getRoomById(roomId);

        res.json({
            success: true,
            data: room,
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message || 'Room not found',
        });
    }
});

/**
 * POST /api/study-rooms/:roomId/join
 * Join a study room
 */
router.post('/:roomId/join', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const validatedData = joinRoomSchema.parse(req.body);
        const userId = req.user!.userId;

        const room = await StudyRoomService.joinRoom(roomId, userId, validatedData.password);

        res.json({
            success: true,
            message: 'Joined study room successfully',
            data: room,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to join room',
        });
    }
});

/**
 * POST /api/study-rooms/:roomId/leave
 * Leave a study room
 */
router.post('/:roomId/leave', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user!.userId;

        const room = await StudyRoomService.leaveRoom(roomId, userId);

        res.json({
            success: true,
            message: 'Left study room successfully',
            data: room,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to leave room',
        });
    }
});

/**
 * POST /api/study-rooms/:roomId/close
 * Close a study room (creator only)
 */
router.post('/:roomId/close', authMiddleware, async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user!.userId;

        const room = await StudyRoomService.closeRoom(roomId, userId);

        res.json({
            success: true,
            message: 'Study room closed successfully',
            data: room,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to close room',
        });
    }
});

export default router;
