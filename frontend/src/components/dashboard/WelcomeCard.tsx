import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, BookOpen, Calendar, Zap } from 'lucide-react';
import { Card } from '../ui';
import type { User } from '../../types';

interface WelcomeCardProps {
    user: User;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ user }) => {
    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getMotivationalMessage = (): string => {
        const messages = [
            "Ready to learn something new today?",
            "Let's continue your learning journey!",
            "Time to expand your knowledge!",
            "Your next breakthrough is just a lesson away!",
            "Learning is the key to unlocking your potential!"
        ];

        // Use user ID to get consistent message for the day
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const messageIndex = (parseInt(user.id) + dayOfYear) % messages.length;
        return messages[messageIndex];
    };

    const formatJoinDate = (date: Date): string => {
        const now = new Date();
        const joinDate = new Date(date);
        const diffTime = Math.abs(now.getTime() - joinDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Joined today';
        if (diffDays < 7) return `Joined ${diffDays} days ago`;
        if (diffDays < 30) return `Joined ${Math.floor(diffDays / 7)} weeks ago`;
        return `Joined ${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <Card variant="gradient" className="h-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {user.name.charAt(0).toUpperCase()}
                </motion.div>
                <div className="flex-1">
                    <motion.h2 
                        className="text-2xl font-bold text-neutral-900 mb-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {getGreeting()}, {user.name}!
                    </motion.h2>
                    <motion.p 
                        className="text-neutral-600"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {getMotivationalMessage()}
                    </motion.p>
                </div>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide">Level</p>
                        <p className="font-semibold text-neutral-900 capitalize">{user.preferences.difficultyLevel}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide">Content</p>
                        <p className="font-semibold text-neutral-900 capitalize">{user.preferences.preferredContentType}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wide">Member</p>
                        <p className="font-semibold text-neutral-900">{formatJoinDate(user.createdAt)}</p>
                    </div>
                </motion.div>
            </div>

            {/* Learning Preferences */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-600" />
                    Your Learning Setup
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-white/70 rounded-xl border border-white/50">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-900">Session Duration</p>
                            <p className="text-lg font-bold text-orange-600">{user.preferences.sessionDuration} min</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/70 rounded-xl border border-white/50">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Target className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-900">Adaptation</p>
                            <p className="text-lg font-bold text-indigo-600 capitalize">{user.preferences.adaptationSensitivity}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Card>
    );
};

export default WelcomeCard;

