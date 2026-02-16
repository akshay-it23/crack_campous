/**
 * Glassmorphic Card Component
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

export const Card = ({ children, className = '', hover = false, gradient = false, onClick }: CardProps) => {
    const baseStyles = 'rounded-2xl p-6';
    const glassStyles = hover ? 'glass-card-hover' : 'glass-card';
    const gradientStyles = gradient ? 'bg-gradient-primary' : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${baseStyles} ${gradient ? gradientStyles : glassStyles} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};
