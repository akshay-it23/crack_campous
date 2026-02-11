/**
 * Database Seeding Script for Topics
 * 
 * This script populates the database with predefined topics.
 * Run once during initial setup: npm run seed:topics
 * 
 * Topics are organized by category:
 * - DSA (Data Structures & Algorithms)
 * - System Design
 * - Aptitude
 */

import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Topic } from '../models/Topic';

// Load environment variables
dotenv.config();

/**
 * Predefined topics to seed
 */
const topics = [
    // DSA Topics
    {
        name: 'Arrays',
        category: 'DSA',
        difficulty: 'Beginner',
        recommendedQuestions: 50,
        description: 'Master array manipulation, searching, sorting, and common patterns like two pointers and sliding window.',
    },
    {
        name: 'Strings',
        category: 'DSA',
        difficulty: 'Beginner',
        recommendedQuestions: 40,
        description: 'Learn string manipulation, pattern matching, and common algorithms like KMP and Rabin-Karp.',
    },
    {
        name: 'Linked Lists',
        category: 'DSA',
        difficulty: 'Intermediate',
        recommendedQuestions: 30,
        description: 'Understand singly and doubly linked lists, reversal, cycle detection, and merge operations.',
    },
    {
        name: 'Stacks & Queues',
        category: 'DSA',
        difficulty: 'Intermediate',
        recommendedQuestions: 25,
        description: 'Implement stacks and queues, solve problems using monotonic stacks and deques.',
    },
    {
        name: 'Trees',
        category: 'DSA',
        difficulty: 'Intermediate',
        recommendedQuestions: 35,
        description: 'Binary trees, BST, tree traversals, LCA, and common tree patterns.',
    },
    {
        name: 'Graphs',
        category: 'DSA',
        difficulty: 'Advanced',
        recommendedQuestions: 30,
        description: 'Graph representations, BFS, DFS, shortest paths, MST, and topological sorting.',
    },
    {
        name: 'Dynamic Programming',
        category: 'DSA',
        difficulty: 'Advanced',
        recommendedQuestions: 40,
        description: 'Master DP patterns: 1D/2D DP, knapsack, LIS, LCS, and state machine DP.',
    },
    {
        name: 'Greedy Algorithms',
        category: 'DSA',
        difficulty: 'Advanced',
        recommendedQuestions: 25,
        description: 'Learn greedy choice property, activity selection, and interval scheduling.',
    },
    {
        name: 'Hashing',
        category: 'DSA',
        difficulty: 'Beginner',
        recommendedQuestions: 20,
        description: 'Hash maps, hash sets, and solving problems with O(1) lookups.',
    },
    {
        name: 'Recursion & Backtracking',
        category: 'DSA',
        difficulty: 'Intermediate',
        recommendedQuestions: 30,
        description: 'Recursive thinking, backtracking patterns, and pruning techniques.',
    },

    // System Design Topics
    {
        name: 'Low-Level Design',
        category: 'System Design',
        difficulty: 'Intermediate',
        recommendedQuestions: 10,
        description: 'Object-oriented design, design patterns, and class diagrams for real-world systems.',
    },
    {
        name: 'High-Level Design',
        category: 'System Design',
        difficulty: 'Advanced',
        recommendedQuestions: 10,
        description: 'Scalability, load balancing, caching, databases, and distributed systems.',
    },

    // Aptitude Topics
    {
        name: 'Quantitative Aptitude',
        category: 'Aptitude',
        difficulty: 'Beginner',
        recommendedQuestions: 50,
        description: 'Number systems, percentages, ratios, time and work, profit and loss.',
    },
    {
        name: 'Logical Reasoning',
        category: 'Aptitude',
        difficulty: 'Beginner',
        recommendedQuestions: 40,
        description: 'Puzzles, blood relations, seating arrangements, and logical deductions.',
    },
    {
        name: 'Verbal Ability',
        category: 'Aptitude',
        difficulty: 'Beginner',
        recommendedQuestions: 30,
        description: 'Reading comprehension, grammar, vocabulary, and sentence correction.',
    },
];

/**
 * Seed the database
 */
const seedTopics = async (): Promise<void> => {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await connectDB();

        // Clear existing topics (optional - comment out if you want to keep existing data)
        const existingCount = await Topic.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing topics. Clearing...`);
            await Topic.deleteMany({});
            console.log('✅ Cleared existing topics');
        }

        // Insert topics
        console.log(`📝 Inserting ${topics.length} topics...`);
        const inserted = await Topic.insertMany(topics);
        console.log(`✅ Successfully inserted ${inserted.length} topics`);

        // Display summary
        const categories = [...new Set(topics.map((t) => t.category))];
        console.log('\n📊 Summary by category:');
        for (const category of categories) {
            const count = topics.filter((t) => t.category === category).length;
            console.log(`  ${category}: ${count} topics`);
        }

        console.log('\n🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeding
seedTopics();
