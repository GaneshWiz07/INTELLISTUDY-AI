import React from 'react';
import type { EngagementLevel } from '../../types';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import './EngagementControls.css';

interface EngagementControlsProps {
  className?: string;
  showLabels?: boolean;
}

const EngagementControls: React.FC<EngagementControlsProps> = ({ 
  className, 
  showLabels = true 
}) => {
  const { engagementLevel, updateEngagementLevel, adaptContent } = useLearningSession();

  const handleEngagementChange = (level: EngagementLevel) => {
    updateEngagementLevel(level);
    
    // Trigger content adaptation based on engagement level
    if (level === 'low') {
      adaptContent('engagement', `Low engagement detected - adapting content to be more engaging`);
    } else if (level === 'high') {
      adaptContent('engagement', `High engagement detected - maintaining current content approach`);
    }
  };

  const getEngagementIcon = (level: EngagementLevel) => {
    switch (level) {
      case 'high': return '🔥';
      case 'medium': return '👍';
      case 'low': return '😴';
      default: return '👍';
    }
  };

  const getEngagementColor = (level: EngagementLevel) => {
    switch (level) {
      case 'high': return '#28a745';
      case 'medium': return '#ffc107';
      case 'low': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const engagementLevels: EngagementLevel[] = ['high', 'medium', 'low'];

  return (
    <div className={`engagement-controls ${className || ''}`}>
      {showLabels && (
        <div className="controls-header">
          <h4 className="controls-title">How engaged are you feeling?</h4>
          <p className="controls-subtitle">
            Help us adapt the content to your current state
          </p>
        </div>
      )}
      
      <div className="engagement-buttons">
        {engagementLevels.map((level) => (
          <button
            key={level}
            className={`engagement-button ${engagementLevel === level ? 'active' : ''}`}
            onClick={() => handleEngagementChange(level)}
            style={{
              '--engagement-color': getEngagementColor(level)
            } as React.CSSProperties}
          >
            <div className="button-icon">
              {getEngagementIcon(level)}
            </div>
            <div className="button-content">
              <span className="button-level">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
              <span className="button-description">
                {level === 'high' && 'Fully focused and engaged'}
                {level === 'medium' && 'Moderately interested'}
                {level === 'low' && 'Struggling to focus'}
              </span>
            </div>
            {engagementLevel === level && (
              <div className="active-indicator">
                <div className="indicator-pulse"></div>
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="current-status">
        <div className="status-indicator">
          <span className="status-icon">{getEngagementIcon(engagementLevel)}</span>
          <span className="status-text">
            Current engagement: <strong>{engagementLevel}</strong>
          </span>
        </div>
        
        <div className="adaptation-hint">
          <span className="hint-icon">💡</span>
          <span className="hint-text">
            {engagementLevel === 'low' && 'Content will adapt to be more engaging'}
            {engagementLevel === 'medium' && 'Content is well-suited to your current state'}
            {engagementLevel === 'high' && 'Great! Keep up the momentum'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EngagementControls;

