import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Target, 
  Eye, 
  Heart, 
  Clock, 
  Zap,
  TrendingUp,
  MousePointer,
  Scroll,
  Keyboard
} from 'lucide-react';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import { useEngagement } from '../../contexts/EngagementContext';
import { Card } from '../ui';

const SessionOverview: React.FC = () => {
  const { 
    currentSession, 
    isSessionActive, 
    engagementLevel, 
    sessionMetrics: _sessionMetrics 
  } = useLearningSession();
  
  const { emotionState, behaviorMetrics } = useEngagement();

  const getEngagementColor = (level: string): string => {
    switch (level) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEngagementPercentage = (level: string): number => {
    switch (level) {
      case 'high': return 85;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 0;
    }
  };

  const getFocusLevel = (): string => {
    if (!isSessionActive) return 'Not Active';
    
    const focusScore = behaviorMetrics.focusTime;
    if (focusScore > 80) return 'Highly Focused';
    if (focusScore > 60) return 'Focused';
    if (focusScore > 40) return 'Moderately Focused';
    return 'Distracted';
  };

  const getAttentionLevel = (): string => {
    if (!isSessionActive) return 'Not Active';
    
    const mouseActivity = behaviorMetrics.mouseActivity;
    const clickFrequency = behaviorMetrics.clickFrequency;
    
    const attentionScore = (mouseActivity + clickFrequency) / 2;
    
    if (attentionScore > 70) return 'High Attention';
    if (attentionScore > 50) return 'Good Attention';
    if (attentionScore > 30) return 'Low Attention';
    return 'Very Low Attention';
  };

  const formatSessionDuration = (): string => {
    if (!currentSession) return '0m';
    
    const now = new Date();
    const startTime = new Date(currentSession.startTime);
    const diffMs = now.getTime() - startTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-h3">Session Overview</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-neutral-600">{isSessionActive ? 'Active Session' : 'No Active Session'}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Engagement */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-neutral-900">Current Engagement</h4>
            </div>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getEngagementColor(engagementLevel) }}
            >
              {engagementLevel.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-neutral-200 rounded-full h-2">
              <motion.div 
                className="h-2 rounded-full"
                style={{ backgroundColor: getEngagementColor(engagementLevel) }}
                initial={{ width: 0 }}
                animate={{ width: `${getEngagementPercentage(engagementLevel)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="text-lg font-bold text-neutral-900">{getEngagementPercentage(engagementLevel)}%</span>
          </div>
        </motion.div>

        {/* Focus Level */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-neutral-900">Focus Level</h4>
            </div>
          </div>
          <div className="text-xl font-bold text-green-600 mb-1">{getFocusLevel()}</div>
          <div className="text-sm text-neutral-600">Focus Time: {Math.round(behaviorMetrics.focusTime)}%</div>
        </motion.div>

        {/* Attention Level */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-neutral-900">Attention Level</h4>
            </div>
          </div>
          <div className="text-xl font-bold text-purple-600 mb-1">{getAttentionLevel()}</div>
          <div className="text-sm text-neutral-600">Activity Score: {Math.round((behaviorMetrics.mouseActivity + behaviorMetrics.clickFrequency) / 2)}%</div>
        </motion.div>

        {/* Current Emotion */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-500" />
              <h4 className="font-semibold text-neutral-900">Current Emotion</h4>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
              {Math.round(emotionState.confidence * 100)}% confident
            </span>
          </div>
          <div className="text-xl font-bold text-orange-600 mb-1 capitalize">{emotionState.primary}</div>
          <div className="text-sm text-neutral-600">Updated: {emotionState.timestamp.toLocaleTimeString()}</div>
        </motion.div>

        {/* Session Info */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-gray-50 to-neutral-50 rounded-xl border border-gray-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <h4 className="font-semibold text-neutral-900">Session Info</h4>
            </div>
            <span className="text-lg font-bold text-gray-600">{formatSessionDuration()}</span>
          </div>
          {isSessionActive && currentSession ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Started:</span>
                <span className="font-medium text-neutral-900">
                  {new Date(currentSession.startTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Adaptations:</span>
                <span className="font-medium text-neutral-900">{currentSession.adaptations.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Content Items:</span>
                <span className="font-medium text-neutral-900">{currentSession.contentItems.length}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500">Start a learning session to see detailed metrics</p>
            </div>
          )}
        </motion.div>

        {/* Behavior Metrics */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-neutral-900">Behavior Metrics</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-neutral-600">Mouse Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-neutral-200 rounded-full h-2">
                  <motion.div 
                    className="bg-indigo-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${behaviorMetrics.mouseActivity}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 w-8">{Math.round(behaviorMetrics.mouseActivity)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-neutral-600">Scroll Speed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-neutral-200 rounded-full h-2">
                  <motion.div 
                    className="bg-indigo-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${behaviorMetrics.scrollSpeed}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 w-8">{Math.round(behaviorMetrics.scrollSpeed)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-neutral-600">Typing Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-neutral-200 rounded-full h-2">
                  <motion.div 
                    className="bg-indigo-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${behaviorMetrics.typingActivity}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-900 w-8">{Math.round(behaviorMetrics.typingActivity)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};

export default SessionOverview;

