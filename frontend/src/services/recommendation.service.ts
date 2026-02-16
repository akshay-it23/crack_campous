/**
 * Recommendation Service
 */

import api from './api';
import type { Recommendation, ApiResponse } from '@/types';

export const recommendationService = {
    // Get current recommendations
    getRecommendations: async (): Promise<Recommendation> => {
        const response = await api.get<ApiResponse<Recommendation>>('/recommendations');
        return response.data.data!;
    },

    // Refresh recommendations
    refreshRecommendations: async (): Promise<Recommendation> => {
        const response = await api.post<ApiResponse<Recommendation>>('/recommendations/refresh');
        return response.data.data!;
    },

    // Get study plan
    getStudyPlan: async (): Promise<any> => {
        const response = await api.get<ApiResponse<any>>('/recommendations/study-plan');
        return response.data.data!;
    },
};
