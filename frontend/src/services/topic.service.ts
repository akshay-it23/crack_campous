/**
 * Topic Service
 */

import api from './api';
import type { Topic, ApiResponse } from '@/types';

export const topicService = {
    // Get all topics
    getAllTopics: async (): Promise<Topic[]> => {
        const response = await api.get<ApiResponse<Topic[]>>('/topics');
        return response.data.data || [];
    },

    // Get topic by ID
    getTopicById: async (id: string): Promise<Topic> => {
        const response = await api.get<ApiResponse<Topic>>(`/topics/${id}`);
        return response.data.data!;
    },

    // Get topics by category
    getTopicsByCategory: async (category: string): Promise<Topic[]> => {
        const response = await api.get<ApiResponse<Topic[]>>('/topics', {
            params: { category },
        });
        return response.data.data || [];
    },

    // Get topics by difficulty
    getTopicsByDifficulty: async (difficulty: 'easy' | 'medium' | 'hard'): Promise<Topic[]> => {
        const response = await api.get<ApiResponse<Topic[]>>('/topics', {
            params: { difficulty },
        });
        return response.data.data || [];
    },
};
