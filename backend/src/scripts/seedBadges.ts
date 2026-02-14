/**
 * Seed Badge Definitions
 * 
 * Populates the database with initial badge definitions.
 * Run with: npm run seed:badges
 */

import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Badge } from '../models/Badge';

dotenv.config();

const badges = [
    // Milestone Badges
    {
        badgeId: 'first_blood',
        name: 'First Blood',
        description: 'Solve your first question',
        category: 'milestone',
        criteria: { type: 'solve_count', value: 1 },
        iconUrl: '/badges/first_blood.png',
        rarity: 'common',
        points: 10,
    },
    {
        badgeId: 'decade',
        name: 'Decade',
        description: 'Solve 10 questions',
        category: 'milestone',
        criteria: { type: 'solve_count', value: 10 },
        iconUrl: '/badges/decade.png',
        rarity: 'common',
        points: 25,
    },
    {
        badgeId: 'half_century',
        name: 'Half Century',
        description: 'Solve 50 questions',
        category: 'milestone',
        criteria: { type: 'solve_count', value: 50 },
        iconUrl: '/badges/half_century.png',
        rarity: 'rare',
        points: 50,
    },
    {
        badgeId: 'century_club',
        name: 'Century Club',
        description: 'Solve 100 questions',
        category: 'milestone',
        criteria: { type: 'solve_count', value: 100 },
        iconUrl: '/badges/century.png',
        rarity: 'epic',
        points: 100,
    },
    {
        badgeId: 'legend',
        name: 'Legend',
        description: 'Solve 500 questions',
        category: 'milestone',
        criteria: { type: 'solve_count', value: 500 },
        iconUrl: '/badges/legend.png',
        rarity: 'legendary',
        points: 500,
    },

    // Consistency Badges
    {
        badgeId: 'getting_started',
        name: 'Getting Started',
        description: 'Practice for 3 consecutive days',
        category: 'consistency',
        criteria: { type: 'streak_days', value: 3 },
        iconUrl: '/badges/streak_3.png',
        rarity: 'common',
        points: 15,
    },
    {
        badgeId: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'consistency',
        criteria: { type: 'streak_days', value: 7 },
        iconUrl: '/badges/streak_7.png',
        rarity: 'rare',
        points: 50,
    },
    {
        badgeId: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        category: 'consistency',
        criteria: { type: 'streak_days', value: 30 },
        iconUrl: '/badges/streak_30.png',
        rarity: 'epic',
        points: 150,
    },
    {
        badgeId: 'dedication',
        name: 'Dedication',
        description: 'Maintain a 100-day streak',
        category: 'consistency',
        criteria: { type: 'streak_days', value: 100 },
        iconUrl: '/badges/streak_100.png',
        rarity: 'legendary',
        points: 500,
    },

    // Mastery Badges
    {
        badgeId: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100% accuracy (min 10 questions)',
        category: 'mastery',
        criteria: { type: 'accuracy', value: 100 },
        iconUrl: '/badges/perfect.png',
        rarity: 'epic',
        points: 100,
    },
    {
        badgeId: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Achieve 90% overall accuracy',
        category: 'mastery',
        criteria: { type: 'accuracy', value: 90 },
        iconUrl: '/badges/accuracy_90.png',
        rarity: 'rare',
        points: 75,
    },

    // Special Badges
    {
        badgeId: 'early_bird',
        name: 'Early Bird',
        description: 'Practice before 6 AM',
        category: 'special',
        criteria: { type: 'time_based', value: 1 },
        iconUrl: '/badges/early_bird.png',
        rarity: 'rare',
        points: 25,
    },
    {
        badgeId: 'night_owl',
        name: 'Night Owl',
        description: 'Practice after 10 PM',
        category: 'special',
        criteria: { type: 'time_based', value: 1 },
        iconUrl: '/badges/night_owl.png',
        rarity: 'rare',
        points: 25,
    },
    {
        badgeId: 'speed_demon',
        name: 'Speed Demon',
        description: 'Solve 10 questions in one day',
        category: 'special',
        criteria: { type: 'time_based', value: 10 },
        iconUrl: '/badges/speed.png',
        rarity: 'epic',
        points: 50,
    },
];

const seedBadges = async () => {
    try {
        console.log('🌱 Seeding badges...');

        await connectDB();

        // Clear existing badges
        await Badge.deleteMany({});
        console.log('🗑️  Cleared existing badges');

        // Insert new badges
        await Badge.insertMany(badges);
        console.log(`✅ Successfully seeded ${badges.length} badges`);

        // Display badges by category
        const categories = ['milestone', 'consistency', 'mastery', 'special'];
        for (const category of categories) {
            const count = badges.filter(b => b.category === category).length;
            console.log(`   - ${category}: ${count} badges`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding badges:', error);
        process.exit(1);
    }
};

seedBadges();
