/**
 * Cache Service
 * 
 * Generic caching utilities using Redis
 * Provides get, set, delete, and clear operations with TTL support
 */

import redisClient from '../config/redis.config';

export class CacheService {
    /**
     * Get cached value
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisClient.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set cached value with TTL (time to live)
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
     */
    static async set(key: string, value: any, ttl: number = 300): Promise<boolean> {
        try {
            const serialized = JSON.stringify(value);
            await redisClient.setex(key, ttl, serialized);
            return true;
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete cached value
     */
    static async delete(key: string): Promise<boolean> {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple keys matching a pattern
     * @param pattern - Redis key pattern (e.g., "user:*")
     */
    static async deletePattern(pattern: string): Promise<number> {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length === 0) return 0;
            return await redisClient.del(...keys);
        } catch (error) {
            console.error(`Cache delete pattern error for ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Clear all cached data (use with caution!)
     */
    static async clear(): Promise<boolean> {
        try {
            await redisClient.flushdb();
            return true;
        } catch (error) {
            console.error('Cache clear error:', error);
            return false;
        }
    }

    /**
     * Check if key exists
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Get remaining TTL for a key
     * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
     */
    static async getTTL(key: string): Promise<number> {
        try {
            return await redisClient.ttl(key);
        } catch (error) {
            console.error(`Cache TTL error for key ${key}:`, error);
            return -2;
        }
    }

    /**
     * Increment a numeric value
     */
    static async increment(key: string, amount: number = 1): Promise<number> {
        try {
            return await redisClient.incrby(key, amount);
        } catch (error) {
            console.error(`Cache increment error for key ${key}:`, error);
            return 0;
        }
    }
}
