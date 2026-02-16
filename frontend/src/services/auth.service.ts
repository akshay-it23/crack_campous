/**
 * Authentication Service
 */

import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '@/types';

export const authService = {
    // Register new user
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    // Logout user
    logout: async (): Promise<void> => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    // Get current user
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/users/me');
        return response.data.data!;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.put<ApiResponse<User>>('/users/me', data);
        return response.data.data!;
    },
};
