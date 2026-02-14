/**
 * Mongoose Models for User and RefreshToken
 * 
 * These models define the MongoDB schema and provide an interface to interact with the database.
 * 
 * Why Mongoose schemas?
 * - Data validation (ensures email is string, graduationYear is number, etc.)
 * - Default values (createdAt, updatedAt auto-generated)
 * - Indexes (fast lookups by email, tokenHash)
 * - Middleware hooks (can run code before/after save, update, etc.)
 * 
 * Schema vs Model:
 * - Schema: Blueprint of the document structure
 * - Model: Constructor function to create/query documents
 */

import mongoose, { Schema } from 'mongoose';
import { IUser, IRefreshToken } from '../types/auth.types';

/**
 * User Schema
 * 
 * Defines the structure of user documents in MongoDB
 * 
 * Fields:
 * - email: Unique, lowercase, required (indexed for fast login queries)
 * - passwordHash: Hashed password (NEVER store plain passwords!)
 * - fullName: User's full name
 * - college: Optional college name
 * - graduationYear: Optional year (2020-2030 range validated in Zod)
 * - targetCompanies: Array of company names user is targeting
 * 
 * Timestamps:
 * - createdAt: Auto-generated when document is created
 * - updatedAt: Auto-updated when document is modified
 * 
 * Why unique email?
 * - Prevents duplicate accounts
 * - Email is the login identifier
 * 
 * Why lowercase email?
 * - Prevents case-sensitivity issues (user@example.com === USER@EXAMPLE.COM)
 */
const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true, // Convert to lowercase before saving
            trim: true, // Remove whitespace
            index: true, // Create index for fast lookups
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required'],
            select: false, // Don't include in queries by default (security)
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        college: {
            type: String,
            trim: true,
        },
        graduationYear: {
            type: Number,
            min: [2020, 'Graduation year must be 2020 or later'],
            max: [2030, 'Graduation year must be 2030 or earlier'],
        },
        targetCompanies: {
            type: [String],
            default: [],
        },
        gamification: {
            totalPoints: {
                type: Number,
                default: 0,
                min: [0, 'Points cannot be negative'],
            },
            currentStreak: {
                type: Number,
                default: 0,
                min: [0, 'Streak cannot be negative'],
            },
            longestStreak: {
                type: Number,
                default: 0,
                min: [0, 'Longest streak cannot be negative'],
            },
            lastPracticeDate: {
                type: Date,
            },
            level: {
                type: Number,
                default: 1,
                min: [1, 'Level must be at least 1'],
            },
            badgesEarned: {
                type: Number,
                default: 0,
                min: [0, 'Badges earned cannot be negative'],
            },
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
        versionKey: false, // Disable __v field
    }
);

/**
 * Indexes for performance
 * 
 * email: Already indexed via schema (index: true)
 * Additional compound indexes can be added here if needed
 */

/**
 * Refresh Token Schema
 * 
 * Stores refresh tokens for logout functionality
 * 
 * Fields:
 * - userId: Reference to User document (foreign key)
 * - tokenHash: Hashed refresh token (we don't store plain tokens!)
 * - expiresAt: When this token expires
 * 
 * Why store refresh tokens?
 * - Enables logout (delete token from DB = token becomes invalid)
 * - Can revoke all tokens for a user (e.g., on password change)
 * - Audit trail (see when user logged in)
 * 
 * Why hash the token?
 * - If database is compromised, attacker can't use tokens
 * - Defense in depth: Even if DB leaks, tokens are useless
 */
const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User', // Reference to User model
            index: true, // Fast lookups by user
        },
        tokenHash: {
            type: String,
            required: [true, 'Token hash is required'],
            index: true, // Fast lookups when validating token
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiry date is required'],
            index: true, // Fast cleanup of expired tokens
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
        versionKey: false,
    }
);

/**
 * Cleanup expired tokens automatically
 * 
 * MongoDB TTL (Time To Live) index
 * Automatically deletes documents where expiresAt < current time
 * Runs every 60 seconds
 * 
 * Why TTL index?
 * - Automatic cleanup (no manual cron job needed)
 * - Keeps database size small
 * - Improves query performance
 */
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Export Models
 * 
 * These are constructor functions to create/query documents
 * 
 * Usage:
 *   const user = await User.findOne({ email: 'test@example.com' });
 *   const newUser = new User({ email: '...', passwordHash: '...' });
 *   await newUser.save();
 */
export const User = mongoose.model<IUser>('User', UserSchema);
export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
