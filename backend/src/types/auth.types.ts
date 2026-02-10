/**
 * TypeScript Type Definitions for Authentication
 * 
 * This file defines all TypeScript interfaces and types used across the auth system.
 * 
 * Why separate types file?
 * - Reusable across multiple files
 * - Single source of truth for data structures
 * - Better IDE autocomplete
 * - Catches type errors at compile time
 * 
 * Note: These are compile-time types only (removed after compilation)
 * For runtime validation, we use Zod schemas
 */

import { Document } from 'mongoose';

/**
 * User Document Interface
 * 
 * Extends Mongoose Document to include our custom fields
 * This represents a user document in MongoDB
 */
export interface IUser extends Document {
    _id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    college?: string;
    graduationYear?: number;
    targetCompanies?: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Refresh Token Document Interface
 * 
 * Represents a refresh token stored in MongoDB
 * Used for logout and token revocation
 */
export interface IRefreshToken extends Document {
    _id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}

/**
 * Registration Request DTO (Data Transfer Object)
 * 
 * Shape of data when user registers
 * Validated by Zod before reaching service layer
 */
export interface RegisterDTO {
    email: string;
    password: string;
    fullName: string;
    college?: string;
    graduationYear?: number;
    targetCompanies?: string[];
}

/**
 * Login Request DTO
 * 
 * Simple email + password for login
 */
export interface LoginDTO {
    email: string;
    password: string;
}

/**
 * Update Profile DTO
 * 
 * All fields optional (user can update just one field)
 */
export interface UpdateProfileDTO {
    fullName?: string;
    college?: string;
    graduationYear?: number;
    targetCompanies?: string[];
}

/**
 * JWT Token Payload
 * 
 * Data stored inside the JWT token
 * 
 * Fields:
 * - userId: User's MongoDB _id
 * - iat: Issued at (timestamp)
 * - exp: Expiry (timestamp)
 */
export interface TokenPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

/**
 * Authentication Response
 * 
 * Returned after successful login/registration
 * Contains user data + tokens
 */
export interface AuthResponse {
    user: UserResponse;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
}

/**
 * User Response (Public Profile)
 * 
 * User data sent to client
 * Notice: NO passwordHash field (security!)
 */
export interface UserResponse {
    _id: string;
    email: string;
    fullName: string;
    college?: string;
    graduationYear?: number;
    targetCompanies?: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Express Request with User
 * 
 * Extends Express Request to include authenticated user
 * Used in protected routes after JWT verification
 * 
 * Usage:
 *   const getUserProfile = (req: AuthRequest, res: Response) => {
 *     const userId = req.user.userId; // TypeScript knows this exists!
 *   }
 */
export interface AuthRequest extends Request {
    user?: TokenPayload;
}
