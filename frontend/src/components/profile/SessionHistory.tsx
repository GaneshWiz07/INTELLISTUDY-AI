import React from 'react';
import type { LearningSession } from '../../types';
import './SessionHistory.css';

interface SessionHistoryProps {
  sessions: LearningSession[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getEngagementColor = (level: number): string => {
    if (level >= 0.8) return '#28a745'; // Green
    if (level >= 0.6) return '#ffc107'; // Yellow
    if (level >= 0.4) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const getPerformanceIcon = (score: number): string => {
    if (score >= 0.9) return '🏆';
    if (score >= 0.8) return '⭐';
    if (score >= 0.7) return '👍';
    if (score >= 0.6) return '👌';
    return '📈';
  };

  const getPrimaryEmotion = (emotionDistribution: Record<string, number>): string => {
    const emotions = Object.entries(emotionDistribution);
    if (emotions.length === 0) return 'neutral';
    
    return emotions.reduce((prev, current) => 
      current[1] > prev[1] ? current : prev
    )[0];
  };

  const getEmotionIcon = (emotion: string): string => {
    const emotionIcons: Record<string, string> = {
      focused: '🎯',
      engaged: '😊',
      confused: '🤔',
      bored: '😴',
      frustrated: '😤',
      neutral: '😐',
    };
    return emotionIcons[emotion] || '😐';
  };

  if (sessions.length === 0) {
    return (
      <div className="session-history">
        <div className="section-header">
          <h2>Session History</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Learning Sessions Yet</h3>
          <p>Start your first learning session to see your progress here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-history">
      <div className="section-header">
        <h2>Session History</h2>
        <span className="session-count">Last {sessions.length} sessions</span>
      </div>

      <div className="sessions-list">
        {sessions.map((session) => {
          const primaryEmotion = getPrimaryEmotion(session.finalMetrics.emotionDistribution);
          
          return (
            <div key={session.id} className="session-card">
              <div className="session-header">
                <div className="session-date">
                  <span className="date-text">{formatDate(session.startTime)}</span>
                  <span className="time-text">
                    {session.startTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="session-status">
                  {session.endTime ? (
                    <span className="status-completed">Completed</span>
                  ) : (
                    <span className="status-incomplete">Incomplete</span>
                  )}
                </div>
              </div>

              <div className="session-metrics">
                <div className="metric-item">
                  <div className="metric-icon">⏱️</div>
                  <div className="metric-content">
                    <span className="metric-label">Duration</span>
                    <span className="metric-value">
                      {formatDuration(session.finalMetrics.totalDuration)}
                    </span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon">📊</div>
                  <div className="metric-content">
                    <span className="metric-label">Engagement</span>
                    <div className="engagement-bar">
                      <div 
                        className="engagement-fill"
                        style={{
                          width: `${session.finalMetrics.averageEngagement * 100}%`,
                          backgroundColor: getEngagementColor(session.finalMetrics.averageEngagement),
                        }}
                      />
                      <span className="engagement-text">
                        {Math.round(session.finalMetrics.averageEngagement * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon">✅</div>
                  <div className="metric-content">
                    <span className="metric-label">Completion</span>
                    <span className="metric-value">
                      {Math.round(session.finalMetrics.contentCompletionRate * 100)}%
                    </span>
                  </div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon">{getPerformanceIcon(session.finalMetrics.performanceScore)}</div>
                  <div className="metric-content">
                    <span className="metric-label">Performance</span>
                    <span className="metric-value">
                      {Math.round(session.finalMetrics.performanceScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="session-details">
                <div className="content-info">
                  <span className="content-count">
                    {session.contentItems.length} content item{session.contentItems.length !== 1 ? 's' : ''}
                  </span>
                  {session.finalMetrics.adaptationCount > 0 && (
                    <span className="adaptation-count">
                      {session.finalMetrics.adaptationCount} adaptation{session.finalMetrics.adaptationCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                <div className="emotion-info">
                  <span className="emotion-icon">{getEmotionIcon(primaryEmotion)}</span>
                  <span className="emotion-text">
                    Mostly {primaryEmotion}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="session-summary">
        <div className="summary-item">
          <span className="summary-label">Total Sessions</span>
          <span className="summary-value">{sessions.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Time</span>
          <span className="summary-value">
            {formatDuration(
              sessions.reduce((total, session) => total + session.finalMetrics.totalDuration, 0)
            )}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Avg. Engagement</span>
          <span className="summary-value">
            {Math.round(
              (sessions.reduce((total, session) => total + session.finalMetrics.averageEngagement, 0) / sessions.length) * 100
            )}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;

