/**
 * Practice Validation Schemas
 * 
 * Zod schemas for validating practice-related API requests.
 */

import { z } from 'zod';

/**
 * Log Practice Schema
 * 
 * Validates practice session logging request
 */
export const logPracticeSchema = z.object({
    topicId: z
        .string({
            required_error: 'Topic ID is required',
        })
        .min(1, 'Topic ID cannot be empty'),

    questionTitle: z
        .string({
            required_error: 'Question title is required',
        })
        .min(1, 'Question title cannot be empty')
        .max(200, 'Question title too long')
        .trim(),

    questionUrl: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')), // Allow empty string

    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        required_error: 'Difficulty is required',
        invalid_type_error: 'Difficulty must be Easy, Medium, or Hard',
    }),

    timeSpentMinutes: z
        .number({
            required_error: 'Time spent is required',
            invalid_type_error: 'Time spent must be a number',
        })
        .int('Time must be a whole number')
        .min(1, 'Time must be at least 1 minute')
        .max(300, 'Time cannot exceed 300 minutes (5 hours)'),

    solved: z.boolean({
        required_error: 'Solved status is required',
        invalid_type_error: 'Solved must be true or false',
    }),

    notes: z
        .string()
        .max(500, 'Notes cannot exceed 500 characters')
        .optional(),

    practicedAt: z
        .string()
        .datetime('Invalid date format')
        .transform((str) => new Date(str))
        .optional(),
});

/**
 * Get Practice History Query Schema
 * 
 * Validates query parameters for fetching practice history
 */
export const getPracticeHistorySchema = z.object({
    topicId: z.string().optional(),

    limit: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100))
        .optional()
        .default('20'),

    skip: z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(0))
        .optional()
        .default('0'),
});

/**
 * Get Practice Stats Query Schema
 * 
 * Validates query parameters for fetching statistics
 */
export const getPracticeStatsSchema = z.object({
    topicId: z.string().optional(),
});

/**
 * Type Inference
 */
export type LogPracticeInput = z.infer<typeof logPracticeSchema>;
export type GetPracticeHistoryInput = z.infer<typeof getPracticeHistorySchema>;
export type GetPracticeStatsInput = z.infer<typeof getPracticeStatsSchema>;
