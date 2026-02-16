/**
 * Analytics Dashboard Page
 * Comprehensive analytics and statistics visualization
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Zap, Calendar, BarChart3 } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { badgeService } from '@/services/badge.service';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Fetch overall progress
    const { data: progress, isLoading: progressLoading } = useQuery({
        queryKey: ['overall-progress'],
        queryFn: progressService.getOverallProgress,
    });

    // Fetch weak areas
    const { data: weakAreas = [], isLoading: weakLoading } = useQuery({
        queryKey: ['weak-areas'],
        queryFn: progressService.getWeakAreas,
    });

    // Fetch badges
    const { data: badges = [], isLoading: badgesLoading } = useQuery({
        queryKey: ['my-badges'],
        queryFn: badgeService.getMyBadges,
    });

    const isLoading = progressLoading || weakLoading || badgesLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Questions',
            value: progress?.totalQuestions || 0,
            icon: Target,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Questions Solved',
            value: progress?.questionsSolved || 0,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500',
        },
        {
            label: 'Current Streak',
            value: `${progress?.currentStreak || 0} days`,
            icon: Zap,
            color: 'from-yellow-500 to-orange-500',
        },
        {
            label: 'Badges Earned',
            value: badges.length,
            icon: Award,
            color: 'from-purple-500 to-pink-500',
        },
    ];

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
                                <BarChart3 className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Analytics</h1>
                                <p className="text-xs text-white/60">Track your progress</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-6">Overall Progress</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/70">Completion Rate</span>
                                <span className="text-white font-bold">
                                    {progress?.totalQuestions ? Math.round((progress.questionsSolved / progress.totalQuestions) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-400 to-accent-500 transition-all duration-500"
                                    style={{ width: `${progress?.totalQuestions ? (progress.questionsSolved / progress.totalQuestions) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/70">Average Accuracy</span>
                                <span className="text-white font-bold">{progress?.averageAccuracy || 0}%</span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                    style={{ width: `${progress?.averageAccuracy || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white/70">Longest Streak</span>
                                <span className="text-white font-bold">{progress?.longestStreak || 0} days</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Calendar className="w-5 h-5 text-yellow-400" />
                                <span className="text-white/60 text-sm">Keep practicing daily!</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Weak Areas */}
                {weakAreas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">Areas to Improve</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weakAreas.map((area, index) => (
                                <motion.div
                                    key={area.topicId}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.05 }}
                                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 transition-all"
                                >
                                    <h3 className="text-white font-semibold mb-2">{area.topicName}</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/60">Accuracy</span>
                                        <span className="text-red-400 font-bold">{area.accuracy}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                            style={{ width: `${area.accuracy}%` }}
                                        ></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Recent Badges */}
                {badges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Recent Achievements</h2>
                            <button
                                onClick={() => navigate('/profile')}
                                className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {badges.slice(0, 6).map((userBadge, index) => (
                                <motion.div
                                    key={userBadge._id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    className="flex flex-col items-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-white text-xs text-center font-semibold">{userBadge.badge?.name || 'Badge'}</p>
                                    <p className="text-white/40 text-xs mt-1">
                                        {new Date(userBadge.earnedAt).toLocaleDateString()}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
