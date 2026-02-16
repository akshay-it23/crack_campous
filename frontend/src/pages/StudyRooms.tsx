/**
 * Study Rooms Page
 * Browse and join active study rooms
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studyRoomService } from '@/services/studyRoom.service';
import { RoomCard } from '@/components/features/studyRooms/RoomCard';
import { CreateRoomModal } from '@/components/features/studyRooms/CreateRoomModal';
import type { CreateRoomData } from '@/types';
import toast from 'react-hot-toast';

export default function StudyRooms() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch active rooms
    const { data: rooms = [], isLoading } = useQuery({
        queryKey: ['study-rooms'],
        queryFn: studyRoomService.getActiveRooms,
        refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    });

    // Create room mutation
    const createRoomMutation = useMutation({
        mutationFn: studyRoomService.createRoom,
        onSuccess: (room) => {
            queryClient.invalidateQueries({ queryKey: ['study-rooms'] });
            toast.success('Room created successfully!');
            setIsCreateModalOpen(false);
            // Navigate to the room
            navigate(`/study-rooms/${room._id}`);
        },
        onError: () => {
            toast.error('Failed to create room');
        },
    });

    // Join room mutation
    const joinRoomMutation = useMutation({
        mutationFn: studyRoomService.joinRoom,
        onSuccess: (room) => {
            toast.success('Joined room!');
            navigate(`/study-rooms/${room._id}`);
        },
        onError: () => {
            toast.error('Failed to join room');
        },
    });

    const handleCreateRoom = (data: CreateRoomData) => {
        createRoomMutation.mutate(data);
    };

    const handleJoinRoom = (roomId: string) => {
        joinRoomMutation.mutate(roomId);
    };

    // Filter rooms by search query
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.topicName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading study rooms...</p>
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
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center hover:scale-105 transition-transform"
                            >
                                <Users className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Study Rooms</h1>
                                <p className="text-xs text-white/60">Collaborate with peers</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Create Room</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search rooms by name or topic..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                        />
                    </div>
                </motion.div>

                {/* Rooms Grid */}
                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room, index) => (
                            <motion.div
                                key={room._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <RoomCard
                                    room={room}
                                    onJoin={handleJoinRoom}
                                    isJoining={joinRoomMutation.isPending}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? 'No rooms found' : 'No active rooms'}
                        </h3>
                        <p className="text-white/60 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Be the first to create a study room!'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Room
                            </button>
                        )}
                    </motion.div>
                )}
            </main>

            {/* Create Room Modal */}
            <CreateRoomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateRoom}
                isCreating={createRoomMutation.isPending}
            />
        </div>
    );
}
