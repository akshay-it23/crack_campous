/**
 * Recommendations Page - AI-powered study recommendations
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, RefreshCw, Target, TrendingUp, Calendar, Lightbulb, ArrowRight } from 'lucide-react';
import { recommendationService } from '@/services/recommendation.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Recommendations() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch recommendations
    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['recommendations'],
        queryFn: recommendationService.getRecommendations,
        retry: 1,
    });

    // Refresh mutation
    const refreshMutation = useMutation({
        mutationFn: recommendationService.refreshRecommendations,
        onMutate: () => setIsRefreshing(true),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recommendations'] });
            toast.success('Recommendations refreshed!');
            setIsRefreshing(false);
        },
        onError: () => {
            toast.error('Failed to refresh recommendations');
            setIsRefreshing(false);
        },
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'from-red-500 to-pink-500';
            case 'medium': return 'from-yellow-500 to-orange-500';
            case 'low': return 'from-green-500 to-emerald-500';
            default: return 'from-blue-500 to-cyan-500';
        }
    };

    const handleRefresh = () => {
        refreshMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading recommendations...</p>
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
                                <Brain className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">AI Recommendations</h1>
                                <p className="text-xs text-white/60">Personalized study plan</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {recommendations ? (
                    <>
                        {/* Confidence Score */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Recommendation Confidence</h3>
                                    <p className="text-white/60 text-sm">Based on your practice history and progress</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-white mb-1">
                                        {Math.round(recommendations.confidenceScore * 100)}%
                                    </div>
                                    <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-400 to-accent-500 transition-all duration-500"
                                            style={{ width: `${recommendations.confidenceScore * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recommended Topics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-6 h-6 text-primary-400" />
                                Recommended Topics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommendations.recommendedTopics.map((topic, index) => (
                                    <motion.div
                                        key={topic.topicId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r ${getPriorityColor(topic.priority)} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                                        <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getPriorityColor(topic.priority)} text-white text-xs font-semibold`}>
                                                    {topic.priority.toUpperCase()}
                                                </div>
                                                <div className="text-white/60 text-sm">{topic.estimatedTime}min</div>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">{topic.topicName}</h3>
                                            <p className="text-white/70 text-sm mb-4">{topic.reason}</p>
                                            <button
                                                onClick={() => navigate(`/practice/${topic.topicId}`)}
                                                className="w-full py-2 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                            >
                                                Start Practice
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Study Plan */}
                        {recommendations.studyPlan && recommendations.studyPlan.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-primary-400" />
                                    7-Day Study Plan
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {recommendations.studyPlan.map((plan, index) => (
                                        <motion.div
                                            key={plan.day}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-white mb-2">{plan.day}</h3>
                                                    <p className="text-white/70 text-sm mb-3">{plan.focus}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {plan.topics.map((topic) => (
                                                            <span
                                                                key={topic}
                                                                className="px-3 py-1 rounded-lg bg-white/10 text-white/80 text-sm"
                                                            >
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="text-2xl font-bold text-white">{plan.duration}</div>
                                                    <div className="text-white/60 text-sm">minutes</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <Lightbulb className="w-10 h-10 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
                        <p className="text-white/60 mb-6">Start practicing to get personalized recommendations</p>
                        <button
                            onClick={() => navigate('/topics')}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform"
                        >
                            Browse Topics
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
