/**
 * Admin Model
 * 
 * Mongoose schema for admin users with role-based access control
 */

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IAdmin, AdminRole, AdminPermission, ROLE_PERMISSIONS } from '../types/admin.types';

const adminSchema = new Schema<IAdmin>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't return password by default
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: Object.values(AdminRole),
            default: AdminRole.MODERATOR,
            required: true,
        },
        permissions: {
            type: [String],
            enum: Object.values(AdminPermission),
            default: function () {
                return ROLE_PERMISSIONS[this.role as AdminRole] || [];
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

/**
 * Pre-save Hook: Hash password before saving
 */
adminSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

/**
 * Pre-save Hook: Set default permissions based on role
 */
adminSchema.pre('save', function (next) {
    if (this.isModified('role') && (!this.permissions || this.permissions.length === 0)) {
        this.permissions = ROLE_PERMISSIONS[this.role];
    }
    next();
});

/**
 * Instance Method: Check if admin has specific permission
 */
adminSchema.methods.hasPermission = function (permission: AdminPermission): boolean {
    return this.permissions.includes(permission);
};

/**
 * Instance Method: Check if admin has specific role
 */
adminSchema.methods.hasRole = function (role: AdminRole): boolean {
    return this.role === role;
};

/**
 * Indexes for performance
 */
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
