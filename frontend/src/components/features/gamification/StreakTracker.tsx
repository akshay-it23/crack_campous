/**
 * Streak Tracker Component
 * Displays user's current and longest streak
 */

import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';

interface StreakTrackerProps {
    currentStreak: number;
    longestStreak: number;
}

export const StreakTracker = ({ currentStreak, longestStreak }: StreakTrackerProps) => {
    const getStreakColor = (streak: number) => {
        if (streak >= 30) return 'from-purple-500 to-pink-500';
        if (streak >= 14) return 'from-orange-500 to-red-500';
        if (streak >= 7) return 'from-yellow-500 to-orange-500';
        return 'from-blue-500 to-cyan-500';
    };

    const getStreakMessage = (streak: number) => {
        if (streak >= 30) return '🔥 On fire! Legendary streak!';
        if (streak >= 14) return '⚡ Amazing! Keep it up!';
        if (streak >= 7) return '🌟 Great progress!';
        if (streak > 0) return '💪 Keep going!';
        return '👋 Start your streak today!';
    };

    return (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Streak Tracker
            </h3>

            {/* Current Streak */}
            <div className="mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="relative"
                >
                    <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getStreakColor(currentStreak)} flex items-center justify-center mb-4`}>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-white">{currentStreak}</p>
                            <p className="text-white/80 text-xs">days</p>
                        </div>
                    </div>
                    {currentStreak > 0 && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute top-0 right-1/4 text-3xl"
                        >
                            🔥
                        </motion.div>
                    )}
                </motion.div>
                <p className="text-center text-white/70 text-sm mb-2">Current Streak</p>
                <p className="text-center text-white font-semibold">{getStreakMessage(currentStreak)}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-white/60 text-xs">Longest</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{longestStreak}</p>
                    <p className="text-white/40 text-xs">days</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-white/60 text-xs">This Week</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{Math.min(currentStreak, 7)}</p>
                    <p className="text-white/40 text-xs">days</p>
                </div>
            </div>
        </div>
    );
};
