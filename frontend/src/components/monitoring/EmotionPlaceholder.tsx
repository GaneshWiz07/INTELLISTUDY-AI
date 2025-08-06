import React, { useState, useEffect } from 'react';
import { useEngagement } from '../../contexts/EngagementContext';
import './EmotionPlaceholder.css';

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

interface EmotionPlaceholderProps {
  onEmotionChange?: (emotion: EmotionData) => void;
  className?: string;
}

const emotionEmojis: Record<string, string> = {
  focused: '🎯',
  confused: '😕',
  bored: '😴',
  engaged: '😊',
  frustrated: '😤',
  neutral: '😐'
};

const emotionColors: Record<string, string> = {
  focused: '#27ae60',
  confused: '#f39c12',
  bored: '#95a5a6',
  engaged: '#3498db',
  frustrated: '#e74c3c',
  neutral: '#7f8c8d'
};

export const EmotionPlaceholder: React.FC<EmotionPlaceholderProps> = ({
  onEmotionChange,
  className = ''
}) => {
  const { emotionState, webcamEnabled } = useEngagement();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData>({
    emotion: 'neutral',
    confidence: 0.8,
    timestamp: new Date()
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate emotion detection processing
  useEffect(() => {
    if (webcamEnabled && emotionState) {
      setIsProcessing(true);
      
      // Simulate API processing delay
      const processingTimeout = setTimeout(() => {
        const newEmotion: EmotionData = {
          emotion: emotionState.primary,
          confidence: emotionState.confidence,
          timestamp: new Date()
        };
        
        setCurrentEmotion(newEmotion);
        setIsProcessing(false);
        
        if (onEmotionChange) {
          onEmotionChange(newEmotion);
        }
      }, 1000);

      return () => clearTimeout(processingTimeout);
    }
  }, [emotionState, webcamEnabled, onEmotionChange]);

  const getConfidenceLevel = (confidence: number): string => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  const getEmotionDescription = (emotion: string): string => {
    const descriptions: Record<string, string> = {
      focused: 'Student appears concentrated and attentive',
      confused: 'Student may need additional explanation',
      bored: 'Student seems disengaged, consider content adaptation',
      engaged: 'Student is actively participating and interested',
      frustrated: 'Student appears to be struggling, may need support',
      neutral: 'Student emotion is neutral or undetected'
    };
    return descriptions[emotion] || 'Emotion state unknown';
  };

  return (
    <div className={`emotion-placeholder ${className}`}>
      <div className="emotion-header">
        <h3>Emotion Detection</h3>
        <div className={`detection-status ${webcamEnabled ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          {webcamEnabled ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="emotion-content">
        {!webcamEnabled ? (
          <div className="emotion-disabled">
            <div className="disabled-icon">🤖</div>
            <p>Enable camera to detect emotions</p>
            <p className="api-note">Ready for emotion detection API integration</p>
          </div>
        ) : isProcessing ? (
          <div className="emotion-processing">
            <div className="processing-spinner"></div>
            <p>Analyzing facial expressions...</p>
          </div>
        ) : (
          <div className="emotion-result">
            <div className="emotion-display">
              <div 
                className="emotion-emoji"
                style={{ color: emotionColors[currentEmotion.emotion] }}
              >
                {emotionEmojis[currentEmotion.emotion] || '😐'}
              </div>
              <div className="emotion-info">
                <h4 className="emotion-name">
                  {currentEmotion.emotion.charAt(0).toUpperCase() + currentEmotion.emotion.slice(1)}
                </h4>
                <div className="confidence-display">
                  <span className="confidence-label">Confidence:</span>
                  <span 
                    className={`confidence-value ${getConfidenceLevel(currentEmotion.confidence)}`}
                  >
                    {formatConfidence(currentEmotion.confidence)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="emotion-description">
              <p>{getEmotionDescription(currentEmotion.emotion)}</p>
            </div>

            <div className="confidence-bar">
              <div className="confidence-label-bar">Confidence Level</div>
              <div className="confidence-track">
                <div 
                  className={`confidence-fill ${getConfidenceLevel(currentEmotion.confidence)}`}
                  style={{ width: `${currentEmotion.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="emotion-timestamp">
              Last updated: {currentEmotion.timestamp.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      <div className="api-integration-note">
        <div className="api-icon">🔌</div>
        <span>Ready for emotion detection API integration</span>
      </div>
    </div>
  );
};

