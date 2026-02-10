/**
 * Zod Validation Schemas
 * 
 * Zod provides runtime type validation for incoming API requests.
 * 
 * Why Zod?
 * - Runtime validation (TypeScript only validates at compile time)
 * - Automatic error messages
 * - Type inference (TypeScript types derived from Zod schemas)
 * - Composable (can reuse schemas)
 * 
 * TypeScript vs Zod:
 * - TypeScript: Compile-time type checking (catches errors before runtime)
 * - Zod: Runtime validation (validates actual user input from API)
 * - Use both for maximum safety!
 */

import { z } from 'zod';

/**
 * Registration Schema
 * 
 * Validates user registration data
 * 
 * Validation rules:
 * - email: Must be valid email format
 * - password: Min 8 chars, must contain uppercase, lowercase, and digit
 * - fullName: Min 2 chars
 * - college: Optional string
 * - graduationYear: Optional number between 2020-2030
 * - targetCompanies: Optional array of strings
 * 
 * Why these rules?
 * - Email format: Prevents typos, ensures deliverability
 * - Password complexity: Basic security (prevents "password123")
 * - Graduation year range: Catches obvious errors
 */
export const registerSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),

    password: z
        .string({
            required_error: 'Password is required',
        })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one digit'),

    fullName: z
        .string({
            required_error: 'Full name is required',
        })
        .min(2, 'Full name must be at least 2 characters')
        .trim(),

    college: z.string().trim().optional(),

    graduationYear: z
        .number()
        .int('Graduation year must be an integer')
        .min(2020, 'Graduation year must be 2020 or later')
        .max(2030, 'Graduation year must be 2030 or earlier')
        .optional(),

    targetCompanies: z.array(z.string()).optional().default([]),
});

/**
 * Login Schema
 * 
 * Simple email + password validation
 * No complexity checks here (we validate against database)
 */
export const loginSchema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .email('Invalid email format')
        .toLowerCase()
        .trim(),

    password: z.string({
        required_error: 'Password is required',
    }),
});

/**
 * Update Profile Schema
 * 
 * All fields optional (user can update just one field)
 * Same validation rules as registration for provided fields
 * 
 * Why .partial()?
 * - Makes all fields optional
 * - User can send { college: "MIT" } without other fields
 */
export const updateProfileSchema = z
    .object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
        college: z.string().trim(),
        graduationYear: z
            .number()
            .int('Graduation year must be an integer')
            .min(2020, 'Graduation year must be 2020 or later')
            .max(2030, 'Graduation year must be 2030 or earlier'),
        targetCompanies: z.array(z.string()),
    })
    .partial(); // All fields optional

/**
 * Refresh Token Schema
 * 
 * Validates refresh token request
 */
export const refreshTokenSchema = z.object({
    refreshToken: z.string({
        required_error: 'Refresh token is required',
    }),
});

/**
 * Type Inference
 * 
 * Zod can infer TypeScript types from schemas
 * This ensures Zod schemas and TypeScript types stay in sync
 * 
 * Usage:
 *   type RegisterInput = z.infer<typeof registerSchema>;
 *   // RegisterInput = { email: string; password: string; ... }
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
