/**
 * Leaderboard Page - Global rankings
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Target, Award, Crown } from 'lucide-react';
import { leaderboardService } from '@/services/leaderboard.service';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Leaderboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [limit] = useState(50);

    // Fetch leaderboard
    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['leaderboard', limit],
        queryFn: () => leaderboardService.getGlobalLeaderboard(limit),
    });

    // Fetch user's rank
    const { data: myRank } = useQuery({
        queryKey: ['my-rank'],
        queryFn: leaderboardService.getMyRank,
        retry: 1,
    });

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-gray-300" />;
            case 3: return <Medal className="w-6 h-6 text-orange-400" />;
            default: return <span className="text-white/60 font-bold">#{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1: return 'from-yellow-500 to-orange-500';
            case 2: return 'from-gray-400 to-gray-600';
            case 3: return 'from-orange-500 to-red-500';
            default: return 'from-blue-500 to-purple-500';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading leaderboard...</p>
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
                                <Trophy className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Global Leaderboard</h1>
                                <p className="text-xs text-white/60">Top performers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* My Rank Card */}
                {myRank && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="backdrop-blur-xl bg-gradient-to-r from-primary-400/20 to-accent-500/20 rounded-2xl p-6 border border-white/20 mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Your Rank</h3>
                                    <p className="text-white/60 text-sm">{user?.fullName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">#{myRank.rank || 'N/A'}</div>
                                <div className="text-white/60 text-sm">{myRank.score || 0} points</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-4 mb-8"
                    >
                        {/* 2nd Place */}
                        <div className="order-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center mt-8"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mx-auto mb-3">
                                    <Medal className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-white mb-1">2nd</div>
                                <p className="text-white/80 font-medium mb-2">{leaderboard[1].userId.fullName}</p>
                                <p className="text-white/60 text-sm">{leaderboard[1].score} pts</p>
                            </motion.div>
                        </div>

                        {/* 1st Place */}
                        <div className="order-2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border-2 border-yellow-400/50 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
                                    <Crown className="w-10 h-10 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">1st</div>
                                <p className="text-white/90 font-bold mb-2">{leaderboard[0].userId.fullName}</p>
                                <p className="text-white/70 text-sm">{leaderboard[0].score} pts</p>
                            </motion.div>
                        </div>

                        {/* 3rd Place */}
                        <div className="order-3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center mt-12"
                            >
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3">
                                    <Medal className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-xl font-bold text-white mb-1">3rd</div>
                                <p className="text-white/80 font-medium mb-2">{leaderboard[2].userId.fullName}</p>
                                <p className="text-white/60 text-sm">{leaderboard[2].score} pts</p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Leaderboard List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-bold text-white mb-4">All Rankings</h2>
                    <div className="space-y-3">
                        {leaderboard.map((entry, index) => (
                            <motion.div
                                key={entry.userId._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={`backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all ${entry.userId._id === user?._id ? 'ring-2 ring-primary-400' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <div className="w-12 text-center">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{entry.userId.fullName}</h3>
                                        <p className="text-white/60 text-sm">{entry.userId.email}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-6 text-center">
                                        <div>
                                            <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                                                <Target className="w-3 h-3" />
                                                <span>Solved</span>
                                            </div>
                                            <div className="text-white font-semibold">{entry.problemsSolved}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                                                <TrendingUp className="w-3 h-3" />
                                                <span>Accuracy</span>
                                            </div>
                                            <div className="text-white font-semibold">{Math.round(entry.accuracy)}%</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
                                                <Trophy className="w-3 h-3" />
                                                <span>Score</span>
                                            </div>
                                            <div className="text-white font-semibold">{entry.score}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Empty State */}
                {leaderboard.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-10 h-10 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Rankings Yet</h3>
                        <p className="text-white/60">Be the first to start practicing!</p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
