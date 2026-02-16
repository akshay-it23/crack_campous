/**
 * Badge Service
 */

import api from './api';
import type { Badge, UserBadge, ApiResponse } from '@/types';

export const badgeService = {
    // Get all badges
    getAllBadges: async (): Promise<Badge[]> => {
        const response = await api.get<ApiResponse<Badge[]>>('/badges');
        return response.data.data || [];
    },

    // Get user's badges
    getMyBadges: async (): Promise<UserBadge[]> => {
        const response = await api.get<ApiResponse<UserBadge[]>>('/badges/my');
        return response.data.data || [];
    },

    // Get badge progress
    getBadgeProgress: async (badgeId: string): Promise<any> => {
        const response = await api.get<ApiResponse<any>>(`/badges/${badgeId}/progress`);
        return response.data.data!;
    },
};
