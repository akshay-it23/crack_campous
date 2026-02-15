/**
 * Audit Log Model
 * 
 * Tracks all admin actions for security and compliance
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    adminId: mongoose.Types.ObjectId;
    adminEmail: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: {
        before?: any;
        after?: any;
    };
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        adminEmail: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
            enum: [
                'CREATE',
                'UPDATE',
                'DELETE',
                'LOGIN',
                'LOGOUT',
                'SUSPEND',
                'ACTIVATE',
                'EXPORT',
                'IMPORT',
            ],
        },
        resource: {
            type: String,
            required: true,
            enum: [
                'User',
                'Topic',
                'Badge',
                'Challenge',
                'Admin',
                'System',
            ],
        },
        resourceId: {
            type: String,
        },
        changes: {
            before: Schema.Types.Mixed,
            after: Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false, // Using custom timestamp field
    }
);

// Indexes for efficient querying
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
