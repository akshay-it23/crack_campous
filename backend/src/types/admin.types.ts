/**
 * Admin Type Definitions
 * 
 * Defines TypeScript interfaces and enums for admin-related functionality
 */

import { Document } from 'mongoose';

/**
 * Admin Roles
 * - super_admin: Full system access
 * - content_manager: Can manage topics, badges, challenges
 * - moderator: Can manage users and view analytics
 */
export enum AdminRole {
    SUPER_ADMIN = 'super_admin',
    CONTENT_MANAGER = 'content_manager',
    MODERATOR = 'moderator',
}

/**
 * Granular Admin Permissions
 */
export enum AdminPermission {
    // User Management
    VIEW_USERS = 'view_users',
    EDIT_USERS = 'edit_users',
    DELETE_USERS = 'delete_users',
    SUSPEND_USERS = 'suspend_users',

    // Content Management
    CREATE_TOPICS = 'create_topics',
    EDIT_TOPICS = 'edit_topics',
    DELETE_TOPICS = 'delete_topics',
    CREATE_BADGES = 'create_badges',
    EDIT_BADGES = 'edit_badges',
    DELETE_BADGES = 'delete_badges',
    CREATE_CHALLENGES = 'create_challenges',
    EDIT_CHALLENGES = 'edit_challenges',
    DELETE_CHALLENGES = 'delete_challenges',

    // Analytics
    VIEW_ANALYTICS = 'view_analytics',
    EXPORT_DATA = 'export_data',

    // System
    VIEW_AUDIT_LOGS = 'view_audit_logs',
    MANAGE_ADMINS = 'manage_admins',
    SYSTEM_SETTINGS = 'system_settings',
}

/**
 * Admin Document Interface
 */
export interface IAdmin extends Document {
    email: string;
    password: string;
    fullName: string;
    role: AdminRole;
    permissions: AdminPermission[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;

    // Methods
    hasPermission(permission: AdminPermission): boolean;
    hasRole(role: AdminRole): boolean;
}

/**
 * Admin JWT Payload
 */
export interface IAdminAuthPayload {
    adminId: string;
    email: string;
    role: AdminRole;
    permissions: AdminPermission[];
}

/**
 * Admin Login Request
 */
export interface IAdminLoginRequest {
    email: string;
    password: string;
}

/**
 * Admin Registration Request
 */
export interface IAdminCreateRequest {
    email: string;
    password: string;
    fullName: string;
    role: AdminRole;
    permissions?: AdminPermission[];
}

/**
 * Admin Update Request
 */
export interface IAdminUpdateRequest {
    fullName?: string;
    email?: string;
    password?: string;
    role?: AdminRole;
    permissions?: AdminPermission[];
    isActive?: boolean;
}

/**
 * Role-Permission Mapping
 * Defines default permissions for each role
 */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
    [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
    [AdminRole.CONTENT_MANAGER]: [
        AdminPermission.VIEW_USERS,
        AdminPermission.CREATE_TOPICS,
        AdminPermission.EDIT_TOPICS,
        AdminPermission.DELETE_TOPICS,
        AdminPermission.CREATE_BADGES,
        AdminPermission.EDIT_BADGES,
        AdminPermission.DELETE_BADGES,
        AdminPermission.CREATE_CHALLENGES,
        AdminPermission.EDIT_CHALLENGES,
        AdminPermission.DELETE_CHALLENGES,
        AdminPermission.VIEW_ANALYTICS,
    ],
    [AdminRole.MODERATOR]: [
        AdminPermission.VIEW_USERS,
        AdminPermission.EDIT_USERS,
        AdminPermission.SUSPEND_USERS,
        AdminPermission.VIEW_ANALYTICS,
        AdminPermission.VIEW_AUDIT_LOGS,
    ],
};
