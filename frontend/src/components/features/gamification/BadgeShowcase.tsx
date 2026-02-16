/**
 * Badge Showcase Component
 * Displays all available and earned badges
 */

import { motion } from 'framer-motion';
import { Award, Lock, Star } from 'lucide-react';
import type { UserBadge } from '@/types';

interface BadgeShowcaseProps {
    badges: UserBadge[];
    allBadges?: any[];
}

export const BadgeShowcase = ({ badges }: BadgeShowcaseProps) => {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary':
                return 'from-purple-500 to-pink-500';
            case 'epic':
                return 'from-blue-500 to-purple-500';
            case 'rare':
                return 'from-green-500 to-blue-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const getRarityIcon = (rarity: string) => {
        switch (rarity) {
            case 'legendary':
                return '👑';
            case 'epic':
                return '💎';
            case 'rare':
                return '⭐';
            default:
                return '🏅';
        }
    };

    return (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Badge Collection
                </h3>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white/70 text-sm font-semibold">
                    {badges.length} earned
                </span>
            </div>

            {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((userBadge, index) => {
                        const badge = userBadge.badge;
                        return (
                            <motion.div
                                key={userBadge._id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                className="group relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(badge?.rarity || 'common')} opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl blur-lg`}></div>
                                <div className="relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(badge?.rarity || 'common')} flex items-center justify-center mb-3`}>
                                        <span className="text-3xl">{getRarityIcon(badge?.rarity || 'common')}</span>
                                    </div>
                                    <h4 className="text-white text-sm font-semibold text-center mb-1">
                                        {badge?.name || 'Badge'}
                                    </h4>
                                    <p className="text-white/60 text-xs text-center mb-2 line-clamp-2">
                                        {badge?.description || 'Achievement unlocked'}
                                    </p>
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-400" />
                                        <span className="text-yellow-400 text-xs font-bold">{badge?.points || 0} pts</span>
                                    </div>
                                    <p className="text-white/40 text-xs text-center mt-2">
                                        {new Date(userBadge.earnedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-10 h-10 text-white/40" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">No badges yet</h4>
                    <p className="text-white/60 text-sm">Complete challenges to earn your first badge!</p>
                </div>
            )}
        </div>
    );
};
