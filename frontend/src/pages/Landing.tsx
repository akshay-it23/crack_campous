/**
 * Stunning Landing Page with 3D Elements and Animations
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Trophy,
    Zap,
    Brain,
    Rocket,
    ArrowRight,
} from 'lucide-react';

export const Landing = () => {
    const features = [
        {
            icon: <Brain className="w-8 h-8" />,
            title: 'AI-Powered Recommendations',
            description: 'Get personalized study plans based on your performance and weak areas',
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Real-Time Study Rooms',
            description: 'Collaborate with peers in live study sessions with progress tracking',
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Advanced Analytics',
            description: 'Track your progress with detailed insights and performance forecasting',
        },
        {
            icon: <Trophy className="w-8 h-8" />,
            title: 'Gamification',
            description: 'Earn badges, climb leaderboards, and complete daily challenges',
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: 'Smart Practice',
            description: 'Practice with difficulty-based questions and instant feedback',
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: 'Lightning Fast',
            description: 'Optimized performance with Redis caching and real-time updates',
        },
    ];

    const stats = [
        { value: '10K+', label: 'Problems Solved' },
        { value: '500+', label: 'Active Users' },
        { value: '95%', label: 'Success Rate' },
        { value: '24/7', label: 'Support' },
    ];

    return (
        <div className="min-h-screen animated-bg overflow-hidden">
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
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

            {/* Navbar */}
            <nav className="relative z-10 glass-card mx-4 mt-4 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Sparkles className="w-8 h-8 text-primary-400" />
                        <span className="text-2xl font-bold gradient-text">PrepMaster</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary">Get Started</Button>
                        </Link>
                    </motion.div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="inline-block mb-6"
                    >
                        <Rocket className="w-20 h-20 text-primary-400" />
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-bold mb-6 text-shadow">
                        Master Your
                        <span className="block gradient-text text-glow">Placement Prep</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
                        AI-powered platform to ace your placement interviews with personalized study plans,
                        real-time collaboration, and advanced analytics
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button size="lg" icon={<Rocket className="w-5 h-5" />}>
                                Start Learning Free
                            </Button>
                        </Link>
                        <Button size="lg" variant="secondary" icon={<ArrowRight className="w-5 h-5" />}>
                            Watch Demo
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="text-center">
                                    <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                                    <div className="text-white/60">{stat.label}</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-bold mb-4 gradient-text">
                        Everything You Need to Succeed
                    </h2>
                    <p className="text-xl text-white/70">
                        Powerful features designed to accelerate your learning
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card hover className="h-full">
                                <div className="text-primary-400 mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-white/70">{feature.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 max-w-4xl mx-auto px-4 py-20">
                <Card gradient className="text-center p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join thousands of students who are already crushing their placement prep
                        </p>
                        <Link to="/register">
                            <Button size="lg" variant="secondary" icon={<Sparkles className="w-5 h-5" />}>
                                Get Started Now - It's Free!
                            </Button>
                        </Link>
                    </motion.div>
                </Card>
            </section>

            {/* Footer */}
            <footer className="relative z-10 glass-card mx-4 mb-4 px-6 py-8">
                <div className="max-w-7xl mx-auto text-center text-white/60">
                    <p>© 2024 PrepMaster. Built with ❤️ for placement success.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
