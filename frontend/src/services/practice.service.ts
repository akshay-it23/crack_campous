/**
 * Practice Service
 */

import api from './api';
import type { PracticeLog, PracticeStats, ApiResponse } from '@/types';

interface LogPracticeData {
    topicId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpent: number;
    isCorrect: boolean;
}

export const practiceService = {
    // Log a practice session
    logPractice: async (data: LogPracticeData): Promise<PracticeLog> => {
        const response = await api.post<ApiResponse<PracticeLog>>('/practice', data);
        return response.data.data!;
    },

    // Get practice history
    getPracticeHistory: async (limit?: number): Promise<PracticeLog[]> => {
        const response = await api.get<ApiResponse<PracticeLog[]>>('/practice/history', {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Get practice stats
    getPracticeStats: async (): Promise<PracticeStats> => {
        const response = await api.get<ApiResponse<PracticeStats>>('/practice/stats');
        return response.data.data!;
    },

    // Get practice stats for a specific topic
    getTopicStats: async (topicId: string): Promise<any> => {
        const response = await api.get<ApiResponse<any>>(`/practice/stats/${topicId}`);
        return response.data.data!;
    },
};
