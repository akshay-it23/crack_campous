/**
 * Authentication Service - Business Logic Layer
 * 
 * This module contains all authentication-related business logic.
 * It's separated from the API routes for better testability and reusability.
 * 
 * Why separate service layer?
 * - Business logic independent of HTTP (can be used in CLI, tests, etc.)
 * - Easy to unit test (no need to mock HTTP requests)
 * - Single responsibility: Routes handle HTTP, services handle business logic
 * - Reusable: Multiple routes can call the same service function
 */

import crypto from 'crypto';
import { User, RefreshToken } from '../models/User';
import { RegisterDTO, LoginDTO, UpdateProfileDTO, AuthResponse, UserResponse } from '../types/auth.types';
import {
    hashPassword,
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
} from '../utils/jwt';

/**
 * Register a new user
 * 
 * Steps:
 * 1. Check if email already exists
 * 2. Hash the password
 * 3. Create user in MongoDB
 * 4. Generate access + refresh tokens
 * 5. Store refresh token hash in database
 * 6. Return user + tokens
 * 
 * @param data - Registration data (validated by Zod)
 * @returns User profile + tokens
 * @throws Error if email already exists
 */
export const registerUser = async (data: RegisterDTO): Promise<AuthResponse> => {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = new User({
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        college: data.college,
        graduationYear: data.graduationYear,
        targetCompanies: data.targetCompanies || [],
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token hash
    await storeRefreshToken(user._id.toString(), refreshToken);

    // Return user + tokens (exclude passwordHash)
    const userResponse: UserResponse = {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        college: user.college,
        graduationYear: user.graduationYear,
        targetCompanies: user.targetCompanies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    return {
        user: userResponse,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
    };
};

/**
 * Login user with email and password
 * 
 * Steps:
 * 1. Find user by email
 * 2. Verify password
 * 3. Generate tokens
 * 4. Store refresh token
 * 5. Return tokens
 * 
 * @param data - Login credentials
 * @returns Tokens
 * @throws Error if credentials invalid
 */
export const loginUser = async (data: LoginDTO): Promise<AuthResponse> => {
    // Find user (include passwordHash for verification)
    const user = await User.findOne({ email: data.email }).select('+passwordHash');

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Store refresh token
    await storeRefreshToken(user._id.toString(), refreshToken);

    // Return user + tokens
    const userResponse: UserResponse = {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        college: user.college,
        graduationYear: user.graduationYear,
        targetCompanies: user.targetCompanies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    return {
        user: userResponse,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
    };
};

/**
 * Refresh access token using refresh token
 * 
 * Steps:
 * 1. Verify refresh token (JWT validation)
 * 2. Check if token exists in database
 * 3. Check if expired
 * 4. Generate new access token
 * 
 * @param refreshToken - Refresh token from client
 * @returns New access token
 * @throws Error if token invalid or expired
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    // Hash token to compare with database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find token in database
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (!storedToken) {
        throw new Error('Invalid or revoked refresh token');
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
        // Delete expired token
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new Error('Refresh token expired');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(storedToken.userId);

    return newAccessToken;
};

/**
 * Logout user by invalidating refresh token
 * 
 * @param refreshToken - Refresh token to invalidate
 * @returns Success boolean
 */
export const logoutUser = async (refreshToken: string): Promise<boolean> => {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await RefreshToken.deleteOne({ tokenHash });

    return true;
};

/**
 * Get user by ID
 * 
 * @param userId - User's MongoDB _id
 * @returns User profile
 * @throws Error if user not found
 */
export const getUserById = async (userId: string): Promise<UserResponse> => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    return {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        college: user.college,
        graduationYear: user.graduationYear,
        targetCompanies: user.targetCompanies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

/**
 * Update user profile
 * 
 * @param userId - User's MongoDB _id
 * @param data - Fields to update
 * @returns Updated user profile
 * @throws Error if user not found
 */
export const updateUserProfile = async (
    userId: string,
    data: UpdateProfileDTO
): Promise<UserResponse> => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true, runValidators: true } // Return updated doc, run validators
    );

    if (!user) {
        throw new Error('User not found');
    }

    return {
        _id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        college: user.college,
        graduationYear: user.graduationYear,
        targetCompanies: user.targetCompanies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

/**
 * Helper: Store refresh token in database
 * 
 * @param userId - User's MongoDB _id
 * @param refreshToken - JWT refresh token
 */
const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
    // Hash token before storing
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store in database
    await RefreshToken.create({
        userId,
        tokenHash,
        expiresAt,
    });
};
