/**
 * Topics Page - Browse and filter topics
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, Target, Clock, TrendingUp } from 'lucide-react';
import { topicService } from '@/services/topic.service';
import { useNavigate } from 'react-router-dom';
import type { Topic } from '@/types';
import toast from 'react-hot-toast';

export default function Topics() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

    // Fetch topics
    const { data: topics = [], isLoading, error } = useQuery({
        queryKey: ['topics'],
        queryFn: topicService.getAllTopics,
    });

    if (error) {
        toast.error('Failed to load topics');
    }

    // Filter topics
    const filteredTopics = topics.filter((topic) => {
        const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Get unique categories
    const categories = ['all', ...new Set(topics.map(t => t.category))];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'from-green-500 to-emerald-500';
            case 'medium': return 'from-yellow-500 to-orange-500';
            case 'hard': return 'from-red-500 to-pink-500';
            default: return 'from-blue-500 to-cyan-500';
        }
    };

    const handleStartPractice = (topicId: string) => {
        navigate(`/practice/${topicId}`);
    };

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
                                <h1 className="text-xl font-bold text-white">Browse Topics</h1>
                                <p className="text-xs text-white/60">Choose a topic to practice</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        {/* Category Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary-400 transition-all"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat} className="bg-slate-800">
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-white/70 text-sm mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Difficulty
                            </label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary-400 transition-all"
                            >
                                <option value="all" className="bg-slate-800">All Difficulties</option>
                                <option value="easy" className="bg-slate-800">Easy</option>
                                <option value="medium" className="bg-slate-800">Medium</option>
                                <option value="hard" className="bg-slate-800">Hard</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-white/70">
                        Showing <span className="text-white font-semibold">{filteredTopics.length}</span> of{' '}
                        <span className="text-white font-semibold">{topics.length}</span> topics
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white/70">Loading topics...</p>
                    </div>
                )}

                {/* Topics Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTopics.map((topic, index) => (
                            <motion.div
                                key={topic._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${getDifficultyColor(topic.difficulty)} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl`}></div>
                                <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 h-full flex flex-col">
                                    {/* Difficulty Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getDifficultyColor(topic.difficulty)} text-white text-xs font-semibold`}>
                                            {topic.difficulty.toUpperCase()}
                                        </div>
                                        <div className="text-white/60 text-sm">{topic.category}</div>
                                    </div>

                                    {/* Topic Info */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-primary-400" />
                                            {topic.name}
                                        </h3>
                                        {topic.description && (
                                            <p className="text-white/70 text-sm mb-4 line-clamp-2">
                                                {topic.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Recommended Questions */}
                                    <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                                        <Clock className="w-4 h-4" />
                                        <span>{topic.recommendedQuestions} recommended questions</span>
                                    </div>

                                    {/* Start Practice Button */}
                                    <button
                                        onClick={() => handleStartPractice(topic._id)}
                                        className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Target className="w-5 h-5" />
                                        Start Practice
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredTopics.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-white/40" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No topics found</h3>
                        <p className="text-white/60">Try adjusting your search or filters</p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
