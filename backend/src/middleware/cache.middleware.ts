/**
 * Cache Middleware
 * 
 * Express middleware for automatic response caching
 */

import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';

/**
 * Cache middleware factory
 * @param ttl - Time to live in seconds
 * @param keyPrefix - Prefix for cache key (default: route path)
 */
export const cacheMiddleware = (ttl: number = 300, keyPrefix?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key from route and query params
        const key = keyPrefix
            ? `${keyPrefix}:${req.originalUrl}`
            : `cache:${req.originalUrl}`;

        try {
            // Check if cached data exists
            const cachedData = await CacheService.get(key);
            if (cachedData) {
                console.log(`✅ Cache HIT: ${key}`);
                return res.json(cachedData);
            }

            console.log(`❌ Cache MISS: ${key}`);

            // Store original res.json function
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = (data: any) => {
                // Cache the response
                CacheService.set(key, data, ttl).catch((err) => {
                    console.error('Cache set error:', err);
                });

                // Send the response
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

/**
 * Clear cache for specific pattern
 */
export const clearCache = (pattern: string) => {
    return async (_req: Request, _res: Response, next: NextFunction) => {
        try {
            await CacheService.deletePattern(pattern);
            console.log(`🗑️  Cache cleared: ${pattern}`);
        } catch (error) {
            console.error('Clear cache error:', error);
        }
        next();
    };
};
