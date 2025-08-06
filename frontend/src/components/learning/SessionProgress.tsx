import React, { useState, useEffect } from 'react';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import './SessionProgress.css';

interface SessionProgressProps {
  className?: string;
  showDetails?: boolean;
}

const SessionProgress: React.FC<SessionProgressProps> = ({ 
  className, 
  showDetails = true 
}) => {
  const { currentSession, sessionMetrics, isSessionActive } = useLearningSession();
  const [sessionDuration, setSessionDuration] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isSessionActive || !currentSession) return;

    const updateDuration = () => {
      const now = new Date();
      const duration = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
      setSessionDuration(duration);
      
      // Estimate time remaining based on content and engagement
      const avgContentTime = 300; // 5 minutes per content item
      const remainingContent = Math.max(0, currentSession.contentItems.length - 1);
      const baseTimeRemaining = remainingContent * avgContentTime;
      
      // Adjust based on engagement level
      const engagementMultiplier = sessionMetrics.averageEngagement > 2 ? 0.8 : 1.2;
      setEstimatedTimeRemaining(Math.floor(baseTimeRemaining * engagementMultiplier));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    
    return () => clearInterval(interval);
  }, [isSessionActive, currentSession, sessionMetrics.averageEngagement]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!currentSession || currentSession.contentItems.length === 0) return 0;
    
    // Simple progress based on adaptations and time
    const timeProgress = Math.min(sessionDuration / 1800, 1); // Max 30 minutes
    const adaptationProgress = Math.min(sessionMetrics.adaptationCount / 5, 1); // Max 5 adaptations
    
    return Math.round((timeProgress * 0.7 + adaptationProgress * 0.3) * 100);
  };

  const getEngagementTrend = () => {
    if (!currentSession || currentSession.engagementHistory.length < 2) return 'stable';
    
    const recent = currentSession.engagementHistory.slice(-3);
    const avgRecent = recent.reduce((sum, point) => {
      const level = point.level === 'high' ? 3 : point.level === 'medium' ? 2 : 1;
      return sum + level;
    }, 0) / recent.length;
    
    const earlier = currentSession.engagementHistory.slice(-6, -3);
    if (earlier.length === 0) return 'stable';
    
    const avgEarlier = earlier.reduce((sum, point) => {
      const level = point.level === 'high' ? 3 : point.level === 'medium' ? 2 : 1;
      return sum + level;
    }, 0) / earlier.length;
    
    if (avgRecent > avgEarlier + 0.3) return 'improving';
    if (avgRecent < avgEarlier - 0.3) return 'declining';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#28a745';
      case 'declining': return '#dc3545';
      case 'stable': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (!isSessionActive || !currentSession) {
    return (
      <div className={`session-progress ${className || ''}`}>
        <div className="no-session">
          <div className="no-session-icon">⏸️</div>
          <div className="no-session-content">
            <h4>No Active Session</h4>
            <p>Start a learning session to track your progress</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();
  const engagementTrend = getEngagementTrend();

  return (
    <div className={`session-progress ${className || ''}`}>
      <div className="progress-header">
        <h4 className="progress-title">Session Progress</h4>
        <div className="session-status">
          <div className="status-dot active">
            <div className="dot-pulse"></div>
          </div>
          <span className="status-text">Active Session</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="progress-shine"></div>
          </div>
        </div>
        <div className="progress-percentage">
          {progressPercentage}% Complete
        </div>
      </div>

      <div className="progress-metrics">
        <div className="metric-row">
          <div className="metric">
            <div className="metric-icon">⏱️</div>
            <div className="metric-content">
              <span className="metric-label">Session Time</span>
              <span className="metric-value">{formatTime(sessionDuration)}</span>
            </div>
          </div>
          
          <div className="metric">
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <span className="metric-label">Adaptations</span>
              <span className="metric-value">{sessionMetrics.adaptationCount}</span>
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <span className="metric-label">Avg. Engagement</span>
              <span className="metric-value">
                {sessionMetrics.averageEngagement > 0 
                  ? (sessionMetrics.averageEngagement / 3 * 100).toFixed(0) + '%'
                  : 'N/A'
                }
              </span>
            </div>
          </div>
          
          <div className="metric">
            <div 
              className="metric-icon"
              style={{ color: getTrendColor(engagementTrend) }}
            >
              {getTrendIcon(engagementTrend)}
            </div>
            <div className="metric-content">
              <span className="metric-label">Trend</span>
              <span 
                className="metric-value"
                style={{ color: getTrendColor(engagementTrend) }}
              >
                {engagementTrend.charAt(0).toUpperCase() + engagementTrend.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="progress-details">
          <div className="detail-section">
            <h5 className="detail-title">Session Overview</h5>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Content Items:</span>
                <span className="detail-value">{currentSession.contentItems.length}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Engagement Points:</span>
                <span className="detail-value">{currentSession.engagementHistory.length}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Est. Remaining:</span>
                <span className="detail-value">
                  {estimatedTimeRemaining > 0 ? formatTime(estimatedTimeRemaining) : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Performance:</span>
                <span className="detail-value">
                  {sessionMetrics.performanceScore > 0 
                    ? `${sessionMetrics.performanceScore.toFixed(1)}/10`
                    : 'Calculating...'
                  }
                </span>
              </div>
            </div>
          </div>

          {Object.keys(sessionMetrics.emotionDistribution).length > 0 && (
            <div className="detail-section">
              <h5 className="detail-title">Emotion Distribution</h5>
              <div className="emotion-bars">
                {Object.entries(sessionMetrics.emotionDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([emotion, count]) => {
                    const total = Object.values(sessionMetrics.emotionDistribution)
                      .reduce((sum, val) => sum + val, 0);
                    const percentage = (count / total) * 100;
                    
                    return (
                      <div key={emotion} className="emotion-bar">
                        <div className="emotion-info">
                          <span className="emotion-name">
                            {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                          </span>
                          <span className="emotion-percentage">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="emotion-progress">
                          <div 
                            className="emotion-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionProgress;

