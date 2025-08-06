import React, { useState, useRef, useEffect } from 'react';
import type { ContentItem } from '../../types';
import './InfographicContent.css';

interface InfographicContentProps {
  content: ContentItem;
}

interface InteractionPoint {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

const InfographicContent: React.FC<InfographicContentProps> = ({ content }) => {
  const [selectedPoint, setSelectedPoint] = useState<InteractionPoint | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock interaction points for demonstration
  const interactionPoints: InteractionPoint[] = [
    {
      id: '1',
      x: 25,
      y: 30,
      title: 'Key Concept 1',
      description: 'This represents the first major concept in our learning material. Click to explore more details about this topic.'
    },
    {
      id: '2',
      x: 60,
      y: 45,
      title: 'Important Data',
      description: 'Statistical information and data points that support the main learning objectives.'
    },
    {
      id: '3',
      x: 40,
      y: 70,
      title: 'Process Flow',
      description: 'Step-by-step process that illustrates how different components work together.'
    },
    {
      id: '4',
      x: 75,
      y: 25,
      title: 'Best Practices',
      description: 'Industry best practices and recommendations for implementing these concepts.'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelectedPoint(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Fallback for when infographic data is not properly structured
  if (typeof content.content === 'string') {
    return (
      <div className="infographic-content" data-testid="infographic-content">
        <div className="infographic-placeholder">
          <div className="placeholder-icon">📊</div>
          <h3>Infographic Content</h3>
          <p>Content: {content.content}</p>
          <p className="placeholder-note">
            This is a placeholder for infographic content. In a real implementation, 
            this would display interactive visual content with clickable elements.
          </p>
          
          {/* Mock interactive elements for demonstration */}
          <div className="mock-infographic">
            <div className="mock-section">
              <div className="mock-chart">📈</div>
              <h4>Data Visualization</h4>
              <p>Interactive charts and graphs</p>
            </div>
            <div className="mock-section">
              <div className="mock-diagram">🔄</div>
              <h4>Process Diagram</h4>
              <p>Step-by-step visual guide</p>
            </div>
            <div className="mock-section">
              <div className="mock-timeline">📅</div>
              <h4>Timeline</h4>
              <p>Historical progression</p>
            </div>
          </div>
        </div>
        
        <div className="infographic-info">
          <div className="engagement-score">
            <span>Engagement Score: {content.engagementScore}/10</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="infographic-content" data-testid="infographic-content" ref={containerRef}>
      <div className="infographic-header">
        <div className="view-controls">
          <button 
            className={`view-button ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            📋 Overview
          </button>
          <button 
            className={`view-button ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            🔍 Detailed
          </button>
        </div>
        
        <div className="zoom-controls">
          <button className="zoom-button" onClick={handleZoomOut}>➖</button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button className="zoom-button" onClick={handleZoomIn}>➕</button>
          <button className="reset-button" onClick={handleResetZoom}>Reset</button>
        </div>
      </div>
      
      <div className="infographic-container">
        <div 
          className="infographic-canvas"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Main infographic background */}
          <div className="infographic-background">
            <div className="bg-pattern">
              <div className="pattern-grid"></div>
              <div className="pattern-elements">
                <div className="element element-1">📚</div>
                <div className="element element-2">🧠</div>
                <div className="element element-3">💡</div>
                <div className="element element-4">🎯</div>
              </div>
            </div>
          </div>
          
          {/* Interactive points */}
          {interactionPoints.map((point) => (
            <div
              key={point.id}
              className={`interaction-point ${selectedPoint?.id === point.id ? 'active' : ''}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => setSelectedPoint(point)}
            >
              <div className="point-marker">
                <div className="point-pulse"></div>
                <div className="point-dot">+</div>
              </div>
              
              {selectedPoint?.id === point.id && (
                <div className="point-tooltip">
                  <div className="tooltip-header">
                    <h4>{point.title}</h4>
                    <button 
                      className="close-tooltip"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <p>{point.description}</p>
                </div>
              )}
            </div>
          ))}
          
          {/* Content sections based on view mode */}
          {viewMode === 'detailed' && (
            <div className="detailed-overlay">
              <div className="detail-section section-1">
                <h3>Learning Objectives</h3>
                <ul>
                  <li>Understand core concepts</li>
                  <li>Apply knowledge practically</li>
                  <li>Analyze complex scenarios</li>
                </ul>
              </div>
              
              <div className="detail-section section-2">
                <h3>Key Metrics</h3>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="metric-value">85%</span>
                    <span className="metric-label">Completion Rate</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">4.2</span>
                    <span className="metric-label">Avg. Rating</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="infographic-footer">
        <div className="interaction-guide">
          <span className="guide-text">💡 Click on the + markers to explore interactive content</span>
        </div>
        
        <div className="engagement-score">
          <span>Engagement Score: {content.engagementScore}/10</span>
        </div>
      </div>
    </div>
  );
};

export default InfographicContent;

