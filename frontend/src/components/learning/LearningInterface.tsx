import React, { useEffect, useState } from 'react';
import { useLearningSession } from '../../contexts/LearningSessionContext';
import { useEngagement } from '../../contexts/EngagementContext';
import { AnimatedMeshBackground } from '../ui';
import type { ContentItem } from '../../types';
import ContentRenderer from './ContentRenderer';
import EngagementControls from './EngagementControls';
import AdaptationIndicator from './AdaptationIndicator';
import SessionProgress from './SessionProgress';
import './LearningInterface.css';

interface LearningInterfaceProps {
  className?: string;
}

const LearningInterface: React.FC<LearningInterfaceProps> = ({ className }) => {
  const { 
    isSessionActive, 
    startSession, 
    endSession, 
    evaluateAdaptation,
    currentSession 
  } = useLearningSession();
  
  const { 
    emotionState, 
    behaviorMetrics, 
    webcamEnabled 
  } = useEngagement();

  const [showControls, setShowControls] = useState(true);

  // Mock content for demonstration
  const mockContent: ContentItem[] = [
    {
      id: 'content_1',
      type: 'text',
      title: 'Introduction to Neuroadaptive Learning',
      content: {
        text: `Neuroadaptive learning represents a revolutionary approach to education that leverages real-time monitoring of learner states to dynamically adjust content delivery. This innovative methodology combines neuroscience, artificial intelligence, and educational psychology to create personalized learning experiences.

The core principle behind neuroadaptive learning is the recognition that each learner has unique cognitive patterns, emotional responses, and engagement levels that fluctuate throughout the learning process. Traditional one-size-fits-all educational approaches often fail to accommodate these individual differences, leading to suboptimal learning outcomes.

By continuously monitoring indicators such as attention levels, emotional states, and behavioral patterns, neuroadaptive systems can make real-time adjustments to content presentation, difficulty levels, and instructional strategies. This creates a feedback loop that optimizes the learning experience for each individual learner.

Key benefits of neuroadaptive learning include:
- Improved engagement and motivation
- Enhanced learning retention
- Reduced cognitive load
- Personalized learning paths
- Real-time performance optimization

The technology behind neuroadaptive learning typically involves multiple data streams including eye tracking, facial expression analysis, physiological monitoring, and behavioral pattern recognition. These inputs are processed by machine learning algorithms that can predict optimal content adaptations.`,
        readingTime: 15,
      },
      duration: 300,
      engagementScore: 7
    },
    {
      id: 'content_2',
      type: 'video',
      title: 'Neuroadaptive Learning in Action',
      content: {
        url: '/placeholder-video.mp4',
        thumbnail: '/placeholder-thumbnail.jpg',
        duration: 240
      },
      duration: 240,
      engagementScore: 8
    },
    {
      id: 'content_3',
      type: 'quiz',
      title: 'Understanding Neuroadaptive Concepts',
      content: {
        questions: [
          {
            id: 'q1',
            question: 'What is the primary goal of neuroadaptive learning systems?',
            options: [
              'To replace human teachers entirely',
              'To create personalized learning experiences through real-time adaptation',
              'To make learning more difficult for students',
              'To standardize education across all learners'
            ],
            correctAnswer: 1
          },
          {
            id: 'q2',
            question: 'Which of the following is NOT typically monitored in neuroadaptive learning?',
            options: [
              'Eye tracking patterns',
              'Emotional states',
              'Social media activity',
              'Behavioral patterns'
            ],
            correctAnswer: 2
          },
          {
            id: 'q3',
            question: 'What type of feedback loop does neuroadaptive learning create?',
            options: [
              'A delayed feedback system',
              'A real-time optimization loop',
              'A manual adjustment process',
              'A static content delivery system'
            ],
            correctAnswer: 1
          }
        ],
        timeLimit: 15
      },
      duration: 600,
      engagementScore: 9
    },
    {
      id: 'content_4',
      type: 'infographic',
      title: 'Neuroadaptive Learning Components',
      content: {
        title: 'Interactive visual representation of neuroadaptive learning system components and their relationships.',
        sections: [
          { title: 'System Overview', description: 'High-level view of the neuroadaptive learning system' },
          { title: 'Components', description: 'Individual system components and their functions' },
          { title: 'Relationships', description: 'How components interact with each other' },
        ],
      },
      duration: 180,
      engagementScore: 8
    }
  ];

  // Auto-evaluate adaptation based on engagement context changes
  useEffect(() => {
    if (isSessionActive && (emotionState || behaviorMetrics)) {
      const timer = setTimeout(() => {
        evaluateAdaptation(emotionState, behaviorMetrics);
      }, 2000); // Debounce evaluation

      return () => clearTimeout(timer);
    }
  }, [isSessionActive, emotionState, behaviorMetrics, evaluateAdaptation]);

  const handleStartSession = () => {
    startSession('demo_user', mockContent);
  };

  const handleEndSession = () => {
    endSession();
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (!isSessionActive) {
    return (
      <div className={`learning-interface ${className || ''} relative`}>
        <AnimatedMeshBackground variant="learning" intensity="medium" />
        <div className="session-start relative z-10">
          <div className="start-content">
            <div className="start-icon">🧠</div>
            <h2>Neuroadaptive Learning Session</h2>
            <p>
              Experience personalized learning that adapts to your engagement level, 
              emotional state, and learning preferences in real-time.
            </p>
            
            <div className="session-features">
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span className="feature-text">Real-time content adaptation</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Engagement monitoring</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔄</span>
                <span className="feature-text">Dynamic content switching</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📈</span>
                <span className="feature-text">Progress tracking</span>
              </div>
            </div>
            
            <button className="start-session-btn" onClick={handleStartSession}>
              Start Learning Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <AnimatedMeshBackground variant="learning" intensity="vibrant" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">Active Learning Session</h2>
            <p className="text-neutral-600">Content adapts based on your engagement and learning state</p>
          </div>
        
        <div className="interface-controls">
          <button 
            className="toggle-controls-btn"
            onClick={toggleControls}
            title={showControls ? 'Hide Controls' : 'Show Controls'}
          >
            {showControls ? '🔽' : '🔼'}
          </button>
          
          <button 
            className="end-session-btn"
            onClick={handleEndSession}
            title="End Session"
          >
            ⏹️ End Session
          </button>
        </div>
      </div>

      <div className="interface-body">
        <div className="main-content">
          <ContentRenderer className="content-area" />
        </div>

        {showControls && (
          <div className="controls-sidebar">
            <div className="control-section">
              <EngagementControls />
            </div>
            
            <div className="control-section">
              <AdaptationIndicator showHistory={false} />
            </div>
            
            <div className="control-section">
              <SessionProgress showDetails={false} />
            </div>
          </div>
        )}
      </div>

      {webcamEnabled && (
        <div className="webcam-status">
          <span className="webcam-icon">📹</span>
          <span className="webcam-text">Webcam monitoring active</span>
        </div>
      )}

      <div className="adaptation-status-bar">
        <div className="status-item">
          <span className="status-label">Session:</span>
          <span className="status-value">{currentSession?.id.slice(-8) || 'N/A'}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Adaptations:</span>
          <span className="status-value">{currentSession?.adaptations.length || 0}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Content:</span>
          <span className="status-value">{currentSession?.contentItems.length || 0} items</span>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LearningInterface;

