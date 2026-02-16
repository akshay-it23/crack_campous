/**
 * Progress Service
 */

import api from './api';
import type { UserProgress, ApiResponse } from '@/types';

export const progressService = {
    // Get user progress overview
    getProgressOverview: async (): Promise<UserProgress> => {
        const response = await api.get<ApiResponse<UserProgress>>('/progress/overview');
        return response.data.data!;
    },

    // Get progress for a specific topic
    getTopicProgress: async (topicId: string): Promise<any> => {
        const response = await api.get<ApiResponse<any>>(`/progress/topic/${topicId}`);
        return response.data.data!;
    },

    // Get consistency data
    getConsistencyData: async (): Promise<any> => {
        const response = await api.get<ApiResponse<any>>('/progress/consistency');
        return response.data.data!;
    },

    // Recalculate progress
    recalculateProgress: async (): Promise<void> => {
        await api.post('/progress/recalculate');
    },
};
