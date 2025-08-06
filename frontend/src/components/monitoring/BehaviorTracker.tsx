import React, { useEffect } from 'react';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import { useEngagement } from '../../contexts/EngagementContext';
import './BehaviorTracker.css';

interface BehaviorTrackerProps {
  onBehaviorChange?: (metrics: any) => void;
  trackingInterval?: number;
  className?: string;
}

export const BehaviorTracker: React.FC<BehaviorTrackerProps> = ({
  onBehaviorChange,
  trackingInterval = 2000,
  className = ''
}) => {
  const { isMonitoring } = useEngagement();
  const { behaviorData, resetTracking } = useBehaviorTracking({
    trackingInterval,
    enabled: isMonitoring
  });

  // Update engagement context with behavior metrics
  const { updateBehaviorMetrics } = useEngagement();

  useEffect(() => {
    if (isMonitoring) {
      const metrics = {
        mouseActivity: behaviorData.mouseActivity,
        scrollSpeed: behaviorData.scrollSpeed,
        typingActivity: behaviorData.typingActivity,
        focusTime: behaviorData.focusTime,
        clickFrequency: behaviorData.clickFrequency
      };
      
      updateBehaviorMetrics(metrics);
      
      if (onBehaviorChange) {
        onBehaviorChange({
          ...metrics,
          isActive: behaviorData.isActive,
          lastActivity: behaviorData.lastActivity
        });
      }
    }
  }, [behaviorData, isMonitoring, updateBehaviorMetrics, onBehaviorChange]);

  const getActivityLevel = (value: number, thresholds: [number, number]): 'low' | 'medium' | 'high' => {
    if (value >= thresholds[1]) return 'high';
    if (value >= thresholds[0]) return 'medium';
    return 'low';
  };

  const formatMetric = (value: number, unit: string): string => {
    return `${value.toFixed(1)}${unit}`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTimeSinceLastActivity = (): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - behaviorData.lastActivity.getTime()) / 1000);
    
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className={`behavior-tracker ${className}`}>
      <div className="tracker-header">
        <h3>Behavior Tracking</h3>
        <div className={`tracking-status ${isMonitoring ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          {isMonitoring ? 'Monitoring' : 'Paused'}
        </div>
      </div>

      {!isMonitoring ? (
        <div className="tracking-disabled">
          <div className="disabled-icon">📊</div>
          <p>Behavior tracking is paused</p>
          <p className="tracking-note">Start a learning session to begin tracking</p>
        </div>
      ) : (
        <div className="tracking-metrics">
          <div className="activity-overview">
            <div className={`activity-indicator ${behaviorData.isActive ? 'active' : 'inactive'}`}>
              <span className="activity-dot"></span>
              <span className="activity-text">
                {behaviorData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="last-activity">
              Last activity: {getTimeSinceLastActivity()}
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">🖱️</span>
                <span className="metric-label">Mouse Activity</span>
              </div>
              <div className="metric-value">
                {formatMetric(behaviorData.mouseActivity, '/s')}
              </div>
              <div className={`metric-level ${getActivityLevel(behaviorData.mouseActivity, [1, 3])}`}>
                {getActivityLevel(behaviorData.mouseActivity, [1, 3])}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">📜</span>
                <span className="metric-label">Scroll Speed</span>
              </div>
              <div className="metric-value">
                {formatMetric(behaviorData.scrollSpeed, '/s')}
              </div>
              <div className={`metric-level ${getActivityLevel(behaviorData.scrollSpeed, [0.5, 2])}`}>
                {getActivityLevel(behaviorData.scrollSpeed, [0.5, 2])}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">⌨️</span>
                <span className="metric-label">Typing Activity</span>
              </div>
              <div className="metric-value">
                {formatMetric(behaviorData.typingActivity, '/s')}
              </div>
              <div className={`metric-level ${getActivityLevel(behaviorData.typingActivity, [0.5, 2])}`}>
                {getActivityLevel(behaviorData.typingActivity, [0.5, 2])}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">👆</span>
                <span className="metric-label">Click Frequency</span>
              </div>
              <div className="metric-value">
                {formatMetric(behaviorData.clickFrequency, '/s')}
              </div>
              <div className={`metric-level ${getActivityLevel(behaviorData.clickFrequency, [0.2, 1])}`}>
                {getActivityLevel(behaviorData.clickFrequency, [0.2, 1])}
              </div>
            </div>

            <div className="metric-card focus-time">
              <div className="metric-header">
                <span className="metric-icon">⏱️</span>
                <span className="metric-label">Focus Time</span>
              </div>
              <div className="metric-value">
                {formatTime(behaviorData.focusTime)}
              </div>
              <div className="metric-description">
                Total time focused on page
              </div>
            </div>
          </div>

          <div className="tracking-controls">
            <button 
              className="reset-button"
              onClick={resetTracking}
              title="Reset all tracking metrics"
            >
              🔄 Reset Metrics
            </button>
          </div>
        </div>
      )}

      <div className="tracking-info">
        <div className="info-icon">ℹ️</div>
        <span>Tracking user interactions to optimize learning experience</span>
      </div>
    </div>
  );
};

