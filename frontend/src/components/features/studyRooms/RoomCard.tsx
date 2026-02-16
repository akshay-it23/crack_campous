/**
 * Room Card Component
 * Displays study room information with join functionality
 */

import { motion } from 'framer-motion';
import { Users, Lock, Globe, User } from 'lucide-react';
import type { StudyRoom } from '@/types';

interface RoomCardProps {
    room: StudyRoom;
    onJoin: (roomId: string) => void;
    isJoining?: boolean;
}

export const RoomCard = ({ room, onJoin, isJoining = false }: RoomCardProps) => {
    const participantCount = room.participants.filter(p => p.isActive).length;
    const isFull = participantCount >= room.maxParticipants;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group relative"
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>

            {/* Card content */}
            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{room.name}</h3>
                        <p className="text-white/60 text-sm">{room.topicName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {room.isPublic ? (
                            <Globe className="w-5 h-5 text-green-400" />
                        ) : (
                            <Lock className="w-5 h-5 text-yellow-400" />
                        )}
                    </div>
                </div>

                {/* Host info */}
                <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm">
                        Host: {typeof room.createdBy === 'object' ? room.createdBy.fullName : 'Unknown'}
                    </span>
                </div>

                {/* Participants */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-400" />
                        <span className="text-white font-semibold">
                            {participantCount} / {room.maxParticipants}
                        </span>
                    </div>
                    {isFull && (
                        <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold">
                            FULL
                        </span>
                    )}
                </div>

                {/* Join button */}
                <button
                    onClick={() => onJoin(room._id)}
                    disabled={isFull || isJoining}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isJoining ? 'Joining...' : isFull ? 'Room Full' : 'Join Room'}
                </button>
            </div>
        </motion.div>
    );
};
