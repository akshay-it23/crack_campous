/**
 * JWT Token and Password Utilities
 * 
 * This module handles all cryptographic operations:
 * - Password hashing and verification (bcrypt)
 * - JWT token generation and validation (jsonwebtoken)
 * 
 * Why separate this?
 * - Reusable across services
 * - Easy to test in isolation
 * - Single source of truth for security operations
 * - Easy to upgrade algorithms later (e.g., bcrypt -> argon2)
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/auth.types';

/**
 * Password Hashing Configuration
 * 
 * Salt rounds: Number of times to hash the password
 * Higher = more secure but slower
 * 10 rounds is industry standard (takes ~100ms)
 * 
 * Why salt?
 * - Even if two users have same password, hashes are different
 * - Prevents rainbow table attacks
 * - bcrypt automatically generates random salt
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password
 * 
 * @param password - Plain-text password from user
 * @returns Hashed password (safe to store in database)
 * 
 * Example:
 *   const hash = await hashPassword("MyPassword123");
 *   // Returns: "$2b$10$KIXxLV..." (different every time due to random salt)
 * 
 * How bcrypt works:
 * 1. Generate random salt
 * 2. Combine password + salt
 * 3. Hash multiple times (10 rounds)
 * 4. Return hash that includes salt (for verification later)
 * 
 * Why async?
 * - Hashing is CPU-intensive (intentionally slow for security)
 * - Don't block the event loop
 */
export const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
};

/**
 * Verify a password against its hash
 * 
 * @param plainPassword - Password user entered
 * @param hashedPassword - Hash stored in database
 * @returns True if password matches, false otherwise
 * 
 * Example:
 *   const hash = await hashPassword("MyPassword123");
 *   await verifyPassword("MyPassword123", hash); // true
 *   await verifyPassword("WrongPassword", hash); // false
 * 
 * How it works:
 * 1. Extract salt from hashedPassword
 * 2. Hash plainPassword with same salt
 * 3. Compare the two hashes (constant-time comparison to prevent timing attacks)
 */
export const verifyPassword = async (
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> => {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
};

/**
 * Generate JWT Access Token
 * 
 * @param userId - User's MongoDB _id
 * @returns JWT token string
 * 
 * Token structure (JWT = 3 parts separated by dots):
 * 1. Header: {"alg": "HS256", "typ": "JWT"}
 * 2. Payload: {"userId": "...", "iat": 1234567890, "exp": 1234568790}
 * 3. Signature: HMAC-SHA256(header + payload, JWT_SECRET)
 * 
 * Why JWT?
 * - Stateless: Server doesn't need to store sessions
 * - Self-contained: All info is in the token
 * - Verifiable: Signature proves token wasn't tampered with
 * 
 * Expiry:
 * - Short-lived (15 minutes from .env)
 * - If stolen, damage is limited
 * - User gets new token via refresh token
 */
export const generateAccessToken = (userId: string): string => {
    const payload: TokenPayload = { userId };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    });

    return token;
};

/**
 * Generate JWT Refresh Token
 * 
 * @param userId - User's MongoDB _id
 * @returns JWT refresh token string
 * 
 * Same as access token but with longer expiry (7 days)
 * 
 * Why separate function?
 * - Different expiry time
 * - Could use different secret in future
 * - Could add different claims (e.g., "type": "refresh")
 * 
 * Refresh token flow:
 * 1. User logs in → get access + refresh tokens
 * 2. Access token expires (15 min) → API returns 401
 * 3. Client sends refresh token → get new access token
 * 4. Repeat until refresh token expires (7 days)
 * 5. User must re-login
 */
export const generateRefreshToken = (userId: string): string => {
    const payload: TokenPayload = { userId };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    });

    return token;
};

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded payload
 * @throws Error if token is invalid, expired, or tampered with
 * 
 * Verification checks:
 * 1. Signature is valid (proves token wasn't modified)
 * 2. Token hasn't expired (exp claim)
 * 3. Algorithm matches (prevents algorithm confusion attacks)
 * 
 * What happens if verification fails?
 * - Throws error
 * - Caller should return 401 Unauthorized to client
 * 
 * Example:
 *   try {
 *     const payload = verifyToken(token);
 *     console.log(payload.userId); // "507f1f77bcf86cd799439011"
 *   } catch (error) {
 *     // Token invalid/expired
 *     return res.status(401).json({ error: 'Unauthorized' });
 *   }
 */
export const verifyToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw new Error('Token verification failed');
    }
};
