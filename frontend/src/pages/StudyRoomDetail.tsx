/**
 * Study Room Detail Page
 * Real-time collaborative study room with chat, participants, and progress tracking
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LogOut, Users } from 'lucide-react';
import { studyRoomService } from '@/services/studyRoom.service';
import { useSocket } from '@/hooks/useSocket';
import { ChatBox } from '@/components/features/studyRooms/ChatBox';
import { ParticipantsList } from '@/components/features/studyRooms/ParticipantsList';
import { ProgressTracker } from '@/components/features/studyRooms/ProgressTracker';
import { ActivityFeed } from '@/components/features/studyRooms/ActivityFeed';
import type { ChatMessage, RoomEvent, StudyRoom, UserJoinedEvent, UserLeftEvent, ProgressUpdatedEvent } from '@/types';
import toast from 'react-hot-toast';

export default function StudyRoomDetail() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();

    const [roomData, setRoomData] = useState<StudyRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [events, setEvents] = useState<RoomEvent[]>([]);
    const [currentProgress, setCurrentProgress] = useState(0);

    // Fetch room data
    const { data: initialRoomData, isLoading } = useQuery({
        queryKey: ['study-room', roomId],
        queryFn: () => studyRoomService.getRoomById(roomId!),
        enabled: !!roomId,
    });

    // Initialize room data
    useEffect(() => {
        if (initialRoomData) {
            setRoomData(initialRoomData);
        }
    }, [initialRoomData]);

    // Socket.IO event handlers
    useEffect(() => {
        if (!socket || !roomId) return;

        // Join room
        socket.emit('join-room', roomId);

        // Room joined successfully
        socket.on('room-joined', (room: StudyRoom) => {
            setRoomData(room);
            toast.success('Joined room successfully!');
        });

        // User joined
        socket.on('user-joined', (data: UserJoinedEvent) => {
            setEvents(prev => [...prev, {
                type: 'join',
                userId: data.userId,
                userName: data.userName,
                timestamp: data.timestamp,
            }]);
            toast.success(`${data.userName} joined the room`);
        });

        // User left
        socket.on('user-left', (data: UserLeftEvent) => {
            setEvents(prev => [...prev, {
                type: 'leave',
                userId: data.userId,
                userName: data.userName,
                timestamp: data.timestamp,
            }]);
            toast(`${data.userName} left the room`);
        });

        // Progress updated
        socket.on('progress-updated', (data: ProgressUpdatedEvent) => {
            setEvents(prev => [...prev, {
                type: 'progress',
                userId: data.userId,
                userName: data.userName,
                data: { progress: data.progress },
                timestamp: data.timestamp,
            }]);

            // Update room data with new progress
            setRoomData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    participants: prev.participants.map(p => {
                        const userId = typeof p.userId === 'object' ? p.userId._id : p.userId;
                        if (userId === data.userId) {
                            return { ...p, currentProgress: data.progress };
                        }
                        return p;
                    }),
                };
            });
        });

        // New message
        socket.on('new-message', (data: ChatMessage) => {
            setMessages(prev => [...prev, data]);
        });

        // Error handling
        socket.on('error', (error: { message: string }) => {
            toast.error(error.message);
        });

        // Cleanup
        return () => {
            socket.off('room-joined');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('progress-updated');
            socket.off('new-message');
            socket.off('error');
        };
    }, [socket, roomId]);

    // Handle leave room
    const handleLeaveRoom = () => {
        if (socket && roomId) {
            socket.emit('leave-room', roomId);
        }
        navigate('/study-rooms');
    };

    // Handle send message
    const handleSendMessage = (message: string) => {
        if (socket && roomId) {
            socket.emit('send-message', { roomId, message });
        }
    };

    // Handle update progress
    const handleUpdateProgress = (progress: number) => {
        if (socket && roomId) {
            socket.emit('update-progress', { roomId, progress });
            setCurrentProgress(progress);
            toast.success('Progress updated!');
        }
    };

    if (isLoading || !roomData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading room...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{roomData.name}</h1>
                                <p className="text-xs text-white/60">{roomData.topicName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Connection status */}
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-white/60 text-sm hidden sm:inline">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <button
                                onClick={handleLeaveRoom}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold transition-all border border-red-500/30"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Leave</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar - Participants */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <ParticipantsList
                            participants={roomData.participants}
                            hostId={typeof roomData.createdBy === 'object' ? roomData.createdBy._id : roomData.createdBy}
                        />
                    </motion.div>

                    {/* Middle - Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-6 space-y-6"
                    >
                        {/* Progress Tracker */}
                        <ProgressTracker
                            currentProgress={currentProgress}
                            onUpdateProgress={handleUpdateProgress}
                        />

                        {/* Activity Feed */}
                        <ActivityFeed events={events} />
                    </motion.div>

                    {/* Right Sidebar - Chat */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 h-[600px]"
                    >
                        <ChatBox
                            messages={messages}
                            onSendMessage={handleSendMessage}
                        />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
