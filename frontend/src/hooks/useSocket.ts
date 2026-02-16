/**
 * Socket.IO Hook
 * Manages WebSocket connection for real-time features
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Only connect if authenticated
        if (!isAuthenticated) {
            if (socket) {
                socket.close();
                setSocket(null);
            }
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Create socket connection with authentication
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, [isAuthenticated]);

    return { socket, isConnected };
};
