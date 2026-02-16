/**
 * Study Room Service
 */

import api from './api';
import type { StudyRoom, ApiResponse } from '@/types';

interface CreateRoomData {
    name: string;
    topicId: string;
    maxParticipants?: number;
    isPublic?: boolean;
}

export const studyRoomService = {
    // Create a study room
    createRoom: async (data: CreateRoomData): Promise<StudyRoom> => {
        const response = await api.post<ApiResponse<StudyRoom>>('/study-rooms', data);
        return response.data.data!;
    },

    // Get active study rooms
    getActiveRooms: async (): Promise<StudyRoom[]> => {
        const response = await api.get<ApiResponse<StudyRoom[]>>('/study-rooms/active');
        return response.data.data || [];
    },

    // Get room by ID
    getRoomById: async (roomId: string): Promise<StudyRoom> => {
        const response = await api.get<ApiResponse<StudyRoom>>(`/study-rooms/${roomId}`);
        return response.data.data!;
    },

    // Join a room
    joinRoom: async (roomId: string): Promise<StudyRoom> => {
        const response = await api.post<ApiResponse<StudyRoom>>(`/study-rooms/${roomId}/join`);
        return response.data.data!;
    },

    // Leave a room
    leaveRoom: async (roomId: string): Promise<void> => {
        await api.post(`/study-rooms/${roomId}/leave`);
    },

    // Close a room
    closeRoom: async (roomId: string): Promise<void> => {
        await api.post(`/study-rooms/${roomId}/close`);
    },
};
