/**
 * Achievement Notification Component
 * Toast-style notifications for achievements and milestones
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    points: number;
    icon?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementNotificationProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export const AchievementNotification = ({ achievement, onClose }: AchievementNotificationProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    const getRarityColor = (rarity?: string) => {
        switch (rarity) {
            case 'legendary':
                return 'from-purple-500 to-pink-500';
            case 'epic':
                return 'from-blue-500 to-purple-500';
            case 'rare':
                return 'from-green-500 to-blue-500';
            default:
                return 'from-yellow-500 to-orange-500';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && achievement && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.8 }}
                    className="fixed top-4 right-4 z-50 max-w-md"
                >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${getRarityColor(achievement.rarity)} opacity-50 blur-2xl`}></div>

                    {/* Notification card */}
                    <div className="relative backdrop-blur-xl bg-slate-900/90 rounded-2xl p-6 border-2 border-yellow-400/50 shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>

                        {/* Content */}
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center flex-shrink-0`}
                            >
                                {achievement.icon ? (
                                    <span className="text-3xl">{achievement.icon}</span>
                                ) : (
                                    <Award className="w-8 h-8 text-white" />
                                )}
                            </motion.div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-white font-bold text-lg">Achievement Unlocked!</h3>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        ✨
                                    </motion.div>
                                </div>
                                <h4 className="text-yellow-400 font-semibold mb-1">{achievement.title}</h4>
                                <p className="text-white/70 text-sm mb-3">{achievement.description}</p>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 font-bold text-sm">+{achievement.points} points</span>
                                </div>
                            </div>
                        </div>

                        {/* Confetti effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 0, x: Math.random() * 100 - 50, opacity: 1 }}
                                    animate={{
                                        y: 100,
                                        x: Math.random() * 200 - 100,
                                        opacity: 0,
                                        rotate: Math.random() * 360,
                                    }}
                                    transition={{ duration: 2, delay: i * 0.1 }}
                                    className="absolute top-0 left-1/2"
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        background: ['#FFD700', '#FFA500', '#FF69B4', '#9370DB'][i % 4],
                                        borderRadius: '50%',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Hook to use achievement notifications
export const useAchievementNotification = () => {
    const [achievement, setAchievement] = useState<Achievement | null>(null);

    const showAchievement = (newAchievement: Achievement) => {
        setAchievement(newAchievement);
    };

    const closeAchievement = () => {
        setAchievement(null);
    };

    return { achievement, showAchievement, closeAchievement };
};
