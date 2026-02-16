/**
 * Enhanced Dashboard Page (Phase 6)
 * Comprehensive dashboard with all features integrated
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Target,
    Award,
    Zap,
    Users,
    Calendar,
    BarChart3,
    BookOpen,
    Trophy,
    ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { progressService } from '@/services/progress.service';
import { badgeService } from '@/services/badge.service';
import { challengeService } from '@/services/challenge.service';
import { studyRoomService } from '@/services/studyRoom.service';
import { useAuthStore } from '@/store/authStore';
import { StreakTracker } from '@/components/features/gamification/StreakTracker';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Fetch data
    const { data: progress } = useQuery({
        queryKey: ['overall-progress'],
        queryFn: progressService.getOverallProgress,
    });

    const { data: badges = [] } = useQuery({
        queryKey: ['my-badges'],
        queryFn: badgeService.getMyBadges,
    });

    const { data: challenge } = useQuery({
        queryKey: ['daily-challenge'],
        queryFn: challengeService.getTodayChallenge,
    });

    const { data: activeRooms = [] } = useQuery({
        queryKey: ['study-rooms'],
        queryFn: studyRoomService.getActiveRooms,
    });

    const quickStats = [
        {
            label: 'Questions Solved',
            value: progress?.questionsSolved || 0,
            total: progress?.totalQuestions || 0,
            icon: Target,
            color: 'from-blue-500 to-cyan-500',
            link: '/topics',
        },
        {
            label: 'Current Streak',
            value: `${progress?.currentStreak || 0}`,
            suffix: 'days',
            icon: Zap,
            color: 'from-yellow-500 to-orange-500',
            link: '/analytics',
        },
        {
            label: 'Badges Earned',
            value: badges.length,
            icon: Award,
            color: 'from-purple-500 to-pink-500',
            link: '/profile',
        },
        {
            label: 'Active Rooms',
            value: activeRooms.length,
            icon: Users,
            color: 'from-green-500 to-emerald-500',
            link: '/study-rooms',
        },
    ];

    const quickActions = [
        {
            title: 'Start Practice',
            description: 'Browse topics and start practicing',
            icon: BookOpen,
            color: 'from-blue-500 to-cyan-500',
            link: '/topics',
        },
        {
            title: 'Daily Challenge',
            description: challenge?.overallCompleted ? 'Challenge completed!' : 'Complete today\'s challenge',
            icon: Trophy,
            color: 'from-yellow-500 to-orange-500',
            link: '/challenges',
            badge: challenge?.overallCompleted ? '✓' : '!',
        },
        {
            title: 'Study Rooms',
            description: 'Join or create a study room',
            icon: Users,
            color: 'from-green-500 to-emerald-500',
            link: '/study-rooms',
        },
        {
            title: 'Analytics',
            description: 'View your progress and stats',
            icon: BarChart3,
            color: 'from-purple-500 to-pink-500',
            link: '/analytics',
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
                            </h1>
                            <p className="text-white/60">Ready to continue your learning journey?</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-white/60" />
                            <span className="text-white/70">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(stat.link)}
                            className="group relative cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                    {stat.suffix && <span className="text-white/60 text-sm">{stat.suffix}</span>}
                                    {stat.total && <span className="text-white/40 text-sm">/ {stat.total}</span>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Quick Actions & Daily Challenge */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => (
                                    <motion.div
                                        key={action.title}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + index * 0.05 }}
                                        onClick={() => navigate(action.link)}
                                        className="group relative cursor-pointer"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl blur-xl`}></div>
                                        <div className="relative backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                                                    <action.icon className="w-6 h-6 text-white" />
                                                </div>
                                                {action.badge && (
                                                    <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                                                        {action.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-white font-bold text-lg mb-1">{action.title}</h3>
                                            <p className="text-white/60 text-sm">{action.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Activity / Progress Overview */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4">Progress Overview</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white/70">Overall Completion</span>
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
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Streak Tracker */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <StreakTracker
                                currentStreak={progress?.currentStreak || 0}
                                longestStreak={progress?.longestStreak || 0}
                            />
                        </motion.div>

                        {/* Recent Badges */}
                        {badges.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Recent Badges</h3>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="text-primary-400 hover:text-primary-300 text-sm font-semibold transition-colors"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {badges.slice(0, 3).map((userBadge) => (
                                        <div
                                            key={userBadge._id}
                                            className="flex flex-col items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2">
                                                <Award className="w-6 h-6 text-white" />
                                            </div>
                                            <p className="text-white text-xs text-center font-semibold line-clamp-2">
                                                {userBadge.badge?.name || 'Badge'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
