/**
 * Redis Configuration
 * 
 * Configures Redis client for caching and session management
 * Supports both local Redis and cloud services (Upstash, Redis Cloud)
 */

import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Connection event handlers
redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redisClient.on('error', (error) => {
    console.error('❌ Redis connection error:', error.message);
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await redisClient.quit();
    console.log('Redis connection closed');
});

export default redisClient;
