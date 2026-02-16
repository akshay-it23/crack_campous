/**
 * Dashboard Page
 * Main dashboard for authenticated users
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, TrendingUp, Target, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, setUser, logout } = useAuthStore();
    const navigate = useNavigate();

    // Fetch current user data on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                toast.error('Failed to load user data');
            }
        };

        if (!user) {
            fetchUser();
        }
    }, [user, setUser]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        }
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
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">PrepMaster</h1>
                                <p className="text-xs text-white/60">Smart Placement Prep</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user?.fullName || 'Loading...'}</p>
                                <p className="text-xs text-white/60">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-bold text-white mb-2">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
                    </h2>
                    <p className="text-white/70">
                        Ready to continue your placement preparation journey?
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: Target, label: 'Problems Solved', value: '0', color: 'from-blue-500 to-cyan-500' },
                        { icon: TrendingUp, label: 'Accuracy', value: '0%', color: 'from-purple-500 to-pink-500' },
                        { icon: Clock, label: 'Time Spent', value: '0h', color: 'from-orange-500 to-red-500' },
                        { icon: Award, label: 'Badges Earned', value: '0', color: 'from-green-500 to-emerald-500' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                                style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                            ></div>
                            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-white/70 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Coming Soon Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 border border-white/20 text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Dashboard Features Coming Soon!</h3>
                    <p className="text-white/70 max-w-2xl mx-auto mb-6">
                        We're building an amazing dashboard with practice tracking, AI recommendations,
                        study rooms, leaderboards, and much more. Stay tuned!
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {['Practice Interface', 'AI Recommendations', 'Study Rooms', 'Leaderboard', 'Profile Settings'].map((feature) => (
                            <span
                                key={feature}
                                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 text-sm"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* User Info Card */}
                {user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-8 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Your Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-white/60 text-sm mb-1">Full Name</p>
                                <p className="text-white font-medium">{user.fullName}</p>
                            </div>
                            <div>
                                <p className="text-white/60 text-sm mb-1">Email</p>
                                <p className="text-white font-medium">{user.email}</p>
                            </div>
                            {user.college && (
                                <div>
                                    <p className="text-white/60 text-sm mb-1">College</p>
                                    <p className="text-white font-medium">{user.college}</p>
                                </div>
                            )}
                            {user.graduationYear && (
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Graduation Year</p>
                                    <p className="text-white font-medium">{user.graduationYear}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
