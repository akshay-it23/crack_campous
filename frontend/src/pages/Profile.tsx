/**
 * Profile Page - User profile and settings
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Mail, School, Calendar, Edit2, Save, X, Award, Target } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { badgeService } from '@/services/badge.service';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        college: user?.college || '',
        graduationYear: user?.graduationYear || '',
    });

    // Fetch user's badges
    const { data: badges = [] } = useQuery({
        queryKey: ['my-badges'],
        queryFn: badgeService.getMyBadges,
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: authService.updateProfile,
        onSuccess: (updatedUser) => {
            setUser(updatedUser);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        },
        onError: () => {
            toast.error('Failed to update profile');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updateData = {
            fullName: formData.fullName,
            college: formData.college,
            graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
        };
        updateProfileMutation.mutate(updateData);
    };

    const handleCancel = () => {
        setFormData({
            fullName: user?.fullName || '',
            college: user?.college || '',
            graduationYear: user?.graduationYear || '',
        });
        setIsEditing(false);
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
                                <User className="w-6 h-6 text-white" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Profile</h1>
                                <p className="text-xs text-white/60">Manage your account</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 mb-8"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user?.fullName}</h2>
                                <p className="text-white/60">{user?.email}</p>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                                    required
                                />
                            </div>

                            {/* College */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">College</label>
                                <input
                                    type="text"
                                    value={formData.college}
                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                                />
                            </div>

                            {/* Graduation Year */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Graduation Year</label>
                                <input
                                    type="number"
                                    value={formData.graduationYear}
                                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                                    min="2020"
                                    max="2030"
                                    className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary-400" />
                                <div>
                                    <p className="text-white/60 text-sm">Email</p>
                                    <p className="text-white font-medium">{user?.email}</p>
                                </div>
                            </div>
                            {user?.college && (
                                <div className="flex items-center gap-3">
                                    <School className="w-5 h-5 text-primary-400" />
                                    <div>
                                        <p className="text-white/60 text-sm">College</p>
                                        <p className="text-white font-medium">{user.college}</p>
                                    </div>
                                </div>
                            )}
                            {user?.graduationYear && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-primary-400" />
                                    <div>
                                        <p className="text-white/60 text-sm">Graduation Year</p>
                                        <p className="text-white font-medium">{user.graduationYear}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Badges Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Award className="w-6 h-6 text-primary-400" />
                        Your Badges
                    </h3>

                    {badges.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {badges.map((userBadge, index) => (
                                <motion.div
                                    key={userBadge.badgeId._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all text-center"
                                >
                                    <div className="text-4xl mb-2">{userBadge.badgeId.icon}</div>
                                    <h4 className="text-white font-semibold text-sm mb-1">{userBadge.badgeId.name}</h4>
                                    <p className="text-white/60 text-xs mb-2">{userBadge.badgeId.description}</p>
                                    <div className="flex items-center justify-center gap-1 text-primary-400 text-xs">
                                        <Target className="w-3 h-3" />
                                        <span>{userBadge.badgeId.points} pts</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-white/40" />
                            </div>
                            <p className="text-white/60">No badges earned yet</p>
                            <p className="text-white/40 text-sm mt-2">Keep practicing to earn badges!</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
