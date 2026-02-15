/**
 * Seed Admin Script
 * 
 * Creates initial super admin user for the platform
 * Run with: npm run seed:admin
 */

import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Admin from '../models/Admin';
import { AdminRole } from '../types/admin.types';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('🌱 Starting admin seed...');

        // Connect to database
        await connectDB();

        // Check if super admin already exists
        const existingAdmin = await Admin.findOne({ role: AdminRole.SUPER_ADMIN });

        if (existingAdmin) {
            console.log('⚠️  Super admin already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log('   Skipping seed.');
            process.exit(0);
        }

        // Create super admin
        const superAdmin = await Admin.create({
            email: 'admin@platform.com',
            password: 'Admin@123456', // Change this in production!
            fullName: 'Super Administrator',
            role: AdminRole.SUPER_ADMIN,
            isActive: true,
        });

        console.log('✅ Super admin created successfully!');
        console.log('');
        console.log('📧 Email:', superAdmin.email);
        console.log('🔑 Password: Admin@123456');
        console.log('👤 Role:', superAdmin.role);
        console.log('');
        console.log('⚠️  IMPORTANT: Change the default password immediately!');
        console.log('');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

// Run seed
seedAdmin();
