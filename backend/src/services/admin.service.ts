/**
 * Admin Service
 * 
 * Business logic for admin authentication and management
 */

import bcrypt from 'bcrypt';
import Admin from '../models/Admin';
import { generateToken } from '../utils/jwt';
import {
    IAdminLoginRequest,
    IAdminCreateRequest,
    IAdminUpdateRequest,
    IAdminAuthPayload,
    AdminPermission,
} from '../types/admin.types';

/**
 * Admin Login
 */
export const loginAdmin = async (credentials: IAdminLoginRequest) => {
    const { email, password } = credentials;

    // Find admin by email (include password field)
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
        throw new Error('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
        throw new Error('Admin account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const payload: IAdminAuthPayload = {
        adminId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
    };

    const accessToken = generateToken(payload, '24h'); // Longer expiry for admin

    // Return admin info (without password)
    return {
        admin: {
            id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            permissions: admin.permissions,
            lastLogin: admin.lastLogin,
        },
        accessToken,
    };
};

/**
 * Create New Admin
 */
export const createAdmin = async (data: IAdminCreateRequest) => {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: data.email });

    if (existingAdmin) {
        throw new Error('Admin with this email already exists');
    }

    // Create admin
    const admin = await Admin.create(data);

    return {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
    };
};

/**
 * Get Admin by ID
 */
export const getAdminById = async (adminId: string) => {
    const admin = await Admin.findById(adminId);

    if (!admin) {
        throw new Error('Admin not found');
    }

    return {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
    };
};

/**
 * Update Admin
 */
export const updateAdmin = async (adminId: string, data: IAdminUpdateRequest) => {
    const admin = await Admin.findById(adminId);

    if (!admin) {
        throw new Error('Admin not found');
    }

    // Update fields
    if (data.email) admin.email = data.email;
    if (data.fullName) admin.fullName = data.fullName;
    if (data.password) admin.password = data.password; // Will be hashed by pre-save hook
    if (data.role) admin.role = data.role;
    if (data.permissions) admin.permissions = data.permissions;
    if (data.isActive !== undefined) admin.isActive = data.isActive;

    await admin.save();

    return {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        updatedAt: admin.updatedAt,
    };
};

/**
 * Delete Admin
 */
export const deleteAdmin = async (adminId: string) => {
    const admin = await Admin.findByIdAndDelete(adminId);

    if (!admin) {
        throw new Error('Admin not found');
    }

    return { message: 'Admin deleted successfully' };
};

/**
 * List All Admins
 */
export const listAdmins = async (filters?: { role?: string; isActive?: boolean }) => {
    const query: any = {};

    if (filters?.role) query.role = filters.role;
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;

    const admins = await Admin.find(query).sort({ createdAt: -1 });

    return admins.map((admin) => ({
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
    }));
};

/**
 * Check if admin has permission
 */
export const checkPermission = async (adminId: string, permission: AdminPermission): Promise<boolean> => {
    const admin = await Admin.findById(adminId);

    if (!admin || !admin.isActive) {
        return false;
    }

    return admin.hasPermission(permission);
};
