/**
 * Daily Challenges Service
 * API calls for daily challenges
 */

import api from './api';
import type { ApiResponse } from '@/types';

export interface DailyChallenge {
    _id: string;
    date: string;
    challenges: Array<{
        topicId: string;
        topicName?: string;
        targetQuestions: number;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        completed: boolean;
        questionsCompleted: number;
    }>;
    overallCompleted: boolean;
    completedAt?: string;
    rewardPoints: number;
}

export const challengeService = {
    // Get today's challenge
    getTodayChallenge: async (): Promise<DailyChallenge> => {
        const response = await api.get<ApiResponse<DailyChallenge>>('/challenges/today');
        return response.data.data!;
    },

    // Complete a challenge
    completeChallenge: async (): Promise<DailyChallenge> => {
        const response = await api.post<ApiResponse<DailyChallenge>>('/challenges/complete');
        return response.data.data!;
    },

    // Get challenge history
    getChallengeHistory: async (limit?: number): Promise<DailyChallenge[]> => {
        const response = await api.get<ApiResponse<DailyChallenge[]>>('/challenges/history', {
            params: { limit },
        });
        return response.data.data || [];
    },
};
