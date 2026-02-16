/**
 * Progress Tracker Component
 * Track and update user progress in study room
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target } from 'lucide-react';

interface ProgressTrackerProps {
    currentProgress: number;
    onUpdateProgress: (progress: number) => void;
}

export const ProgressTracker = ({ currentProgress, onUpdateProgress }: ProgressTrackerProps) => {
    const [progress, setProgress] = useState(currentProgress);

    const handleUpdate = () => {
        onUpdateProgress(progress);
    };

    return (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Progress
            </h3>

            {/* Progress Display */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Current Progress</span>
                    <span className="text-2xl font-bold text-white">{currentProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentProgress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary-400 to-accent-500"
                    ></motion.div>
                </div>
            </div>

            {/* Update Progress */}
            <div className="space-y-4">
                <div>
                    <label className="block text-white/70 text-sm mb-2">
                        Update Progress: {progress}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(parseInt(e.target.value))}
                        className="w-full accent-primary-400"
                    />
                </div>

                <button
                    onClick={handleUpdate}
                    disabled={progress === currentProgress}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    <TrendingUp className="w-5 h-5" />
                    Update Progress
                </button>
            </div>
        </div>
    );
};
