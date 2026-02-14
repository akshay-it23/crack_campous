/**
 * Cron Jobs for Gamification
 * 
 * Scheduled tasks:
 * 1. Generate daily challenges (midnight)
 * 2. Update leaderboard cache (every 15 minutes)
 */

import cron from 'node-cron';
import * as challengeService from '../services/challenge.service';
import * as leaderboardService from '../services/leaderboard.service';

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = (): void => {
    console.log('⏰ Initializing cron jobs...');

    // Daily challenge generation - runs at midnight (00:00) every day
    cron.schedule('0 0 * * *', async () => {
        console.log('🎯 Running daily challenge generation...');
        try {
            await challengeService.generateChallengesForAllUsers();
        } catch (error) {
            console.error('❌ Error generating daily challenges:', error);
        }
    });

    // Leaderboard cache update - runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('🏆 Running leaderboard cache update...');
        try {
            await leaderboardService.updateLeaderboardCache();
        } catch (error) {
            console.error('❌ Error updating leaderboard cache:', error);
        }
    });

    console.log('✅ Cron jobs initialized');
    console.log('   - Daily challenges: 00:00 (midnight)');
    console.log('   - Leaderboard update: Every 15 minutes');
};
