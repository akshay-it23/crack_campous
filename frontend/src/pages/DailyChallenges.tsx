/**
 * Daily Challenges Page
 * Daily practice challenges with rewards
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock, Trophy, Zap } from 'lucide-react';
import { challengeService } from '@/services/challenge.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DailyChallenges() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch today's challenge
    const { data: challenge, isLoading } = useQuery({
        queryKey: ['daily-challenge'],
        queryFn: challengeService.getTodayChallenge,
    });

    // Complete challenge mutation
    const completeMutation = useMutation({
        mutationFn: challengeService.completeChallenge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-challenge'] });
            toast.success('🎉 Challenge completed! Points earned!');
        },
        onError: () => {
            toast.error('Failed to complete challenge');
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading challenge...</p>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'from-green-500 to-emerald-500';
            case 'Medium':
                return 'from-yellow-500 to-orange-500';
            case 'Hard':
                return 'from-red-500 to-pink-500';
            default:
                return 'from-blue-500 to-cyan-500';
        }
    };

    const totalTargetQuestions = challenge?.challenges.reduce((sum, c) => sum + c.targetQuestions, 0) || 0;
    const totalCompleted = challenge?.challenges.reduce((sum, c) => sum + c.questionsCompleted, 0) || 0;
    const overallProgress = totalTargetQuestions > 0 ? (totalCompleted / totalTargetQuestions) * 100 : 0;

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
                                <Target className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Daily Challenge</h1>
                                <p className="text-xs text-white/60">Complete today's tasks</p>
                            </div>
                        </div>
                        {challenge?.overallCompleted && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-semibold">Completed!</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Challenge Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Today's Challenge</h2>
                            <p className="text-white/60">
                                {new Date(challenge?.date || '').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2">
                                <Trophy className="w-10 h-10 text-white" />
                            </div>
                            <p className="text-white/60 text-sm">Reward</p>
                            <p className="text-white font-bold">{challenge?.rewardPoints} pts</p>
                        </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/70">Overall Progress</span>
                            <span className="text-white font-bold">{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-primary-400 to-accent-500"
                            ></motion.div>
                        </div>
                        <p className="text-white/60 text-sm mt-2">
                            {totalCompleted} / {totalTargetQuestions} questions completed
                        </p>
                    </div>
                </motion.div>

                {/* Challenge Tasks */}
                <div className="space-y-4 mb-8">
                    {challenge?.challenges.map((task, index) => {
                        const progress = task.targetQuestions > 0 ? (task.questionsCompleted / task.targetQuestions) * 100 : 0;
                        return (
                            <motion.div
                                key={task.topicId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${getDifficultyColor(task.difficulty)} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                                <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-white">{task.topicName}</h3>
                                                <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getDifficultyColor(task.difficulty)} text-white text-xs font-semibold`}>
                                                    {task.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-white/60 text-sm">
                                                Solve {task.targetQuestions} questions
                                            </p>
                                        </div>
                                        {task.completed && (
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/20">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                <span className="text-green-400 text-sm font-semibold">Done</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white/70 text-sm">Progress</span>
                                            <span className="text-white font-semibold text-sm">
                                                {task.questionsCompleted} / {task.targetQuestions}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${getDifficultyColor(task.difficulty)} transition-all duration-500`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Start Practice Button */}
                                    {!task.completed && (
                                        <button
                                            onClick={() => navigate(`/practice/${task.topicId}`)}
                                            className="w-full py-2 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform"
                                        >
                                            Start Practice
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Complete Challenge Button */}
                {!challenge?.overallCompleted && overallProgress === 100 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">All tasks completed!</h3>
                                    <p className="text-white/70 text-sm">Claim your {challenge?.rewardPoints} points reward</p>
                                </div>
                            </div>
                            <button
                                onClick={() => completeMutation.mutate()}
                                disabled={completeMutation.isPending}
                                className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {completeMutation.isPending ? 'Claiming...' : 'Claim Reward'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
