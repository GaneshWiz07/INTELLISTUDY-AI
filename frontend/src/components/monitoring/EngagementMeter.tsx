import React, { useEffect, useState } from 'react';
import { useEngagement } from '../../contexts/EngagementContext';
import type { EngagementLevel } from '../../types';
import './EngagementMeter.css';

interface EngagementMeterProps {
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

interface EngagementHistory {
  timestamp: Date;
  level: EngagementLevel;
}

export const EngagementMeter: React.FC<EngagementMeterProps> = ({
  showDetails = true,
  size = 'medium',
  className = ''
}) => {
  const { engagementLevel, behaviorMetrics, emotionState, isMonitoring } = useEngagement();
  const [engagementHistory, setEngagementHistory] = useState<EngagementHistory[]>([]);
  const [averageEngagement, setAverageEngagement] = useState<number>(0);

  // Track engagement history
  useEffect(() => {
    if (isMonitoring) {
      setEngagementHistory(prev => {
        const newEntry: EngagementHistory = {
          timestamp: new Date(),
          level: engagementLevel
        };
        
        // Keep only last 20 entries (last ~2 minutes if updated every 5 seconds)
        const updated = [...prev, newEntry].slice(-20);
        return updated;
      });
    }
  }, [engagementLevel, isMonitoring]);

  // Calculate average engagement
  useEffect(() => {
    if (engagementHistory.length > 0) {
      const levelValues = { low: 1, medium: 2, high: 3 };
      const sum = engagementHistory.reduce((acc, entry) => acc + levelValues[entry.level], 0);
      const average = sum / engagementHistory.length;
      setAverageEngagement(average);
    }
  }, [engagementHistory]);

  const getEngagementColor = (level: EngagementLevel): string => {
    switch (level) {
      case 'high': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'low': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getEngagementPercentage = (level: EngagementLevel): number => {
    switch (level) {
      case 'high': return 100;
      case 'medium': return 60;
      case 'low': return 25;
      default: return 0;
    }
  };

  const getEngagementEmoji = (level: EngagementLevel): string => {
    switch (level) {
      case 'high': return '🔥';
      case 'medium': return '👍';
      case 'low': return '😴';
      default: return '😐';
    }
  };

  const getEngagementDescription = (level: EngagementLevel): string => {
    switch (level) {
      case 'high': return 'Highly engaged and active';
      case 'medium': return 'Moderately engaged';
      case 'low': return 'Low engagement detected';
      default: return 'Engagement unknown';
    }
  };

  const calculateOverallScore = (): number => {
    if (!isMonitoring) return 0;
    
    // Combine multiple factors for overall engagement score
    const engagementScore = getEngagementPercentage(engagementLevel);
    const emotionBonus = emotionState.primary === 'engaged' || emotionState.primary === 'focused' ? 10 : 0;
    const activityBonus = (behaviorMetrics.mouseActivity + behaviorMetrics.typingActivity) > 1 ? 5 : 0;
    
    return Math.min(100, engagementScore + emotionBonus + activityBonus);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const overallScore = calculateOverallScore();

  return (
    <div className={`engagement-meter ${size} ${className}`}>
      <div className="meter-header">
        <h3>Engagement Level</h3>
        {isMonitoring && (
          <div className="monitoring-indicator">
            <span className="indicator-dot active"></span>
            <span className="indicator-text">Live</span>
          </div>
        )}
      </div>

      {!isMonitoring ? (
        <div className="meter-disabled">
          <div className="disabled-icon">📊</div>
          <p>Engagement monitoring paused</p>
        </div>
      ) : (
        <div className="meter-content">
          {/* Main engagement display */}
          <div className="engagement-display">
            <div className="engagement-circle">
              <svg className="circle-progress" viewBox="0 0 120 120">
                <circle
                  className="circle-background"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e1e5e9"
                  strokeWidth="8"
                />
                <circle
                  className="circle-progress-bar"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={getEngagementColor(engagementLevel)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallScore / 100)}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="circle-content">
                <div className="engagement-emoji">
                  {getEngagementEmoji(engagementLevel)}
                </div>
                <div className="engagement-percentage">
                  {Math.round(overallScore)}%
                </div>
              </div>
            </div>
            
            <div className="engagement-info">
              <div className="current-level">
                <span className="level-label">Current Level:</span>
                <span 
                  className="level-value"
                  style={{ color: getEngagementColor(engagementLevel) }}
                >
                  {engagementLevel.toUpperCase()}
                </span>
              </div>
              <div className="level-description">
                {getEngagementDescription(engagementLevel)}
              </div>
            </div>
          </div>

          {showDetails && (
            <>
              {/* Engagement factors */}
              <div className="engagement-factors">
                <h4>Contributing Factors</h4>
                <div className="factors-grid">
                  <div className="factor">
                    <span className="factor-icon">🖱️</span>
                    <span className="factor-label">Mouse Activity</span>
                    <div className="factor-bar">
                      <div 
                        className="factor-fill"
                        style={{ 
                          width: `${Math.min(100, behaviorMetrics.mouseActivity * 20)}%`,
                          backgroundColor: getEngagementColor(engagementLevel)
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="factor">
                    <span className="factor-icon">⌨️</span>
                    <span className="factor-label">Typing Activity</span>
                    <div className="factor-bar">
                      <div 
                        className="factor-fill"
                        style={{ 
                          width: `${Math.min(100, behaviorMetrics.typingActivity * 30)}%`,
                          backgroundColor: getEngagementColor(engagementLevel)
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="factor">
                    <span className="factor-icon">😊</span>
                    <span className="factor-label">Emotion State</span>
                    <div className="factor-bar">
                      <div 
                        className="factor-fill"
                        style={{ 
                          width: `${emotionState.confidence * 100}%`,
                          backgroundColor: getEngagementColor(engagementLevel)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement trend */}
              {engagementHistory.length > 1 && (
                <div className="engagement-trend">
                  <h4>Recent Trend</h4>
                  <div className="trend-chart">
                    {engagementHistory.slice(-10).map((entry, index) => (
                      <div 
                        key={index}
                        className="trend-bar"
                        style={{
                          height: `${getEngagementPercentage(entry.level)}%`,
                          backgroundColor: getEngagementColor(entry.level)
                        }}
                        title={`${entry.level} at ${formatTime(entry.timestamp)}`}
                      ></div>
                    ))}
                  </div>
                  <div className="trend-info">
                    <span>Average: {averageEngagement.toFixed(1)}/3.0</span>
                    <span>Last 10 readings</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

