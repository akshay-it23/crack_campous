/**
 * Register Page with Multi-Step Form
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, GraduationCap, Building2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import type { RegisterData } from '@/types';

export const Register = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterData & { confirmPassword: string }>();

    const password = watch('password');

    const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = data;
            const response = await authService.register(registerData);

            // Store tokens
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            // Update auth store
            setUser(response.data.user);

            toast.success('Account created successfully! 🎉');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4">
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            y: [null, Math.random() * window.innerHeight],
                            x: [null, Math.random() * window.innerWidth],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                    />
                ))}
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Sparkles className="w-10 h-10 text-primary-400" />
                        <span className="text-3xl font-bold gradient-text">PrepMaster</span>
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Join PrepMaster</h1>
                    <p className="text-white/70">Start your journey to placement success</p>
                </motion.div>

                {/* Register Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                icon={<User className="w-5 h-5" />}
                                error={errors.fullName?.message}
                                {...register('fullName', {
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Name must be at least 3 characters',
                                    },
                                })}
                            />

                            <Input
                                label="Email"
                                type="email"
                                placeholder="your.email@example.com"
                                icon={<Mail className="w-5 h-5" />}
                                error={errors.email?.message}
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === password || 'Passwords do not match',
                                })}
                            />

                            <Input
                                label="College (Optional)"
                                type="text"
                                placeholder="Your College Name"
                                icon={<Building2 className="w-5 h-5" />}
                                {...register('college')}
                            />

                            <Input
                                label="Graduation Year (Optional)"
                                type="number"
                                placeholder="2025"
                                icon={<GraduationCap className="w-5 h-5" />}
                                {...register('graduationYear', {
                                    valueAsNumber: true,
                                    min: {
                                        value: 2020,
                                        message: 'Invalid year',
                                    },
                                    max: {
                                        value: 2030,
                                        message: 'Invalid year',
                                    },
                                })}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                                icon={<Sparkles className="w-5 h-5" />}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-white/70">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                                    Login
                                </Link>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
