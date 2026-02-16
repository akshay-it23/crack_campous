/**
 * Activity Feed Component
 * Shows real-time room events and notifications
 */

import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, TrendingUp, Award } from 'lucide-react';
import type { RoomEvent } from '@/types';

interface ActivityFeedProps {
    events: RoomEvent[];
}

export const ActivityFeed = ({ events }: ActivityFeedProps) => {
    const getEventIcon = (type: RoomEvent['type']) => {
        switch (type) {
            case 'join':
                return <UserPlus className="w-4 h-4 text-green-400" />;
            case 'leave':
                return <UserMinus className="w-4 h-4 text-red-400" />;
            case 'progress':
                return <TrendingUp className="w-4 h-4 text-blue-400" />;
            case 'milestone':
                return <Award className="w-4 h-4 text-yellow-400" />;
            default:
                return null;
        }
    };

    const getEventMessage = (event: RoomEvent) => {
        switch (event.type) {
            case 'join':
                return `${event.userName} joined the room`;
            case 'leave':
                return `${event.userName} left the room`;
            case 'progress':
                return `${event.userName} updated progress to ${event.data?.progress}%`;
            case 'milestone':
                return `${event.userName} reached ${event.data?.milestone}`;
            default:
                return '';
        }
    };

    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Activity Feed</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                    {events.length > 0 ? (
                        events.slice().reverse().map((event, index) => (
                            <motion.div
                                key={`${event.timestamp}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/90 text-sm">{getEventMessage(event)}</p>
                                    <p className="text-white/40 text-xs mt-1">{formatTime(event.timestamp)}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-white/40 text-sm">No activity yet</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
