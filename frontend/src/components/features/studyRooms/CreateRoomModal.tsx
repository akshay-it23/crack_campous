/**
 * Create Room Modal Component
 * Modal form for creating new study rooms
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Lock, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { topicService } from '@/services/topic.service';
import type { CreateRoomData } from '@/types';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateRoomData) => void;
    isCreating?: boolean;
}

export const CreateRoomModal = ({ isOpen, onClose, onCreate, isCreating = false }: CreateRoomModalProps) => {
    const [formData, setFormData] = useState<CreateRoomData>({
        name: '',
        topicId: '',
        maxParticipants: 10,
        isPublic: true,
        password: '',
    });

    // Fetch topics for selection
    const { data: topics = [] } = useQuery({
        queryKey: ['topics'],
        queryFn: topicService.getAllTopics,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = { ...formData };
        if (formData.isPublic) {
            delete submitData.password;
        }
        onCreate(submitData);
    };

    const handleClose = () => {
        setFormData({
            name: '',
            topicId: '',
            maxParticipants: 10,
            isPublic: true,
            password: '',
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Create Study Room</h2>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Room Name */}
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Room Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., DSA Study Group"
                                        className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                                        required
                                    />
                                </div>

                                {/* Topic Selection */}
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Topic</label>
                                    <select
                                        value={formData.topicId}
                                        onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary-400 transition-all"
                                        required
                                    >
                                        <option value="" className="bg-slate-800">Select a topic</option>
                                        {topics.map((topic) => (
                                            <option key={topic._id} value={topic._id} className="bg-slate-800">
                                                {topic.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Max Participants */}
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">
                                        Max Participants: {formData.maxParticipants}
                                    </label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="50"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                                        <Users className="w-4 h-4" />
                                        <span>2 - 50 participants</span>
                                    </div>
                                </div>

                                {/* Public/Private Toggle */}
                                <div>
                                    <label className="block text-white/70 text-sm mb-2">Room Type</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPublic: true, password: '' })}
                                            className={`flex-1 py-3 rounded-lg border transition-all ${formData.isPublic
                                                    ? 'bg-gradient-to-r from-primary-400 to-accent-500 border-transparent text-white'
                                                    : 'bg-white/10 border-white/20 text-white/70'
                                                }`}
                                        >
                                            <Globe className="w-5 h-5 mx-auto mb-1" />
                                            <span className="text-sm font-semibold">Public</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPublic: false })}
                                            className={`flex-1 py-3 rounded-lg border transition-all ${!formData.isPublic
                                                    ? 'bg-gradient-to-r from-primary-400 to-accent-500 border-transparent text-white'
                                                    : 'bg-white/10 border-white/20 text-white/70'
                                                }`}
                                        >
                                            <Lock className="w-5 h-5 mx-auto mb-1" />
                                            <span className="text-sm font-semibold">Private</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Password (if private) */}
                                {!formData.isPublic && (
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Enter room password"
                                            className="w-full px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                                            required={!formData.isPublic}
                                        />
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isCreating ? 'Creating...' : 'Create Room'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
