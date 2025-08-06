import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, BarChart3, Settings, Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import { Button, Card } from '../ui';
import WelcomeCard from './WelcomeCard';
import SessionOverview from './SessionOverview';
import QuickStats from './QuickStats';
import EngagementChart from './EngagementChart';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isSessionActive } = useLearningSession();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Welcome back, {user.name}!</h1>
            <p className="text-neutral-600">Ready to continue your learning journey?</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="space-y-6">
        {/* Top Row - Welcome Card and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <WelcomeCard user={user} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-h3">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <Link to="/learning">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Play className="w-4 h-4" />}
                    className="w-full justify-start"
                    disabled={isSessionActive}
                  >
                    {isSessionActive ? 'Session Active' : 'Start Learning Session'}
                  </Button>
                </Link>
                
                <Link to="/reports">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<BarChart3 className="w-4 h-4" />}
                    className="w-full justify-start"
                  >
                    View Progress Report
                  </Button>
                </Link>
                
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    size="md"
                    icon={<Settings className="w-4 h-4" />}
                    className="w-full justify-start"
                  >
                    Update Preferences
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Middle Row - Stats and Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <QuickStats />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SessionOverview />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-h3">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                <motion.div 
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Completed: Introduction to AI</p>
                    <p className="text-xs text-neutral-500">2 hours ago</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Started: Machine Learning Basics</p>
                    <p className="text-xs text-neutral-500">1 day ago</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">Achievement: First Week Complete</p>
                    <p className="text-xs text-neutral-500">3 days ago</p>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - Chart and Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div className="lg:col-span-3" variants={itemVariants}>
            <EngagementChart />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="text-center h-full">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-h3">Learning Streak</h3>
              </div>
              
              <div className="mb-6">
                <motion.div 
                  className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                >
                  7
                </motion.div>
                <p className="text-neutral-600 font-medium">Days in a row</p>
              </div>
              
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
                  />
                ))}
              </div>
              
              <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200/50">
                <p className="text-sm text-orange-600 font-medium">
                  🔥 Keep it up! You're on fire!
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;

