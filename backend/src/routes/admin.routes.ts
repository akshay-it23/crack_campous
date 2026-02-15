/**
 * Admin Routes
 * 
 * API endpoints for admin authentication and management
 */

import express, { Request, Response } from 'express';
import {
    loginAdmin,
    createAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    listAdmins,
} from '../services/admin.service';
import {
    adminLoginSchema,
    adminCreateSchema,
    adminUpdateSchema,
    adminProfileUpdateSchema,
} from '../validators/admin.validator';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth.middleware';

const router = express.Router();

/**
 * POST /api/admin/auth/login
 * Admin login
 */
router.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body
        const validatedData = adminLoginSchema.parse(req.body);

        // Login admin
        const result = await loginAdmin(validatedData);

        res.status(200).json({
            success: true,
            message: 'Admin logged in successfully',
            data: result,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }

        res.status(401).json({
            success: false,
            message: error.message || 'Login failed',
        });
    }
});

/**
 * GET /api/admin/auth/me
 * Get current admin profile
 */
router.get('/auth/me', requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.admin) {
            res.status(401).json({
                success: false,
                message: 'Admin not authenticated',
            });
            return;
        }

        const admin = await getAdminById(req.admin.adminId);

        res.status(200).json({
            success: true,
            data: admin,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get admin profile',
        });
    }
});

/**
 * PUT /api/admin/auth/me
 * Update current admin profile
 */
router.put('/auth/me', requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.admin) {
            res.status(401).json({
                success: false,
                message: 'Admin not authenticated',
            });
            return;
        }

        // Validate request body
        const validatedData = adminProfileUpdateSchema.parse(req.body);

        // Update admin
        const updatedAdmin = await updateAdmin(req.admin.adminId, validatedData);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedAdmin,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update profile',
        });
    }
});

/**
 * POST /api/admin/create
 * Create new admin (super admin only)
 */
router.post('/create', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body
        const validatedData = adminCreateSchema.parse(req.body);

        // Create admin
        const newAdmin = await createAdmin(validatedData);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: newAdmin,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create admin',
        });
    }
});

/**
 * GET /api/admin/list
 * List all admins (super admin only)
 */
router.get('/list', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, isActive } = req.query;

        const filters: any = {};
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive === 'true';

        const admins = await listAdmins(filters);

        res.status(200).json({
            success: true,
            data: admins,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to list admins',
        });
    }
});

/**
 * GET /api/admin/:id
 * Get admin by ID (super admin only)
 */
router.get('/:id', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const admin = await getAdminById(req.params.id);

        res.status(200).json({
            success: true,
            data: admin,
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message || 'Admin not found',
        });
    }
});

/**
 * PUT /api/admin/:id
 * Update admin (super admin only)
 */
router.put('/:id', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body
        const validatedData = adminUpdateSchema.parse(req.body);

        // Update admin
        const updatedAdmin = await updateAdmin(req.params.id, validatedData);

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            data: updatedAdmin,
        });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update admin',
        });
    }
});

/**
 * DELETE /api/admin/:id
 * Delete admin (super admin only)
 */
router.delete('/:id', requireSuperAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        await deleteAdmin(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete admin',
        });
    }
});

export default router;
