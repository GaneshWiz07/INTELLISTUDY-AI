import React, { useState, useEffect } from 'react';
import type { ContentType, ContentAdaptation } from '../../types';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import './AdaptationIndicator.css';

interface AdaptationIndicatorProps {
  className?: string;
  showHistory?: boolean;
}

const AdaptationIndicator: React.FC<AdaptationIndicatorProps> = ({ 
  className, 
  showHistory = false 
}) => {
  const { currentSession, contentType } = useLearningSession();
  const [recentAdaptation, setRecentAdaptation] = useState<ContentAdaptation | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (currentSession && currentSession.adaptations.length > 0) {
      const latest = currentSession.adaptations[currentSession.adaptations.length - 1];
      
      // Only show notification for new adaptations
      if (!recentAdaptation || latest.id !== recentAdaptation.id) {
        setRecentAdaptation(latest);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentSession?.adaptations, recentAdaptation]);

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'text': return '📝';
      case 'video': return '🎥';
      case 'quiz': return '❓';
      case 'infographic': return '📊';
      default: return '📄';
    }
  };

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'text': return 'Text Content';
      case 'video': return 'Video Content';
      case 'quiz': return 'Interactive Quiz';
      case 'infographic': return 'Visual Infographic';
      default: return 'Content';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'engagement': return '🎯';
      case 'emotion': return '😊';
      case 'behavior': return '👆';
      case 'manual': return '👤';
      default: return '🔄';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (!currentSession) {
    return (
      <div className={`adaptation-indicator ${className || ''}`}>
        <div className="no-session">
          <span className="no-session-icon">⏸️</span>
          <span className="no-session-text">No active session</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`adaptation-indicator ${className || ''}`}>
      {/* Current Content Type Display */}
      <div className="current-content">
        <div className="content-display">
          <div className="content-icon">
            {getContentTypeIcon(contentType)}
          </div>
          <div className="content-info">
            <span className="content-label">Current Format</span>
            <span className="content-type">{getContentTypeLabel(contentType)}</span>
          </div>
        </div>
        
        <div className="adaptation-count">
          <span className="count-number">{currentSession.adaptations.length}</span>
          <span className="count-label">adaptations</span>
        </div>
      </div>

      {/* Recent Adaptation Notification */}
      {showNotification && recentAdaptation && (
        <div className="adaptation-notification">
          <div className="notification-header">
            <span className="notification-icon">🔄</span>
            <span className="notification-title">Content Adapted!</span>
            <button 
              className="close-notification"
              onClick={() => setShowNotification(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="adaptation-details">
            <div className="adaptation-flow">
              <span className="from-type">
                {getContentTypeIcon(recentAdaptation.fromType)} {recentAdaptation.fromType}
              </span>
              <span className="arrow">→</span>
              <span className="to-type">
                {getContentTypeIcon(recentAdaptation.toType)} {recentAdaptation.toType}
              </span>
            </div>
            
            <div className="adaptation-reason">
              <span className="trigger-icon">{getTriggerIcon(recentAdaptation.trigger)}</span>
              <span className="reason-text">{recentAdaptation.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* Adaptation History */}
      {showHistory && currentSession.adaptations.length > 0 && (
        <div className="adaptation-history">
          <div className="history-header">
            <h4 className="history-title">Adaptation History</h4>
            <span className="history-count">
              {currentSession.adaptations.length} total
            </span>
          </div>
          
          <div className="history-list">
            {currentSession.adaptations.slice(-5).reverse().map((adaptation) => (
              <div key={adaptation.id} className="history-item">
                <div className="history-flow">
                  <span className="history-from">
                    {getContentTypeIcon(adaptation.fromType)}
                  </span>
                  <span className="history-arrow">→</span>
                  <span className="history-to">
                    {getContentTypeIcon(adaptation.toType)}
                  </span>
                </div>
                
                <div className="history-details">
                  <div className="history-trigger">
                    {getTriggerIcon(adaptation.trigger)} {adaptation.trigger}
                  </div>
                  <div className="history-time">
                    {formatTimestamp(adaptation.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {currentSession.adaptations.length > 5 && (
              <div className="history-more">
                +{currentSession.adaptations.length - 5} more adaptations
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adaptation Status */}
      <div className="adaptation-status">
        <div className="status-indicator">
          <div className={`status-dot ${currentSession.adaptations.length > 0 ? 'active' : 'inactive'}`}>
            <div className="dot-pulse"></div>
          </div>
          <span className="status-text">
            {currentSession.adaptations.length > 0 
              ? 'Adaptive learning active' 
              : 'Ready to adapt'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdaptationIndicator;

