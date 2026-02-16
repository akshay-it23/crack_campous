/**
 * Practice Session Page
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Target, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { topicService } from '@/services/topic.service';
import { practiceService } from '@/services/practice.service';
import toast from 'react-hot-toast';

export default function Practice() {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [timeSpent, setTimeSpent] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [problemsSolved, setProblemsSolved] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Fetch topic details
    const { data: topic, isLoading } = useQuery({
        queryKey: ['topic', topicId],
        queryFn: () => topicService.getTopicById(topicId!),
        enabled: !!topicId,
    });

    // Log practice mutation
    const logPracticeMutation = useMutation({
        mutationFn: practiceService.logPractice,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['practice-stats'] });
            queryClient.invalidateQueries({ queryKey: ['progress'] });
        },
    });

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeSpent((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartSession = () => {
        setSessionStarted(true);
        setIsTimerRunning(true);
        toast.success('Practice session started!');
    };

    const handleSolveProblem = async (isCorrect: boolean) => {
        setProblemsSolved((prev) => prev + 1);
        if (isCorrect) {
            setCorrectAnswers((prev) => prev + 1);
        }

        // Log the practice
        try {
            await logPracticeMutation.mutateAsync({
                topicId: topicId!,
                difficulty,
                timeSpent: Math.floor(timeSpent / problemsSolved + 1), // Average time per problem
                isCorrect,
            });
        } catch (error) {
            console.error('Failed to log practice:', error);
        }
    };

    const handleEndSession = () => {
        setIsTimerRunning(false);
        setShowResults(true);
    };

    const handleBackToTopics = () => {
        navigate('/topics');
    };

    const accuracy = problemsSolved > 0 ? Math.round((correctAnswers / problemsSolved) * 100) : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/70">Loading topic...</p>
                </div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white text-xl">Topic not found</p>
                    <button
                        onClick={handleBackToTopics}
                        className="mt-4 px-6 py-3 rounded-lg bg-primary-400 text-white hover:bg-primary-500"
                    >
                        Back to Topics
                    </button>
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

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AnimatePresence mode="wait">
                    {!sessionStarted ? (
                        // Setup Screen
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-white mb-2">{topic.name}</h1>
                                <p className="text-white/70">{topic.category}</p>
                            </div>

                            {topic.description && (
                                <p className="text-white/80 text-center mb-8">{topic.description}</p>
                            )}

                            {/* Difficulty Selection */}
                            <div className="mb-8">
                                <label className="block text-white text-center mb-4 font-semibold">
                                    Select Difficulty
                                </label>
                                <div className="flex gap-4 justify-center">
                                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                                        <button
                                            key={diff}
                                            onClick={() => setDifficulty(diff)}
                                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${difficulty === diff
                                                    ? 'bg-gradient-to-r from-primary-400 to-accent-500 text-white scale-105'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                }`}
                                        >
                                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recommended Questions */}
                            <div className="text-center mb-8">
                                <p className="text-white/60">
                                    Recommended: <span className="text-white font-semibold">{topic.recommendedQuestions}</span> questions
                                </p>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={handleStartSession}
                                className="w-full py-4 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                                <Target className="w-6 h-6" />
                                Start Practice Session
                            </button>
                        </motion.div>
                    ) : showResults ? (
                        // Results Screen
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20"
                        >
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                                <p className="text-white/70">Great work on {topic.name}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{formatTime(timeSpent)}</p>
                                    <p className="text-white/60 text-sm">Time Spent</p>
                                </div>
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{problemsSolved}</p>
                                    <p className="text-white/60 text-sm">Problems Solved</p>
                                </div>
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{correctAnswers}</p>
                                    <p className="text-white/60 text-sm">Correct</p>
                                </div>
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{accuracy}%</p>
                                    <p className="text-white/60 text-sm">Accuracy</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleBackToTopics}
                                    className="flex-1 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    Back to Topics
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex-1 py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        // Practice Screen
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Header with Timer */}
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{topic.name}</h2>
                                        <p className="text-white/60 text-sm">{difficulty.toUpperCase()} difficulty</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-2 text-3xl font-bold text-white mb-1">
                                            <Clock className="w-8 h-8 text-primary-400" />
                                            {formatTime(timeSpent)}
                                        </div>
                                        <p className="text-white/60 text-sm">Time Elapsed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <p className="text-2xl font-bold text-white">{problemsSolved}</p>
                                    <p className="text-white/60 text-sm">Solved</p>
                                </div>
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <p className="text-2xl font-bold text-white">{correctAnswers}</p>
                                    <p className="text-white/60 text-sm">Correct</p>
                                </div>
                                <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 text-center">
                                    <p className="text-2xl font-bold text-white">{accuracy}%</p>
                                    <p className="text-white/60 text-sm">Accuracy</p>
                                </div>
                            </div>

                            {/* Practice Interface */}
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 mb-6">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-semibold text-white mb-4">
                                        Practice on your preferred platform
                                    </h3>
                                    <p className="text-white/70 mb-6">
                                        Solve problems on LeetCode, HackerRank, or any platform you prefer, then mark your result below.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => handleSolveProblem(true)}
                                        className="px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Solved Correctly
                                    </button>
                                    <button
                                        onClick={() => handleSolveProblem(false)}
                                        className="px-8 py-4 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        Incorrect/Skipped
                                    </button>
                                </div>
                            </div>

                            {/* End Session Button */}
                            <button
                                onClick={handleEndSession}
                                className="w-full py-4 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                            >
                                End Session
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
