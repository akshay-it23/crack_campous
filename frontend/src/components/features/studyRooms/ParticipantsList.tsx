/**
 * Participants List Component
 * Shows active participants in the study room
 */

import { motion } from 'framer-motion';
import { User, Crown } from 'lucide-react';
import type { RoomParticipant, User as UserType } from '@/types';

interface ParticipantsListProps {
    participants: RoomParticipant[];
    hostId: string;
}

export const ParticipantsList = ({ participants, hostId }: ParticipantsListProps) => {
    const activeParticipants = participants.filter(p => p.isActive);

    return (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 h-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Participants ({activeParticipants.length})
            </h3>

            <div className="space-y-3">
                {activeParticipants.map((participant, index) => {
                    const userId = typeof participant.userId === 'object'
                        ? (participant.userId as UserType)._id
                        : participant.userId;
                    const isHost = userId === hostId;

                    return (
                        <motion.div
                            key={userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                {/* Online indicator */}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                            </div>

                            {/* User info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-white font-medium truncate">{participant.userName}</p>
                                    {isHost && (
                                        <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    )}
                                </div>
                                {/* Progress bar */}
                                <div className="mt-1">
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-400 to-accent-500 transition-all duration-300"
                                            style={{ width: `${participant.currentProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-white/60 mt-1">{participant.currentProgress}% complete</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
