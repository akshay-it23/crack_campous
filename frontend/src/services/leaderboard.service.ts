/**
 * Leaderboard Service
 */

import api from './api';
import type { LeaderboardEntry, ApiResponse } from '@/types';

export const leaderboardService = {
    // Get global leaderboard
    getGlobalLeaderboard: async (limit?: number): Promise<LeaderboardEntry[]> => {
        const response = await api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard/global', {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Get topic leaderboard
    getTopicLeaderboard: async (topicId: string, limit?: number): Promise<LeaderboardEntry[]> => {
        const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/topic/${topicId}`, {
            params: { limit },
        });
        return response.data.data || [];
    },

    // Get user's rank
    getMyRank: async (): Promise<any> => {
        const response = await api.get<ApiResponse<any>>('/leaderboard/my-rank');
        return response.data.data!;
    },
};
