/**
 * Socket.IO Service
 * 
 * Manages real-time WebSocket connections for collaborative features
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { StudyRoomService } from './studyRoom.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    userName?: string;
}

export class SocketService {
    private io: SocketIOServer;

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
                credentials: true,
            },
        });

        this.setupMiddleware();
        this.setupEventHandlers();
    }

    /**
     * Authentication middleware for Socket.IO
     */
    private setupMiddleware() {
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                // Verify JWT token
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                socket.userId = decoded.userId;
                socket.userName = decoded.fullName || 'Anonymous';

                next();
            } catch (error) {
                next(new Error('Invalid authentication token'));
            }
        });
    }

    /**
     * Setup event handlers
     */
    private setupEventHandlers() {
        this.io.on('connection', (socket: AuthenticatedSocket) => {
            console.log(`✅ User connected: ${socket.userId}`);

            // Join study room
            socket.on('join-room', async (roomId: string, password?: string) => {
                try {
                    const room = await StudyRoomService.joinRoom(roomId, socket.userId!, password);
                    socket.join(roomId);

                    // Notify room participants
                    this.io.to(roomId).emit('user-joined', {
                        userId: socket.userId,
                        userName: socket.userName,
                        timestamp: new Date(),
                    });

                    socket.emit('room-joined', room);
                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                }
            });

            // Leave study room
            socket.on('leave-room', async (roomId: string) => {
                try {
                    await StudyRoomService.leaveRoom(roomId, socket.userId!);
                    socket.leave(roomId);

                    // Notify room participants
                    this.io.to(roomId).emit('user-left', {
                        userId: socket.userId,
                        userName: socket.userName,
                        timestamp: new Date(),
                    });
                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                }
            });

            // Update progress
            socket.on('update-progress', async (data: { roomId: string; progress: number }) => {
                try {
                    await StudyRoomService.updateProgress(
                        data.roomId,
                        socket.userId!,
                        data.progress
                    );

                    // Broadcast progress update to room
                    this.io.to(data.roomId).emit('progress-updated', {
                        userId: socket.userId,
                        userName: socket.userName,
                        progress: data.progress,
                        timestamp: new Date(),
                    });
                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                }
            });

            // Send message in room
            socket.on('send-message', (data: { roomId: string; message: string }) => {
                this.io.to(data.roomId).emit('new-message', {
                    userId: socket.userId,
                    userName: socket.userName,
                    message: data.message,
                    timestamp: new Date(),
                });
            });

            // Disconnect
            socket.on('disconnect', () => {
                console.log(`❌ User disconnected: ${socket.userId}`);
            });
        });
    }

    /**
     * Get Socket.IO instance
     */
    getIO(): SocketIOServer {
        return this.io;
    }

    /**
     * Emit notification to specific user
     */
    emitToUser(userId: string, event: string, data: any) {
        this.io.to(userId).emit(event, data);
    }

    /**
     * Emit notification to all users
     */
    emitToAll(event: string, data: any) {
        this.io.emit(event, data);
    }
}
