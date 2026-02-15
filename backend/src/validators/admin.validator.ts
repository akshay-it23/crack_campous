/**
 * Admin Validators
 * 
 * Zod schemas for validating admin-related requests
 */

import { z } from 'zod';
import { AdminRole, AdminPermission } from '../types/admin.types';

/**
 * Admin Login Validator
 */
export const adminLoginSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
});

/**
 * Admin Creation Validator
 */
export const adminCreateSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name is too long'),
    role: z.nativeEnum(AdminRole),
    permissions: z
        .array(z.nativeEnum(AdminPermission))
        .optional(),
});

/**
 * Admin Update Validator
 */
export const adminUpdateSchema = z.object({
    email: z
        .string()
        .email('Invalid email format')
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .optional(),
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name is too long')
        .optional(),
    role: z.nativeEnum(AdminRole).optional(),
    permissions: z
        .array(z.nativeEnum(AdminPermission))
        .optional(),
    isActive: z.boolean().optional(),
});

/**
 * Admin Profile Update Validator (for self-update)
 */
export const adminProfileUpdateSchema = z.object({
    fullName: z
        .string()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name is too long')
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .optional(),
});

/**
 * Permission Check Validator
 */
export const permissionCheckSchema = z.object({
    permission: z.nativeEnum(AdminPermission),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
export type AdminProfileUpdateInput = z.infer<typeof adminProfileUpdateSchema>;
