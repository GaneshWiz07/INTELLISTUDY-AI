import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  BookOpen, 
  Target, 
  Smile, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import { useEngagement } from '../../contexts/EngagementContext';
import { Card } from '../ui';

const QuickStats: React.FC = () => {
  const { sessionMetrics, currentSession } = useLearningSession();
  const { emotionState } = useEngagement();

  // Mock data for demonstration - in real app, this would come from API
  const mockStats = {
    weeklyStreak: 5,
    totalSessions: 23,
    averageScore: 78,
    lastMoodState: emotionState.primary,
    completionRate: sessionMetrics.contentCompletionRate || 85,
    learningHours: 12.5
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 7) return <Flame className="w-5 h-5 text-orange-500" />;
    if (streak >= 3) return <Award className="w-5 h-5 text-yellow-500" />;
    return <BookOpen className="w-5 h-5 text-blue-500" />;
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'focused': return <Target className="w-5 h-5 text-blue-500" />;
      case 'engaged': return <Smile className="w-5 h-5 text-green-500" />;
      case 'confused': return <Activity className="w-5 h-5 text-yellow-500" />;
      case 'bored': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'frustrated': return <TrendingUp className="w-5 h-5 text-red-500" />;
      default: return <Smile className="w-5 h-5 text-neutral-500" />;
    }
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const formatLearningTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-h3">Performance Stats</h3>
        </div>
        <span className="text-sm text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
          This Week
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div 
          className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-2">
            {getStreakIcon(mockStats.weeklyStreak)}
            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
              +2
            </span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{mockStats.weeklyStreak}</div>
          <div className="text-sm text-neutral-600">Day Streak</div>
        </motion.div>

        <motion.div 
          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
              +5
            </span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">{mockStats.totalSessions}</div>
          <div className="text-sm text-neutral-600">Sessions</div>
        </motion.div>

        <motion.div 
          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
              +3%
            </span>
          </div>
          <div 
            className="text-2xl font-bold"
            style={{ color: getPerformanceColor(mockStats.averageScore) }}
          >
            {mockStats.averageScore}%
          </div>
          <div className="text-sm text-neutral-600">Avg. Score</div>
        </motion.div>

        <motion.div 
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-2">
            {getMoodIcon(mockStats.lastMoodState)}
            <span className="text-xs text-neutral-500">
              {emotionState.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="text-lg font-bold text-neutral-900 capitalize">{mockStats.lastMoodState}</div>
          <div className="text-sm text-neutral-600">Last Mood</div>
        </motion.div>
      </div>

      {/* Completion Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-neutral-900">Completion Rate</span>
          </div>
          <span className="text-sm font-bold text-green-600">{Math.round(mockStats.completionRate)}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${mockStats.completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Learning Time */}
      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-neutral-900">{formatLearningTime(mockStats.learningHours)}</div>
            <div className="text-sm text-neutral-600">Learning Time</div>
          </div>
        </div>
        <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
          +2.3h
        </span>
      </div>
    </Card>
  );
};

export default QuickStats;

