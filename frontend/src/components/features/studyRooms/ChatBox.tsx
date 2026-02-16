/**
 * Chat Box Component
 * Real-time chat for study rooms
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
}

export const ChatBox = ({ messages, onSendMessage }: ChatBoxProps) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuthStore();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

    const formatTime = (timestamp: Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Chat</h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                    {messages.map((msg, index) => {
                        const isOwnMessage = msg.userId === user?._id;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-white/60">{msg.userName}</span>
                                        <span className="text-xs text-white/40">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div
                                        className={`px-4 py-2 rounded-lg ${isOwnMessage
                                                ? 'bg-gradient-to-r from-primary-400 to-accent-500 text-white'
                                                : 'bg-white/10 text-white'
                                            }`}
                                    >
                                        <p className="text-sm break-words">{msg.message}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary-400 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="px-4 py-3 rounded-lg bg-gradient-to-r from-primary-400 to-accent-500 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};
